#include "connectors/bybit_connector.hpp"

#include <iostream>
#include <sstream>

namespace bot {

BybitConnector::BybitConnector(Config config)
    : config_(std::move(config))
{
    // Initialize price state entries for all configured symbols
    for (const auto& sym : config_.symbols) {
        price_states_[sym] = SymbolPriceState{};
    }

    reconnect_delay_ms_ = config_.reconnect_initial_ms;

    // Configure SSL context
    ssl_ctx_.set_default_verify_paths();
    ssl_ctx_.set_verify_mode(ssl::verify_peer);
}

BybitConnector::~BybitConnector() {
    stop();
}

void BybitConnector::start() {
    if (running_.exchange(true)) {
        return;  // Already running
    }

    std::cout << "[BybitConnector] Starting connector for "
              << config_.symbols.size() << " symbols" << std::endl;

    // Start connection sequence
    do_resolve();

    // Run io_context on a dedicated thread
    io_thread_ = std::make_unique<std::thread>([this]() {
        try {
            ioc_.run();
        } catch (const std::exception& e) {
            std::cerr << "[BybitConnector] I/O thread exception: "
                      << e.what() << std::endl;
        }
    });
}

void BybitConnector::stop() {
    if (!running_.exchange(false)) {
        return;  // Already stopped
    }

    std::cout << "[BybitConnector] Stopping connector..." << std::endl;

    // Cancel pending timers
    boost::system::error_code ec;
    ping_timer_.cancel(ec);
    reconnect_timer_.cancel(ec);

    // Close WebSocket gracefully
    if (ws_ && connected_.load()) {
        ws_->async_close(websocket::close_code::normal,
            [](beast::error_code) {
                // Ignore close errors during shutdown
            });
    }

    // Stop the io_context (unblocks ioc_.run())
    ioc_.stop();

    // Join the I/O thread
    if (io_thread_ && io_thread_->joinable()) {
        io_thread_->join();
    }

    connected_.store(false);
    std::cout << "[BybitConnector] Stopped" << std::endl;
}

bool BybitConnector::is_connected() const {
    return connected_.load();
}

bool BybitConnector::get_price_state(
    const std::string& symbol,
    SymbolPriceState& out
) const {
    std::lock_guard<std::mutex> lock(state_mutex_);
    auto it = price_states_.find(symbol);
    if (it == price_states_.end()) {
        return false;
    }
    out = it->second;
    return true;
}

void BybitConnector::set_ticker_callback(TickerCallback cb) {
    ticker_callback_ = std::move(cb);
}

// ---------------------------------------------------------------------------
// Async connection state machine
// ---------------------------------------------------------------------------

void BybitConnector::do_resolve() {
    std::cout << "[BybitConnector] Resolving " << config_.ws_url << std::endl;

    resolver_.async_resolve(
        config_.ws_url,
        std::to_string(config_.ws_port),
        [this](beast::error_code ec, tcp::resolver::results_type results) {
            if (ec) {
                std::cerr << "[BybitConnector] Resolve failed: "
                          << ec.message() << std::endl;
                schedule_reconnect();
                return;
            }
            do_connect(std::move(results));
        });
}

void BybitConnector::do_connect(tcp::resolver::results_type results) {
    // Create a fresh WebSocket stream for this connection attempt
    ws_ = std::make_unique<websocket::stream<
        beast::ssl_stream<beast::tcp_stream>>>(ioc_, ssl_ctx_);

    // Set SNI hostname (required for most TLS servers)
    if (!SSL_set_tlsext_host_name(
            ws_->next_layer().native_handle(),
            config_.ws_url.c_str())) {
        std::cerr << "[BybitConnector] Failed to set SNI hostname" << std::endl;
        schedule_reconnect();
        return;
    }

    // Set TCP connect timeout
    beast::get_lowest_layer(*ws_).expires_after(std::chrono::seconds(10));

    beast::get_lowest_layer(*ws_).async_connect(
        results,
        [this](beast::error_code ec,
               tcp::resolver::results_type::endpoint_type /*ep*/) {
            if (ec) {
                std::cerr << "[BybitConnector] TCP connect failed: "
                          << ec.message() << std::endl;
                schedule_reconnect();
                return;
            }
            do_ssl_handshake();
        });
}

void BybitConnector::do_ssl_handshake() {
    beast::get_lowest_layer(*ws_).expires_after(std::chrono::seconds(10));

    ws_->next_layer().async_handshake(
        ssl::stream_base::client,
        [this](beast::error_code ec) {
            if (ec) {
                std::cerr << "[BybitConnector] SSL handshake failed: "
                          << ec.message() << std::endl;
                schedule_reconnect();
                return;
            }
            do_ws_handshake();
        });
}

void BybitConnector::do_ws_handshake() {
    // Remove timeout for WebSocket operations (Beast manages its own)
    beast::get_lowest_layer(*ws_).expires_never();

    // Set WebSocket options
    ws_->set_option(websocket::stream_base::timeout::suggested(
        beast::role_type::client));
    ws_->set_option(websocket::stream_base::decorator(
        [this](websocket::request_type& req) {
            req.set(http::field::host, config_.ws_url);
            req.set(http::field::user_agent, "bot-engine/0.1.0");
        }));

    ws_->async_handshake(
        config_.ws_url,
        config_.ws_path,
        [this](beast::error_code ec) {
            if (ec) {
                std::cerr << "[BybitConnector] WebSocket handshake failed: "
                          << ec.message() << std::endl;
                schedule_reconnect();
                return;
            }

            std::cout << "[BybitConnector] WebSocket connected to "
                      << config_.ws_url << config_.ws_path << std::endl;

            connected_.store(true);
            // Reset backoff on successful connection
            reconnect_delay_ms_ = config_.reconnect_initial_ms;

            do_subscribe();
            do_read();
            do_ping();
        });
}

void BybitConnector::do_subscribe() {
    // Build Bybit V5 subscription message
    nlohmann::json sub_msg;
    sub_msg["op"] = "subscribe";
    sub_msg["args"] = nlohmann::json::array();

    for (const auto& symbol : config_.symbols) {
        sub_msg["args"].push_back("tickers." + symbol);
    }

    std::string msg = sub_msg.dump();
    std::cout << "[BybitConnector] Subscribing: " << msg << std::endl;

    // Send subscription message
    auto shared_msg = std::make_shared<std::string>(std::move(msg));
    ws_->async_write(
        net::buffer(*shared_msg),
        [shared_msg](beast::error_code ec, std::size_t /*bytes*/) {
            if (ec) {
                std::cerr << "[BybitConnector] Subscribe write failed: "
                          << ec.message() << std::endl;
            }
        });
}

void BybitConnector::do_read() {
    ws_->async_read(
        read_buffer_,
        [this](beast::error_code ec, std::size_t /*bytes*/) {
            if (ec) {
                if (ec == websocket::error::closed) {
                    std::cout << "[BybitConnector] WebSocket closed normally"
                              << std::endl;
                } else {
                    std::cerr << "[BybitConnector] Read error: "
                              << ec.message() << std::endl;
                }
                connected_.store(false);
                if (running_.load()) {
                    schedule_reconnect();
                }
                return;
            }

            // Extract message as string
            std::string msg = beast::buffers_to_string(read_buffer_.data());
            read_buffer_.consume(read_buffer_.size());

            // Process on I/O thread (lightweight parsing only)
            on_message(msg);

            // Continue reading
            if (running_.load() && connected_.load()) {
                do_read();
            }
        });
}

void BybitConnector::on_message(const std::string& msg) {
    try {
        auto json = nlohmann::json::parse(msg);

        // Handle subscription confirmation
        if (json.contains("op") && json["op"] == "subscribe") {
            bool success = json.value("success", false);
            std::cout << "[BybitConnector] Subscription "
                      << (success ? "confirmed" : "FAILED")
                      << std::endl;
            return;
        }

        // Handle pong response
        if (json.contains("op") && json["op"] == "pong") {
            return;
        }

        // Handle ticker data
        if (json.contains("topic") && json.contains("data")) {
            std::string topic = json["topic"].get<std::string>();
            if (topic.rfind("tickers.", 0) == 0) {
                parse_ticker(json["data"], topic);
            }
        }
    } catch (const nlohmann::json::exception& e) {
        std::cerr << "[BybitConnector] JSON parse error: " << e.what()
                  << std::endl;
    }
}

void BybitConnector::parse_ticker(
    const nlohmann::json& data,
    const std::string& topic
) {
    // Extract symbol from topic "tickers.BTCUSDT"
    std::string symbol = topic.substr(8);  // Skip "tickers."

    // Extract bid/ask from Bybit V5 ticker format
    // Fields may be missing in "delta" messages (only changed fields present)
    double bid_price = 0.0;
    double ask_price = 0.0;
    double bid_qty = 0.0;
    double ask_qty = 0.0;
    bool has_bid = false;
    bool has_ask = false;

    if (data.contains("bid1Price") && !data["bid1Price"].is_null()) {
        const auto& val = data["bid1Price"];
        bid_price = val.is_string()
            ? std::stod(val.get<std::string>())
            : val.get<double>();
        has_bid = true;
    }
    if (data.contains("ask1Price") && !data["ask1Price"].is_null()) {
        const auto& val = data["ask1Price"];
        ask_price = val.is_string()
            ? std::stod(val.get<std::string>())
            : val.get<double>();
        has_ask = true;
    }
    if (data.contains("bid1Size") && !data["bid1Size"].is_null()) {
        const auto& val = data["bid1Size"];
        bid_qty = val.is_string()
            ? std::stod(val.get<std::string>())
            : val.get<double>();
    }
    if (data.contains("ask1Size") && !data["ask1Size"].is_null()) {
        const auto& val = data["ask1Size"];
        ask_qty = val.is_string()
            ? std::stod(val.get<std::string>())
            : val.get<double>();
    }

    // Update local state
    {
        std::lock_guard<std::mutex> lock(state_mutex_);
        auto it = price_states_.find(symbol);
        if (it == price_states_.end()) {
            return;  // Unknown symbol, skip
        }

        auto& state = it->second;
        // Only update fields that were present in the message (delta updates)
        if (has_bid) {
            state.bid_price = bid_price;
            state.bid_qty = bid_qty;
        }
        if (has_ask) {
            state.ask_price = ask_price;
            state.ask_qty = ask_qty;
        }
        state.last_update = std::chrono::steady_clock::now();
        state.update_count++;

        // Invoke callback with updated state
        if (ticker_callback_) {
            ticker_callback_(symbol, state);
        }
    }
}

void BybitConnector::do_ping() {
    if (!running_.load() || !connected_.load()) {
        return;
    }

    ping_timer_.expires_after(
        std::chrono::milliseconds(config_.ping_interval_ms));
    ping_timer_.async_wait([this](beast::error_code ec) {
        if (ec || !running_.load() || !connected_.load()) {
            return;
        }

        // Bybit expects a JSON ping message
        nlohmann::json ping_msg;
        ping_msg["op"] = "ping";
        std::string msg = ping_msg.dump();

        auto shared_msg = std::make_shared<std::string>(std::move(msg));
        ws_->async_write(
            net::buffer(*shared_msg),
            [this, shared_msg](beast::error_code ec, std::size_t /*bytes*/) {
                if (ec) {
                    std::cerr << "[BybitConnector] Ping write failed: "
                              << ec.message() << std::endl;
                    return;
                }
                // Schedule next ping
                do_ping();
            });
    });
}

// ---------------------------------------------------------------------------
// Reconnection
// ---------------------------------------------------------------------------

void BybitConnector::schedule_reconnect() {
    if (!running_.load()) {
        return;
    }

    std::cout << "[BybitConnector] Reconnecting in "
              << reconnect_delay_ms_ << "ms..." << std::endl;

    reconnect_timer_.expires_after(
        std::chrono::milliseconds(reconnect_delay_ms_));
    reconnect_timer_.async_wait([this](beast::error_code ec) {
        if (ec || !running_.load()) {
            return;
        }
        do_reconnect();
    });

    // Exponential backoff: double delay, cap at max
    reconnect_delay_ms_ = std::min(
        reconnect_delay_ms_ * 2,
        config_.reconnect_max_ms);
}

void BybitConnector::do_reconnect() {
    // Reset connection state
    ws_.reset();
    read_buffer_.consume(read_buffer_.size());
    connected_.store(false);

    // Start fresh connection
    do_resolve();
}

}  // namespace bot
