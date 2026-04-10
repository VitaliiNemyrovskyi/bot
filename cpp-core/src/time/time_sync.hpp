#pragma once

/**
 * Exchange Time Synchronization
 *
 * Maintains a continuously calibrated clock offset between the local
 * steady_clock and Bybit's server time. Uses NTP-style offset
 * computation with outlier rejection.
 *
 * Protocol (per IPC spec Section 7.3):
 *   1. On startup: 5 round-trips, median offset, discard > 2 sigma
 *   2. Every 60 seconds: single recalibration probe
 *   3. Offset = exchange_time - (request_time + rtt/2)
 */

#include <atomic>
#include <chrono>
#include <cstdint>
#include <functional>
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

namespace bot {

namespace net = boost::asio;
namespace ssl = net::ssl;
namespace beast = boost::beast;
namespace http = beast::http;

using tcp = net::ip::tcp;

struct TimeSyncConfig {
    std::string rest_host;     // e.g. "api.bybit.com"
    uint16_t rest_port = 443;
    std::string time_path;     // e.g. "/v5/market/time"
    // Number of initial calibration probes
    uint32_t initial_probes = 5;
    // Recalibration interval
    uint32_t recalibrate_interval_sec = 60;
    // Outlier rejection: discard samples > this many standard deviations
    double outlier_sigma = 2.0;
};

struct TimeSyncStatus {
    int64_t offset_us;            // Local-to-exchange offset in microseconds
    int64_t min_rtt_us;           // Minimum observed round-trip time
    uint64_t calibration_count;   // Number of successful calibrations
    bool calibrated;              // Whether at least one calibration completed
    std::chrono::steady_clock::time_point last_calibration;
};

class TimeSync {
public:
    explicit TimeSync(TimeSyncConfig config);
    ~TimeSync();

    TimeSync(const TimeSync&) = delete;
    TimeSync& operator=(const TimeSync&) = delete;

    // Perform initial calibration (blocking, called on startup)
    // Returns true if calibration succeeded
    bool calibrate_initial();

    // Start continuous recalibration in background
    void start_continuous(net::io_context& ioc);

    // Stop continuous recalibration
    void stop();

    // Get current offset in microseconds (local_time + offset = exchange_time)
    int64_t offset_us() const;

    // Convert a local steady_clock timepoint to estimated exchange time (ms epoch)
    int64_t to_exchange_time_ms(std::chrono::steady_clock::time_point tp) const;

    // Get current estimated exchange time (ms epoch)
    int64_t exchange_now_ms() const;

    // Get status snapshot
    TimeSyncStatus status() const;

private:
    struct ProbeSample {
        int64_t offset_us;
        int64_t rtt_us;
    };

    // Perform a single time probe (blocking HTTP request)
    // Returns false if the request failed
    bool probe(ProbeSample& out);

    // Compute calibrated offset from a set of samples (with outlier rejection)
    int64_t compute_offset(std::vector<ProbeSample>& samples) const;

    // Continuous recalibration timer callback
    void schedule_recalibration();

    TimeSyncConfig config_;

    // SSL context for HTTPS requests
    ssl::context ssl_ctx_{ssl::context::tlsv12_client};

    // Calibration state
    mutable std::mutex mutex_;
    std::atomic<int64_t> offset_us_{0};
    int64_t min_rtt_us_ = std::numeric_limits<int64_t>::max();
    uint64_t calibration_count_ = 0;
    bool calibrated_ = false;
    std::chrono::steady_clock::time_point last_calibration_{};

    // Wall clock reference point (for converting steady_clock to epoch)
    std::chrono::steady_clock::time_point steady_ref_;
    int64_t wall_ref_ms_ = 0;

    // Continuous recalibration
    net::io_context* ioc_ = nullptr;
    std::unique_ptr<net::steady_timer> recalibrate_timer_;
    std::atomic<bool> running_{false};
};

}  // namespace bot
