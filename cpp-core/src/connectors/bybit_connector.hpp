#pragma once

/**
 * Bybit V5 WebSocket Connector
 *
 * Connects to Bybit public linear futures WebSocket and subscribes to
 * ticker streams for configurable symbols. Maintains local best-bid/ask
 * state per symbol for the order pipeline's slippage check.
 *
 * Reconnection: exponential backoff (1s, 2s, 4s, ..., max 30s).
 * Thread model: runs its own io_context on a dedicated thread.
 */

#include <atomic>
#include <chrono>
#include <cstdint>
#include <functional>
#include <map>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <utility>
#include <vector>

#include <boost/asio.hpp>
#include <boost/asio/ssl.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <nlohmann/json.hpp>

namespace bot {

namespace net = boost::asio;
namespace ssl = net::ssl;
namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace http = beast::http;

using tcp = net::ip::tcp;

// Per-symbol price state updated from WebSocket ticker stream
struct SymbolPriceState {
    double bid_price = 0.0;
    double ask_price = 0.0;
    double bid_qty = 0.0;
    double ask_qty = 0.0;
    std::chrono::steady_clock::time_point last_update{};
    uint64_t update_count = 0;
};

// Callback invoked on every ticker update
using TickerCallback = std::function<void(
    const std::string& symbol,
    const SymbolPriceState& state
)>;

class BybitConnector {
public:
    struct Config {
        std::string ws_url;       // e.g. "stream.bybit.com"
        std::string ws_path;      // e.g. "/v5/public/linear"
        uint16_t ws_port = 443;
        std::vector<std::string> symbols;
        // Reconnection parameters
        uint32_t reconnect_initial_ms = 1000;
        uint32_t reconnect_max_ms = 30000;
        // Ping interval to keep connection alive
        uint32_t ping_interval_ms = 20000;
    };

    explicit BybitConnector(Config config);
    ~BybitConnector();

    // Non-copyable, non-movable (owns threads and I/O resources)
    BybitConnector(const BybitConnector&) = delete;
    BybitConnector& operator=(const BybitConnector&) = delete;

    // Start the connector (spawns I/O thread, connects, subscribes)
    void start();

    // Graceful shutdown: close WebSocket, join thread
    void stop();

    // Check if WebSocket is currently connected
    bool is_connected() const;

    // Get current price state for a symbol (thread-safe snapshot)
    bool get_price_state(const std::string& symbol, SymbolPriceState& out) const;

    // Register callback for ticker updates
    void set_ticker_callback(TickerCallback cb);

    // Get all tracked symbols
    const std::vector<std::string>& symbols() const { return config_.symbols; }

private:
    // Asynchronous connection state machine
    void do_resolve();
    void do_connect(tcp::resolver::results_type results);
    void do_ssl_handshake();
    void do_ws_handshake();
    void do_subscribe();
    void do_read();
    void on_message(const std::string& msg);
    void do_ping();

    // Reconnection with exponential backoff
    void schedule_reconnect();
    void do_reconnect();

    // Parse Bybit V5 ticker message
    void parse_ticker(const nlohmann::json& data, const std::string& topic);

    Config config_;

    // Boost.Asio I/O context and its dedicated thread
    net::io_context ioc_;
    std::unique_ptr<std::thread> io_thread_;

    // SSL + WebSocket stack
    ssl::context ssl_ctx_{ssl::context::tlsv12_client};
    std::unique_ptr<websocket::stream<beast::ssl_stream<beast::tcp_stream>>> ws_;
    tcp::resolver resolver_{ioc_};
    beast::flat_buffer read_buffer_;

    // Ping timer
    net::steady_timer ping_timer_{ioc_};

    // Reconnect timer and backoff state
    net::steady_timer reconnect_timer_{ioc_};
    uint32_t reconnect_delay_ms_ = 0;

    // Price state per symbol, protected by mutex
    mutable std::mutex state_mutex_;
    std::map<std::string, SymbolPriceState> price_states_;

    // Ticker callback
    TickerCallback ticker_callback_;

    // Lifecycle flags
    std::atomic<bool> running_{false};
    std::atomic<bool> connected_{false};
};

}  // namespace bot
