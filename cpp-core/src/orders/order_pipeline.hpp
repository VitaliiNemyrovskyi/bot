#pragma once

/**
 * Order Submission Pipeline
 *
 * Handles the complete lifecycle of an order:
 *   1. Pre-trade slippage check against local book state
 *   2. HMAC-SHA256 authenticated REST API call to submit order
 *   3. Fill confirmation via REST polling
 *   4. Result reporting back via UDS
 *
 * Safety invariants:
 *   - Orders are never submitted if slippage exceeds threshold
 *   - All API calls have timeouts
 *   - Fill confirmation is mandatory before reporting success
 *   - Emergency close on excessive slippage
 */

#include <chrono>
#include <cstdint>
#include <functional>
#include <optional>
#include <string>
#include <utility>

#include <boost/asio.hpp>
#include <boost/asio/ssl.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <nlohmann/json.hpp>

#include "connectors/bybit_connector.hpp"
#include "time/time_sync.hpp"

namespace bot {

namespace net = boost::asio;
namespace ssl = net::ssl;
namespace beast = boost::beast;
namespace http = beast::http;

using tcp = net::ip::tcp;

// Order side
enum class OrderSide {
    Buy,
    Sell
};

// Order result status
enum class OrderStatus {
    New,
    PartiallyFilled,
    Filled,
    Cancelled,
    Rejected,
    Unknown
};

// Result of an order submission + confirmation
struct OrderResult {
    std::string order_id;
    std::string symbol;
    OrderSide side;
    double quantity = 0.0;
    double avg_fill_price = 0.0;
    double filled_quantity = 0.0;
    OrderStatus status = OrderStatus::Unknown;
    double fees = 0.0;
    std::string fee_currency;
    int64_t exchange_timestamp_ms = 0;
    // Slippage: positive means worse than expected
    double slippage_bps = 0.0;
    // Timing
    std::chrono::steady_clock::time_point submit_time;
    std::chrono::steady_clock::time_point confirm_time;
    int64_t round_trip_us = 0;
    // Error info (empty if successful)
    std::string error_code;
    std::string error_message;
};

// Callback to deliver order results
using OrderResultCallback = std::function<void(const OrderResult&)>;

struct OrderPipelineConfig {
    std::string rest_host;       // e.g. "api.bybit.com"
    uint16_t rest_port = 443;
    std::string api_key;
    std::string api_secret;
    // Slippage threshold in basis points (100 bps = 1%)
    double max_slippage_bps = 50.0;
    // Order submission timeout
    uint32_t submit_timeout_ms = 10000;
    // Fill confirmation: max retries and delay between retries
    uint32_t confirm_max_retries = 10;
    uint32_t confirm_retry_delay_ms = 500;
    // Receive window for Bybit API (milliseconds)
    uint32_t recv_window_ms = 5000;
};

class OrderPipeline {
public:
    OrderPipeline(
        OrderPipelineConfig config,
        BybitConnector& connector,
        TimeSync& time_sync
    );

    ~OrderPipeline() = default;

    OrderPipeline(const OrderPipeline&) = delete;
    OrderPipeline& operator=(const OrderPipeline&) = delete;

    // Submit a market order with pre-trade slippage check.
    // Returns the result synchronously (blocking).
    // This is designed to be called from the engine's command handler.
    OrderResult submit_market_order(
        const std::string& symbol,
        OrderSide side,
        double quantity,
        bool reduce_only = false
    );

    // Set callback for order results (used to report via UDS)
    void set_result_callback(OrderResultCallback cb);

    // Pre-trade slippage check only (does not submit)
    // Returns slippage in basis points, or empty if no price data
    std::optional<double> check_slippage(
        const std::string& symbol,
        OrderSide side,
        double intended_price
    ) const;

private:
    // HMAC-SHA256 signing for Bybit V5 authenticated endpoints
    std::string sign_request(
        int64_t timestamp_ms,
        const std::string& payload
    ) const;

    // Build Bybit V5 API timestamp
    int64_t api_timestamp_ms() const;

    // HTTP POST to authenticated Bybit endpoint
    nlohmann::json authenticated_post(
        const std::string& path,
        const nlohmann::json& body
    );

    // HTTP GET to authenticated Bybit endpoint
    nlohmann::json authenticated_get(
        const std::string& path,
        const std::string& query_string
    );

    // Confirm fill by polling /v5/order/realtime
    bool confirm_fill(const std::string& order_id, OrderResult& result);

    // Parse Bybit order status string
    static OrderStatus parse_status(const std::string& status_str);

    OrderPipelineConfig config_;
    BybitConnector& connector_;
    TimeSync& time_sync_;

    // SSL context for REST calls
    ssl::context ssl_ctx_{ssl::context::tlsv12_client};

    OrderResultCallback result_callback_;
};

}  // namespace bot
