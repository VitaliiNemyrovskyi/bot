#include <gtest/gtest.h>

#include "time/time_sync.hpp"

#include <chrono>
#include <thread>

namespace bot {
namespace {

class TimeSyncTest : public ::testing::Test {
protected:
    // Use a deliberately unreachable host for offline tests
    TimeSyncConfig offline_config() {
        return TimeSyncConfig{
            .rest_host = "localhost",
            .rest_port = 1,  // Unreachable port
            .time_path = "/v5/market/time",
            .initial_probes = 1,
            .recalibrate_interval_sec = 3600,
            .outlier_sigma = 2.0,
        };
    }
};

// Test: construction succeeds with any config
TEST_F(TimeSyncTest, Construction) {
    TimeSync ts(offline_config());
    auto status = ts.status();
    EXPECT_FALSE(status.calibrated);
    EXPECT_EQ(status.calibration_count, 0u);
    EXPECT_EQ(status.offset_us, 0);
}

// Test: initial calibration fails gracefully with unreachable host
TEST_F(TimeSyncTest, CalibrationFailsGracefully) {
    TimeSync ts(offline_config());
    bool result = ts.calibrate_initial();
    EXPECT_FALSE(result);

    auto status = ts.status();
    EXPECT_FALSE(status.calibrated);
    EXPECT_EQ(status.offset_us, 0);
}

// Test: exchange_now_ms returns a reasonable value
TEST_F(TimeSyncTest, ExchangeNowMs) {
    TimeSync ts(offline_config());

    // With zero offset, exchange_now_ms should be close to system time
    int64_t now_ms = ts.exchange_now_ms();
    auto sys_now_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();

    // Should be within 100ms of system time (generous for CI)
    EXPECT_NEAR(static_cast<double>(now_ms),
                static_cast<double>(sys_now_ms), 100.0);
}

// Test: to_exchange_time_ms converts correctly
TEST_F(TimeSyncTest, ToExchangeTimeMs) {
    TimeSync ts(offline_config());

    auto tp1 = std::chrono::steady_clock::now();
    int64_t t1 = ts.to_exchange_time_ms(tp1);

    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    auto tp2 = std::chrono::steady_clock::now();
    int64_t t2 = ts.to_exchange_time_ms(tp2);

    // t2 should be at least 40ms after t1 (allowing some scheduling slack)
    EXPECT_GE(t2 - t1, 40);
    // But not more than 200ms
    EXPECT_LE(t2 - t1, 200);
}

// Test: offset_us atomic access
TEST_F(TimeSyncTest, OffsetIsAtomic) {
    TimeSync ts(offline_config());

    // Default offset should be 0
    EXPECT_EQ(ts.offset_us(), 0);
}

// Test: stop is idempotent
TEST_F(TimeSyncTest, StopIdempotent) {
    TimeSync ts(offline_config());
    ts.stop();
    ts.stop();  // Second call should not crash
}

}  // namespace
}  // namespace bot
