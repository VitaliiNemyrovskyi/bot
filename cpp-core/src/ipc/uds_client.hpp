#pragma once

/**
 * Unix Domain Socket Client
 *
 * Connects to the TypeScript execution engine's UDS server.
 * Sends and receives length-prefixed JSON messages matching the
 * existing IPC protocol (Phase 1: JSON over UDS).
 *
 * Wire format:
 *   [4 bytes] payload length (uint32 big-endian)
 *   [N bytes] JSON payload (UTF-8)
 *
 * Maximum payload: 1 MB.
 * Reconnection: exponential backoff (1s, 2s, 4s, ..., max 30s).
 */

#include <atomic>
#include <cstdint>
#include <deque>
#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <utility>

#include <boost/asio.hpp>
#include <nlohmann/json.hpp>

namespace bot {

namespace net = boost::asio;
using local_stream = net::local::stream_protocol;

// Maximum payload size (1 MB, matching TypeScript side)
constexpr uint32_t UDS_MAX_PAYLOAD_BYTES = 1024 * 1024;

// Callback for received messages
using UdsMessageCallback = std::function<void(const nlohmann::json& envelope)>;

struct UdsClientConfig {
    std::string socket_path;
    uint32_t reconnect_initial_ms = 1000;
    uint32_t reconnect_max_ms = 30000;
    uint32_t heartbeat_interval_ms = 5000;
};

class UdsClient {
public:
    explicit UdsClient(UdsClientConfig config);
    ~UdsClient();

    UdsClient(const UdsClient&) = delete;
    UdsClient& operator=(const UdsClient&) = delete;

    // Start connection (non-blocking, runs on provided io_context)
    void start(net::io_context& ioc);

    // Graceful shutdown
    void stop();

    // Send a JSON message (thread-safe, queues if not connected)
    void send(const nlohmann::json& envelope);

    // Send a typed event message with auto-generated envelope fields
    void send_event(
        const std::string& event_type,
        const nlohmann::json& payload,
        const std::string& correlation_id = ""
    );

    // Register callback for incoming messages
    void set_message_callback(UdsMessageCallback cb);

    // Check connection status
    bool is_connected() const;

private:
    // Connection state machine
    void do_connect();
    void do_read_header();
    void do_read_body(uint32_t payload_length);
    void do_write();

    // Reconnection
    void schedule_reconnect();

    // Frame encoding/decoding
    static std::vector<uint8_t> encode_frame(const std::string& json_str);

    UdsClientConfig config_;
    net::io_context* ioc_ = nullptr;

    // Socket
    std::unique_ptr<local_stream::socket> socket_;

    // Read state
    std::array<uint8_t, 4> header_buf_{};
    std::vector<uint8_t> body_buf_;

    // Write queue (thread-safe)
    mutable std::mutex write_mutex_;
    std::deque<std::vector<uint8_t>> write_queue_;
    bool write_in_progress_ = false;

    // Reconnect timer
    std::unique_ptr<net::steady_timer> reconnect_timer_;
    uint32_t reconnect_delay_ms_ = 0;

    // Heartbeat timer
    std::unique_ptr<net::steady_timer> heartbeat_timer_;

    // Message callback
    UdsMessageCallback message_callback_;

    // Sequence counter for outgoing messages
    std::atomic<uint64_t> seq_counter_{0};

    // Lifecycle
    std::atomic<bool> running_{false};
    std::atomic<bool> connected_{false};
};

}  // namespace bot
