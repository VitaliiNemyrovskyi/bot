#include "ipc/uds_client.hpp"

#include <chrono>
#include <iostream>

// UUID generation helper (simple random-based)
#include <random>
#include <sstream>

namespace bot {

namespace {

// Generate a UUID v4 string
std::string generate_uuid() {
    static thread_local std::mt19937 rng(
        static_cast<unsigned>(
            std::chrono::steady_clock::now().time_since_epoch().count()));
    std::uniform_int_distribution<uint32_t> dist(0, 0xFFFFFFFF);

    uint32_t a = dist(rng);
    uint32_t b = dist(rng);
    uint32_t c = dist(rng);
    uint32_t d = dist(rng);

    // Set version (4) and variant bits
    b = (b & 0xFFFF0FFF) | 0x00004000;
    c = (c & 0x3FFFFFFF) | 0x80000000;

    char buf[37];
    snprintf(buf, sizeof(buf),
        "%08x-%04x-%04x-%04x-%04x%08x",
        a,
        (b >> 16) & 0xFFFF,
        b & 0xFFFF,
        (c >> 16) & 0xFFFF,
        c & 0xFFFF,
        d);
    return std::string(buf);
}

}  // namespace

UdsClient::UdsClient(UdsClientConfig config)
    : config_(std::move(config))
{
    reconnect_delay_ms_ = config_.reconnect_initial_ms;
}

UdsClient::~UdsClient() {
    stop();
}

void UdsClient::start(net::io_context& ioc) {
    if (running_.exchange(true)) {
        return;
    }

    ioc_ = &ioc;
    reconnect_timer_ = std::make_unique<net::steady_timer>(ioc);
    heartbeat_timer_ = std::make_unique<net::steady_timer>(ioc);

    std::cout << "[UdsClient] Connecting to " << config_.socket_path
              << std::endl;

    do_connect();
}

void UdsClient::stop() {
    if (!running_.exchange(false)) {
        return;
    }

    if (reconnect_timer_) {
        boost::system::error_code ec;
        reconnect_timer_->cancel(ec);
    }
    if (heartbeat_timer_) {
        boost::system::error_code ec;
        heartbeat_timer_->cancel(ec);
    }
    if (socket_ && socket_->is_open()) {
        boost::system::error_code ec;
        socket_->close(ec);
    }

    connected_.store(false);
    std::cout << "[UdsClient] Stopped" << std::endl;
}

bool UdsClient::is_connected() const {
    return connected_.load();
}

void UdsClient::set_message_callback(UdsMessageCallback cb) {
    message_callback_ = std::move(cb);
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

void UdsClient::send(const nlohmann::json& envelope) {
    auto frame = encode_frame(envelope.dump());

    std::lock_guard<std::mutex> lock(write_mutex_);
    write_queue_.push_back(std::move(frame));

    if (connected_.load() && !write_in_progress_) {
        // Post write to io_context thread
        net::post(*ioc_, [this]() { do_write(); });
    }
}

void UdsClient::send_event(
    const std::string& event_type,
    const nlohmann::json& payload,
    const std::string& correlation_id
) {
    nlohmann::json envelope;
    envelope["seq"] = seq_counter_.fetch_add(1);

    // Nanosecond timestamp as string (matching TypeScript protocol)
    auto now = std::chrono::steady_clock::now();
    auto ns = std::chrono::duration_cast<std::chrono::nanoseconds>(
        now.time_since_epoch()
    ).count();
    envelope["timestampNs"] = std::to_string(ns);

    envelope["correlationId"] = correlation_id.empty()
        ? generate_uuid()
        : correlation_id;
    envelope["type"] = event_type;
    envelope["payload"] = payload;

    send(envelope);
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

void UdsClient::do_connect() {
    if (!running_.load()) {
        return;
    }

    socket_ = std::make_unique<local_stream::socket>(*ioc_);

    local_stream::endpoint ep(config_.socket_path);
    socket_->async_connect(ep,
        [this](boost::system::error_code ec) {
            if (ec) {
                std::cerr << "[UdsClient] Connect failed: " << ec.message()
                          << std::endl;
                schedule_reconnect();
                return;
            }

            std::cout << "[UdsClient] Connected to " << config_.socket_path
                      << std::endl;
            connected_.store(true);
            reconnect_delay_ms_ = config_.reconnect_initial_ms;

            // Start reading
            do_read_header();

            // Flush any queued messages
            {
                std::lock_guard<std::mutex> lock(write_mutex_);
                if (!write_queue_.empty() && !write_in_progress_) {
                    do_write();
                }
            }
        });
}

// ---------------------------------------------------------------------------
// Reading (length-prefixed frames)
// ---------------------------------------------------------------------------

void UdsClient::do_read_header() {
    if (!running_.load() || !connected_.load()) {
        return;
    }

    net::async_read(
        *socket_,
        net::buffer(header_buf_),
        [this](boost::system::error_code ec, std::size_t /*bytes*/) {
            if (ec) {
                if (ec != net::error::operation_aborted) {
                    std::cerr << "[UdsClient] Read header error: "
                              << ec.message() << std::endl;
                }
                connected_.store(false);
                if (running_.load()) {
                    schedule_reconnect();
                }
                return;
            }

            // Decode payload length (uint32 big-endian)
            uint32_t length =
                (static_cast<uint32_t>(header_buf_[0]) << 24) |
                (static_cast<uint32_t>(header_buf_[1]) << 16) |
                (static_cast<uint32_t>(header_buf_[2]) << 8) |
                (static_cast<uint32_t>(header_buf_[3]));

            if (length > UDS_MAX_PAYLOAD_BYTES) {
                std::cerr << "[UdsClient] Payload too large: " << length
                          << " bytes (max " << UDS_MAX_PAYLOAD_BYTES << ")"
                          << std::endl;
                connected_.store(false);
                if (running_.load()) {
                    schedule_reconnect();
                }
                return;
            }

            do_read_body(length);
        });
}

void UdsClient::do_read_body(uint32_t payload_length) {
    body_buf_.resize(payload_length);

    net::async_read(
        *socket_,
        net::buffer(body_buf_),
        [this](boost::system::error_code ec, std::size_t /*bytes*/) {
            if (ec) {
                if (ec != net::error::operation_aborted) {
                    std::cerr << "[UdsClient] Read body error: "
                              << ec.message() << std::endl;
                }
                connected_.store(false);
                if (running_.load()) {
                    schedule_reconnect();
                }
                return;
            }

            // Parse JSON
            try {
                std::string json_str(body_buf_.begin(), body_buf_.end());
                auto envelope = nlohmann::json::parse(json_str);

                if (message_callback_) {
                    message_callback_(envelope);
                }
            } catch (const nlohmann::json::exception& e) {
                std::cerr << "[UdsClient] JSON parse error: " << e.what()
                          << std::endl;
            }

            // Continue reading
            do_read_header();
        });
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

void UdsClient::do_write() {
    // Must be called with write_mutex_ held OR from io_context thread
    std::lock_guard<std::mutex> lock(write_mutex_);

    if (write_queue_.empty() || !connected_.load()) {
        write_in_progress_ = false;
        return;
    }

    write_in_progress_ = true;
    auto& front = write_queue_.front();

    net::async_write(
        *socket_,
        net::buffer(front),
        [this](boost::system::error_code ec, std::size_t /*bytes*/) {
            if (ec) {
                std::cerr << "[UdsClient] Write error: " << ec.message()
                          << std::endl;
                connected_.store(false);
                write_in_progress_ = false;
                if (running_.load()) {
                    schedule_reconnect();
                }
                return;
            }

            {
                std::lock_guard<std::mutex> lock(write_mutex_);
                write_queue_.pop_front();
            }

            // Write next message if queued
            do_write();
        });
}

// ---------------------------------------------------------------------------
// Reconnection
// ---------------------------------------------------------------------------

void UdsClient::schedule_reconnect() {
    if (!running_.load()) {
        return;
    }

    std::cout << "[UdsClient] Reconnecting in " << reconnect_delay_ms_
              << "ms..." << std::endl;

    reconnect_timer_->expires_after(
        std::chrono::milliseconds(reconnect_delay_ms_));
    reconnect_timer_->async_wait([this](boost::system::error_code ec) {
        if (ec || !running_.load()) {
            return;
        }
        do_connect();
    });

    reconnect_delay_ms_ = std::min(
        reconnect_delay_ms_ * 2,
        config_.reconnect_max_ms);
}

// ---------------------------------------------------------------------------
// Frame encoding
// ---------------------------------------------------------------------------

std::vector<uint8_t> UdsClient::encode_frame(const std::string& json_str) {
    uint32_t length = static_cast<uint32_t>(json_str.size());
    std::vector<uint8_t> frame(4 + length);

    // Length prefix: uint32 big-endian
    frame[0] = static_cast<uint8_t>((length >> 24) & 0xFF);
    frame[1] = static_cast<uint8_t>((length >> 16) & 0xFF);
    frame[2] = static_cast<uint8_t>((length >> 8) & 0xFF);
    frame[3] = static_cast<uint8_t>(length & 0xFF);

    // JSON payload
    std::memcpy(frame.data() + 4, json_str.data(), length);

    return frame;
}

}  // namespace bot
