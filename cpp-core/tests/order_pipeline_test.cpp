#include <gtest/gtest.h>

#include "orders/order_pipeline.hpp"
#include "connectors/bybit_connector.hpp"
#include "time/time_sync.hpp"

namespace bot {
namespace {

class OrderPipelineTest : public ::testing::Test {
protected:
    // Create minimal configs for offline testing
    BybitConnector::Config ws_config() {
        return BybitConnector::Config{
            .ws_url = "localhost",
            .ws_path = "/v5/public/linear",
            .ws_port = 1,
            .symbols = {"BTCUSDT", "ETHUSDT"},
            .reconnect_initial_ms = 1000,
            .reconnect_max_ms = 30000,
            .ping_interval_ms = 20000,
        };
    }

    TimeSyncConfig time_config() {
        return TimeSyncConfig{
            .rest_host = "localhost",
            .rest_port = 1,
            .time_path = "/v5/market/time",
            .initial_probes = 1,
            .recalibrate_interval_sec = 3600,
            .outlier_sigma = 2.0,
        };
    }

    OrderPipelineConfig order_config() {
        return OrderPipelineConfig{
            .rest_host = "localhost",
            .rest_port = 1,
            .api_key = "test_key",
            .api_secret = "test_secret",
            .max_slippage_bps = 50.0,
            .submit_timeout_ms = 1000,
            .confirm_max_retries = 1,
            .confirm_retry_delay_ms = 100,
            .recv_window_ms = 5000,
        };
    }
};

// Test: slippage check returns nullopt when no price data available
TEST_F(OrderPipelineTest, SlippageCheckNoPriceData) {
    BybitConnector connector(ws_config());
    TimeSync time_sync(time_config());
    OrderPipeline pipeline(order_config(), connector, time_sync);

    auto result = pipeline.check_slippage("BTCUSDT", OrderSide::Buy, 50000.0);
    EXPECT_FALSE(result.has_value());
}

// Test: order submission fails gracefully with unreachable exchange
TEST_F(OrderPipelineTest, SubmitFailsGracefully) {
    BybitConnector connector(ws_config());
    TimeSync time_sync(time_config());
    OrderPipeline pipeline(order_config(), connector, time_sync);

    bool callback_called = false;
    pipeline.set_result_callback([&callback_called](const OrderResult& result) {
        callback_called = true;
        // Should have an error since exchange is unreachable
        EXPECT_FALSE(result.error_code.empty());
    });

    auto result = pipeline.submit_market_order("BTCUSDT", OrderSide::Buy, 0.001);

    // Should fail with exchange.unreachable error
    EXPECT_FALSE(result.error_code.empty());
    EXPECT_TRUE(callback_called);
}

// Test: parse_status correctly maps Bybit status strings
TEST_F(OrderPipelineTest, ParseOrderStatus) {
    // Access via a public method isn't available, but we test through
    // the confirm_fill path indirectly. The key invariant is that
    // the order pipeline never silently succeeds when the exchange is unreachable.

    BybitConnector connector(ws_config());
    TimeSync time_sync(time_config());
    OrderPipeline pipeline(order_config(), connector, time_sync);

    // Submitting to unreachable host should result in an error, not a silent success
    auto result = pipeline.submit_market_order("ETHUSDT", OrderSide::Sell, 0.01);
    EXPECT_NE(result.status, OrderStatus::Filled);
}

// Test: result callback is invoked
TEST_F(OrderPipelineTest, ResultCallbackInvoked) {
    BybitConnector connector(ws_config());
    TimeSync time_sync(time_config());
    OrderPipeline pipeline(order_config(), connector, time_sync);

    int callback_count = 0;
    pipeline.set_result_callback([&callback_count](const OrderResult& /*result*/) {
        callback_count++;
    });

    pipeline.submit_market_order("BTCUSDT", OrderSide::Buy, 0.001);
    EXPECT_EQ(callback_count, 1);
}

}  // namespace
}  // namespace bot
