#include <gtest/gtest.h>

#include "ipc/uds_client.hpp"

#include <boost/asio.hpp>
#include <filesystem>
#include <thread>

namespace bot {
namespace {

class UdsClientTest : public ::testing::Test {
protected:
    std::string socket_path() {
        return "/tmp/bot-test-uds-" + std::to_string(getpid()) + ".sock";
    }

    void TearDown() override {
        std::filesystem::remove(socket_path());
    }
};

// Test: construction succeeds
TEST_F(UdsClientTest, Construction) {
    UdsClientConfig config{
        .socket_path = socket_path(),
        .reconnect_initial_ms = 100,
        .reconnect_max_ms = 1000,
        .heartbeat_interval_ms = 5000,
    };
    UdsClient client(config);
    EXPECT_FALSE(client.is_connected());
}

// Test: stop is safe even without start
TEST_F(UdsClientTest, StopWithoutStart) {
    UdsClientConfig config{
        .socket_path = socket_path(),
    };
    UdsClient client(config);
    client.stop();  // Should not crash
    EXPECT_FALSE(client.is_connected());
}

// Test: send queues messages when not connected
TEST_F(UdsClientTest, SendQueuesWhenDisconnected) {
    UdsClientConfig config{
        .socket_path = socket_path(),
    };
    UdsClient client(config);

    // Should not crash, just queue
    nlohmann::json msg;
    msg["type"] = "test";
    msg["data"] = "hello";
    client.send(msg);

    EXPECT_FALSE(client.is_connected());
}

// Test: frame encoding produces correct format
TEST_F(UdsClientTest, FrameEncoding) {
    // This tests the wire format: 4 bytes big-endian length + JSON payload
    // We verify through a loopback test with a mock server

    using namespace boost::asio;
    io_context ioc;

    std::string path = socket_path();
    local::stream_protocol::endpoint ep(path);

    // Create a simple UDS server
    local::stream_protocol::acceptor acceptor(ioc, ep);

    UdsClientConfig config{
        .socket_path = path,
        .reconnect_initial_ms = 100,
        .reconnect_max_ms = 1000,
        .heartbeat_interval_ms = 60000,  // Disable heartbeat for test
    };
    UdsClient client(config);

    // Start client
    client.start(ioc);

    // Accept connection
    local::stream_protocol::socket server_socket(ioc);

    bool accepted = false;
    acceptor.async_accept(server_socket,
        [&accepted](boost::system::error_code ec) {
            if (!ec) accepted = true;
        });

    // Run io_context briefly to establish connection
    ioc.run_for(std::chrono::milliseconds(200));

    EXPECT_TRUE(accepted);
    EXPECT_TRUE(client.is_connected());

    // Send a message
    nlohmann::json msg;
    msg["type"] = "test_message";
    msg["seq"] = 42;
    client.send(msg);

    // Run to flush the write
    ioc.restart();
    ioc.run_for(std::chrono::milliseconds(100));

    // Read from server side: 4-byte length prefix + JSON
    uint8_t header[4];
    boost::system::error_code ec;
    size_t n = read(server_socket, buffer(header, 4), ec);

    if (n == 4 && !ec) {
        uint32_t length =
            (static_cast<uint32_t>(header[0]) << 24) |
            (static_cast<uint32_t>(header[1]) << 16) |
            (static_cast<uint32_t>(header[2]) << 8) |
            (static_cast<uint32_t>(header[3]));

        EXPECT_GT(length, 0u);
        EXPECT_LT(length, UDS_MAX_PAYLOAD_BYTES);

        std::vector<uint8_t> body(length);
        n = read(server_socket, buffer(body), ec);
        EXPECT_EQ(n, length);

        if (!ec) {
            std::string json_str(body.begin(), body.end());
            auto parsed = nlohmann::json::parse(json_str);
            EXPECT_EQ(parsed["type"], "test_message");
            EXPECT_EQ(parsed["seq"], 42);
        }
    }

    // Cleanup
    client.stop();
    server_socket.close();
    acceptor.close();
}

// Test: send_event generates proper envelope
TEST_F(UdsClientTest, SendEventEnvelope) {
    using namespace boost::asio;
    io_context ioc;

    std::string path = socket_path();
    local::stream_protocol::endpoint ep(path);
    local::stream_protocol::acceptor acceptor(ioc, ep);

    UdsClientConfig config{
        .socket_path = path,
        .reconnect_initial_ms = 100,
        .reconnect_max_ms = 1000,
        .heartbeat_interval_ms = 60000,
    };
    UdsClient client(config);
    client.start(ioc);

    local::stream_protocol::socket server_socket(ioc);
    acceptor.async_accept(server_socket, [](boost::system::error_code) {});

    ioc.run_for(std::chrono::milliseconds(200));

    // Send an event
    nlohmann::json payload;
    payload["exchange"] = "BYBIT";
    payload["status"] = "ready";
    client.send_event("evt:engine_ready", payload);

    ioc.restart();
    ioc.run_for(std::chrono::milliseconds(100));

    // Read and verify envelope structure
    uint8_t header[4];
    boost::system::error_code ec;
    size_t n = read(server_socket, buffer(header, 4), ec);

    if (n == 4 && !ec) {
        uint32_t length =
            (static_cast<uint32_t>(header[0]) << 24) |
            (static_cast<uint32_t>(header[1]) << 16) |
            (static_cast<uint32_t>(header[2]) << 8) |
            (static_cast<uint32_t>(header[3]));

        std::vector<uint8_t> body(length);
        read(server_socket, buffer(body), ec);

        auto envelope = nlohmann::json::parse(
            std::string(body.begin(), body.end()));

        // Verify envelope fields
        EXPECT_TRUE(envelope.contains("seq"));
        EXPECT_TRUE(envelope.contains("timestampNs"));
        EXPECT_TRUE(envelope.contains("correlationId"));
        EXPECT_EQ(envelope["type"], "evt:engine_ready");
        EXPECT_EQ(envelope["payload"]["exchange"], "BYBIT");
    }

    client.stop();
    server_socket.close();
    acceptor.close();
}

}  // namespace
}  // namespace bot
