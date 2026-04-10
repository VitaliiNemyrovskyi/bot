#include "orders/order_pipeline.hpp"

#include <cmath>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <thread>

#include <openssl/hmac.h>
#include <openssl/sha.h>

namespace bot {

OrderPipeline::OrderPipeline(
    OrderPipelineConfig config,
    BybitConnector& connector,
    TimeSync& time_sync
)
    : config_(std::move(config))
    , connector_(connector)
    , time_sync_(time_sync)
{
    ssl_ctx_.set_default_verify_paths();
    ssl_ctx_.set_verify_mode(ssl::verify_peer);
}

void OrderPipeline::set_result_callback(OrderResultCallback cb) {
    result_callback_ = std::move(cb);
}

// ---------------------------------------------------------------------------
// Pre-trade slippage check
// ---------------------------------------------------------------------------

std::optional<double> OrderPipeline::check_slippage(
    const std::string& symbol,
    OrderSide side,
    double intended_price
) const {
    SymbolPriceState state;
    if (!connector_.get_price_state(symbol, state)) {
        return std::nullopt;  // No price data available
    }

    // Check for stale data (no update in last 5 seconds)
    auto age = std::chrono::steady_clock::now() - state.last_update;
    if (age > std::chrono::seconds(5)) {
        std::cerr << "[OrderPipeline] WARNING: Price data for " << symbol
                  << " is stale (age="
                  << std::chrono::duration_cast<std::chrono::seconds>(age).count()
                  << "s)" << std::endl;
        return std::nullopt;
    }

    // For a buy order, we compare against the ask (what we'd actually pay)
    // For a sell order, we compare against the bid (what we'd actually receive)
    double market_price = (side == OrderSide::Buy) ? state.ask_price : state.bid_price;

    if (market_price <= 0.0 || intended_price <= 0.0) {
        return std::nullopt;
    }

    // Slippage in basis points
    double slippage_bps = 0.0;
    if (side == OrderSide::Buy) {
        // Buying: positive slippage if market price is above intended
        slippage_bps = (market_price - intended_price) / intended_price * 10000.0;
    } else {
        // Selling: positive slippage if market price is below intended
        slippage_bps = (intended_price - market_price) / intended_price * 10000.0;
    }

    return slippage_bps;
}

// ---------------------------------------------------------------------------
// Order submission
// ---------------------------------------------------------------------------

OrderResult OrderPipeline::submit_market_order(
    const std::string& symbol,
    OrderSide side,
    double quantity,
    bool reduce_only
) {
    OrderResult result;
    result.symbol = symbol;
    result.side = side;
    result.quantity = quantity;
    result.submit_time = std::chrono::steady_clock::now();

    std::cout << "[OrderPipeline] Submitting market "
              << (side == OrderSide::Buy ? "BUY" : "SELL")
              << " order: symbol=" << symbol
              << " qty=" << quantity
              << " reduce_only=" << (reduce_only ? "true" : "false")
              << std::endl;

    // Pre-trade slippage check (use current market price as intended)
    SymbolPriceState price_state;
    if (connector_.get_price_state(symbol, price_state)) {
        double intended = (side == OrderSide::Buy)
            ? price_state.ask_price
            : price_state.bid_price;

        auto slippage = check_slippage(symbol, side, intended);
        if (slippage.has_value() && std::abs(*slippage) > config_.max_slippage_bps) {
            result.status = OrderStatus::Rejected;
            result.error_code = "slippage_exceeded";
            result.error_message = "Pre-trade slippage check failed: "
                + std::to_string(*slippage) + " bps exceeds max "
                + std::to_string(config_.max_slippage_bps) + " bps";
            std::cerr << "[OrderPipeline] " << result.error_message << std::endl;

            if (result_callback_) {
                result_callback_(result);
            }
            return result;
        }
    } else {
        std::cerr << "[OrderPipeline] WARNING: No price data for " << symbol
                  << "; proceeding without slippage check" << std::endl;
    }

    // Build order request body
    nlohmann::json body;
    body["category"] = "linear";
    body["symbol"] = symbol;
    body["side"] = (side == OrderSide::Buy) ? "Buy" : "Sell";
    body["orderType"] = "Market";
    body["qty"] = std::to_string(quantity);
    if (reduce_only) {
        body["reduceOnly"] = true;
    }

    try {
        // Submit order via REST API
        auto response = authenticated_post("/v5/order/create", body);

        if (!response.contains("retCode") ||
            response["retCode"].get<int>() != 0) {
            result.status = OrderStatus::Rejected;
            result.error_code = "exchange.order_rejected";
            result.error_message = response.value("retMsg", "Unknown error");
            std::cerr << "[OrderPipeline] Order rejected by exchange: "
                      << result.error_message << std::endl;

            if (result_callback_) {
                result_callback_(result);
            }
            return result;
        }

        // Extract order ID from response
        if (response.contains("result") &&
            response["result"].contains("orderId")) {
            result.order_id = response["result"]["orderId"].get<std::string>();
        }

        std::cout << "[OrderPipeline] Order submitted: id=" << result.order_id
                  << std::endl;

        // Confirm fill
        if (!confirm_fill(result.order_id, result)) {
            std::cerr << "[OrderPipeline] Fill confirmation failed for order "
                      << result.order_id << std::endl;
            // Order was submitted but we could not confirm the fill
            // This is a dangerous state -- report it clearly
            result.error_code = "exchange.fill_confirm_timeout";
            result.error_message = "Order submitted but fill confirmation timed out";
        }

    } catch (const std::exception& e) {
        result.status = OrderStatus::Unknown;
        result.error_code = "exchange.unreachable";
        result.error_message = std::string("Order submission failed: ") + e.what();
        std::cerr << "[OrderPipeline] " << result.error_message << std::endl;
    }

    result.confirm_time = std::chrono::steady_clock::now();
    result.round_trip_us = std::chrono::duration_cast<std::chrono::microseconds>(
        result.confirm_time - result.submit_time
    ).count();

    // Compute actual slippage vs market price at submission time
    if (price_state.bid_price > 0.0 && result.avg_fill_price > 0.0) {
        double ref_price = (side == OrderSide::Buy)
            ? price_state.ask_price
            : price_state.bid_price;
        if (ref_price > 0.0) {
            if (side == OrderSide::Buy) {
                result.slippage_bps =
                    (result.avg_fill_price - ref_price) / ref_price * 10000.0;
            } else {
                result.slippage_bps =
                    (ref_price - result.avg_fill_price) / ref_price * 10000.0;
            }
        }
    }

    std::cout << "[OrderPipeline] Order complete: id=" << result.order_id
              << " status=" << static_cast<int>(result.status)
              << " fill_price=" << result.avg_fill_price
              << " slippage=" << result.slippage_bps << "bps"
              << " rtt=" << result.round_trip_us << "us" << std::endl;

    if (result_callback_) {
        result_callback_(result);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Fill confirmation
// ---------------------------------------------------------------------------

bool OrderPipeline::confirm_fill(
    const std::string& order_id,
    OrderResult& result
) {
    for (uint32_t attempt = 0; attempt < config_.confirm_max_retries; ++attempt) {
        try {
            std::string query = "category=linear&orderId=" + order_id;
            auto response = authenticated_get("/v5/order/realtime", query);

            if (!response.contains("result") ||
                !response["result"].contains("list")) {
                std::this_thread::sleep_for(
                    std::chrono::milliseconds(config_.confirm_retry_delay_ms));
                continue;
            }

            auto& list = response["result"]["list"];
            if (list.empty()) {
                std::this_thread::sleep_for(
                    std::chrono::milliseconds(config_.confirm_retry_delay_ms));
                continue;
            }

            auto& order = list[0];
            std::string status_str = order.value("orderStatus", "");
            result.status = parse_status(status_str);

            if (order.contains("avgPrice") && !order["avgPrice"].is_null()) {
                const auto& val = order["avgPrice"];
                result.avg_fill_price = val.is_string()
                    ? std::stod(val.get<std::string>())
                    : val.get<double>();
            }
            if (order.contains("cumExecQty") && !order["cumExecQty"].is_null()) {
                const auto& val = order["cumExecQty"];
                result.filled_quantity = val.is_string()
                    ? std::stod(val.get<std::string>())
                    : val.get<double>();
            }
            if (order.contains("cumExecFee") && !order["cumExecFee"].is_null()) {
                const auto& val = order["cumExecFee"];
                result.fees = val.is_string()
                    ? std::stod(val.get<std::string>())
                    : val.get<double>();
            }
            if (order.contains("createdTime") && !order["createdTime"].is_null()) {
                const auto& val = order["createdTime"];
                result.exchange_timestamp_ms = val.is_string()
                    ? std::stoll(val.get<std::string>())
                    : val.get<int64_t>();
            }

            // Terminal states
            if (result.status == OrderStatus::Filled ||
                result.status == OrderStatus::Cancelled ||
                result.status == OrderStatus::Rejected) {
                return true;
            }

        } catch (const std::exception& e) {
            std::cerr << "[OrderPipeline] Fill confirm error (attempt "
                      << (attempt + 1) << "): " << e.what() << std::endl;
        }

        std::this_thread::sleep_for(
            std::chrono::milliseconds(config_.confirm_retry_delay_ms));
    }

    return false;
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 signing
// ---------------------------------------------------------------------------

std::string OrderPipeline::sign_request(
    int64_t timestamp_ms,
    const std::string& payload
) const {
    // Bybit V5 signing: HMAC-SHA256(apiSecret, timestamp + apiKey + recvWindow + payload)
    std::string sign_str = std::to_string(timestamp_ms)
        + config_.api_key
        + std::to_string(config_.recv_window_ms)
        + payload;

    unsigned char hmac_result[EVP_MAX_MD_SIZE];
    unsigned int hmac_len = 0;

    HMAC(
        EVP_sha256(),
        config_.api_secret.c_str(),
        static_cast<int>(config_.api_secret.size()),
        reinterpret_cast<const unsigned char*>(sign_str.c_str()),
        sign_str.size(),
        hmac_result,
        &hmac_len
    );

    // Convert to hex string
    std::ostringstream ss;
    ss << std::hex << std::setfill('0');
    for (unsigned int i = 0; i < hmac_len; ++i) {
        ss << std::setw(2) << static_cast<int>(hmac_result[i]);
    }
    return ss.str();
}

int64_t OrderPipeline::api_timestamp_ms() const {
    return time_sync_.exchange_now_ms();
}

// ---------------------------------------------------------------------------
// Authenticated HTTP calls
// ---------------------------------------------------------------------------

nlohmann::json OrderPipeline::authenticated_post(
    const std::string& path,
    const nlohmann::json& body
) {
    net::io_context ioc;
    ssl::context ssl_ctx{ssl::context::tlsv12_client};
    ssl_ctx.set_default_verify_paths();
    ssl_ctx.set_verify_mode(ssl::verify_peer);

    tcp::resolver resolver{ioc};
    beast::ssl_stream<beast::tcp_stream> stream{ioc, ssl_ctx};

    if (!SSL_set_tlsext_host_name(
            stream.native_handle(),
            config_.rest_host.c_str())) {
        throw std::runtime_error("Failed to set SNI hostname");
    }

    auto const results = resolver.resolve(
        config_.rest_host, std::to_string(config_.rest_port));
    beast::get_lowest_layer(stream).expires_after(
        std::chrono::milliseconds(config_.submit_timeout_ms));
    beast::get_lowest_layer(stream).connect(results);

    stream.handshake(ssl::stream_base::client);

    // Build signed request
    std::string body_str = body.dump();
    int64_t timestamp = api_timestamp_ms();
    std::string signature = sign_request(timestamp, body_str);

    http::request<http::string_body> req{http::verb::post, path, 11};
    req.set(http::field::host, config_.rest_host);
    req.set(http::field::content_type, "application/json");
    req.set(http::field::user_agent, "bot-engine/0.1.0");
    req.set("X-BAPI-API-KEY", config_.api_key);
    req.set("X-BAPI-SIGN", signature);
    req.set("X-BAPI-SIGN-TYPE", "2");
    req.set("X-BAPI-TIMESTAMP", std::to_string(timestamp));
    req.set("X-BAPI-RECV-WINDOW", std::to_string(config_.recv_window_ms));
    req.body() = body_str;
    req.prepare_payload();

    http::write(stream, req);

    beast::flat_buffer buffer;
    http::response<http::string_body> res;
    http::read(stream, buffer, res);

    // Graceful SSL shutdown
    beast::error_code ec;
    stream.shutdown(ec);

    return nlohmann::json::parse(res.body());
}

nlohmann::json OrderPipeline::authenticated_get(
    const std::string& path,
    const std::string& query_string
) {
    net::io_context ioc;
    ssl::context ssl_ctx{ssl::context::tlsv12_client};
    ssl_ctx.set_default_verify_paths();
    ssl_ctx.set_verify_mode(ssl::verify_peer);

    tcp::resolver resolver{ioc};
    beast::ssl_stream<beast::tcp_stream> stream{ioc, ssl_ctx};

    if (!SSL_set_tlsext_host_name(
            stream.native_handle(),
            config_.rest_host.c_str())) {
        throw std::runtime_error("Failed to set SNI hostname");
    }

    auto const results = resolver.resolve(
        config_.rest_host, std::to_string(config_.rest_port));
    beast::get_lowest_layer(stream).expires_after(
        std::chrono::milliseconds(config_.submit_timeout_ms));
    beast::get_lowest_layer(stream).connect(results);

    stream.handshake(ssl::stream_base::client);

    // Build signed request
    int64_t timestamp = api_timestamp_ms();
    std::string signature = sign_request(timestamp, query_string);

    std::string target = path;
    if (!query_string.empty()) {
        target += "?" + query_string;
    }

    http::request<http::empty_body> req{http::verb::get, target, 11};
    req.set(http::field::host, config_.rest_host);
    req.set(http::field::user_agent, "bot-engine/0.1.0");
    req.set("X-BAPI-API-KEY", config_.api_key);
    req.set("X-BAPI-SIGN", signature);
    req.set("X-BAPI-SIGN-TYPE", "2");
    req.set("X-BAPI-TIMESTAMP", std::to_string(timestamp));
    req.set("X-BAPI-RECV-WINDOW", std::to_string(config_.recv_window_ms));

    http::write(stream, req);

    beast::flat_buffer buffer;
    http::response<http::string_body> res;
    http::read(stream, buffer, res);

    beast::error_code ec;
    stream.shutdown(ec);

    return nlohmann::json::parse(res.body());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

OrderStatus OrderPipeline::parse_status(const std::string& status_str) {
    if (status_str == "New" || status_str == "Created") {
        return OrderStatus::New;
    }
    if (status_str == "PartiallyFilled") {
        return OrderStatus::PartiallyFilled;
    }
    if (status_str == "Filled") {
        return OrderStatus::Filled;
    }
    if (status_str == "Cancelled" || status_str == "Deactivated") {
        return OrderStatus::Cancelled;
    }
    if (status_str == "Rejected") {
        return OrderStatus::Rejected;
    }
    return OrderStatus::Unknown;
}

}  // namespace bot
