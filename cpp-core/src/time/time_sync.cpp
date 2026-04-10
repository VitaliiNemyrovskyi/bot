#include "time/time_sync.hpp"

#include <algorithm>
#include <cmath>
#include <iostream>
#include <numeric>

#include <nlohmann/json.hpp>

namespace bot {

TimeSync::TimeSync(TimeSyncConfig config)
    : config_(std::move(config))
{
    ssl_ctx_.set_default_verify_paths();
    ssl_ctx_.set_verify_mode(ssl::verify_peer);

    // Capture a reference pair: steady_clock <-> wall clock
    // Used to convert between the two clock domains
    steady_ref_ = std::chrono::steady_clock::now();
    wall_ref_ms_ = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
}

TimeSync::~TimeSync() {
    stop();
}

bool TimeSync::calibrate_initial() {
    std::cout << "[TimeSync] Starting initial calibration with "
              << config_.initial_probes << " probes..." << std::endl;

    std::vector<ProbeSample> samples;
    samples.reserve(config_.initial_probes);

    for (uint32_t i = 0; i < config_.initial_probes; ++i) {
        ProbeSample sample{};
        if (probe(sample)) {
            samples.push_back(sample);
            std::cout << "[TimeSync] Probe " << (i + 1)
                      << ": offset=" << sample.offset_us << "us"
                      << " rtt=" << sample.rtt_us << "us" << std::endl;
        } else {
            std::cerr << "[TimeSync] Probe " << (i + 1) << " failed"
                      << std::endl;
        }
    }

    if (samples.empty()) {
        std::cerr << "[TimeSync] Initial calibration failed: no successful probes"
                  << std::endl;
        return false;
    }

    int64_t offset = compute_offset(samples);
    {
        std::lock_guard<std::mutex> lock(mutex_);
        offset_us_.store(offset, std::memory_order_release);
        calibrated_ = true;
        calibration_count_++;
        last_calibration_ = std::chrono::steady_clock::now();

        // Track minimum RTT
        for (const auto& s : samples) {
            min_rtt_us_ = std::min(min_rtt_us_, s.rtt_us);
        }
    }

    std::cout << "[TimeSync] Initial calibration complete: offset="
              << offset << "us (from " << samples.size() << " samples)"
              << std::endl;

    return true;
}

void TimeSync::start_continuous(net::io_context& ioc) {
    if (running_.exchange(true)) {
        return;
    }

    ioc_ = &ioc;
    recalibrate_timer_ = std::make_unique<net::steady_timer>(ioc);
    schedule_recalibration();

    std::cout << "[TimeSync] Continuous recalibration started (every "
              << config_.recalibrate_interval_sec << "s)" << std::endl;
}

void TimeSync::stop() {
    if (!running_.exchange(false)) {
        return;
    }

    if (recalibrate_timer_) {
        boost::system::error_code ec;
        recalibrate_timer_->cancel(ec);
    }

    std::cout << "[TimeSync] Stopped" << std::endl;
}

int64_t TimeSync::offset_us() const {
    return offset_us_.load(std::memory_order_acquire);
}

int64_t TimeSync::to_exchange_time_ms(
    std::chrono::steady_clock::time_point tp
) const {
    // Convert steady_clock point to wall clock milliseconds
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
        tp - steady_ref_
    ).count();
    int64_t local_wall_ms = wall_ref_ms_ + elapsed;

    // Apply exchange offset
    int64_t offset = offset_us_.load(std::memory_order_acquire);
    return local_wall_ms + (offset / 1000);
}

int64_t TimeSync::exchange_now_ms() const {
    return to_exchange_time_ms(std::chrono::steady_clock::now());
}

TimeSyncStatus TimeSync::status() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return TimeSyncStatus{
        .offset_us = offset_us_.load(std::memory_order_acquire),
        .min_rtt_us = min_rtt_us_,
        .calibration_count = calibration_count_,
        .calibrated = calibrated_,
        .last_calibration = last_calibration_,
    };
}

// ---------------------------------------------------------------------------
// Single probe: HTTPS GET to exchange time endpoint
// ---------------------------------------------------------------------------

bool TimeSync::probe(ProbeSample& out) {
    try {
        net::io_context probe_ioc;
        ssl::context probe_ssl_ctx{ssl::context::tlsv12_client};
        probe_ssl_ctx.set_default_verify_paths();
        probe_ssl_ctx.set_verify_mode(ssl::verify_peer);

        tcp::resolver resolver{probe_ioc};
        beast::ssl_stream<beast::tcp_stream> stream{probe_ioc, probe_ssl_ctx};

        // Set SNI
        if (!SSL_set_tlsext_host_name(
                stream.native_handle(),
                config_.rest_host.c_str())) {
            return false;
        }

        // Resolve and connect
        auto const results = resolver.resolve(
            config_.rest_host, std::to_string(config_.rest_port));
        beast::get_lowest_layer(stream).connect(results);

        // TLS handshake
        stream.handshake(ssl::stream_base::client);

        // Build HTTP GET request
        http::request<http::empty_body> req{
            http::verb::get, config_.time_path, 11};
        req.set(http::field::host, config_.rest_host);
        req.set(http::field::user_agent, "bot-engine/0.1.0");

        // Record request time (wall clock for offset computation)
        auto t1_wall = std::chrono::duration_cast<std::chrono::microseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        // Send request
        http::write(stream, req);

        // Read response
        beast::flat_buffer buffer;
        http::response<http::string_body> res;
        http::read(stream, buffer, res);

        // Record response time (wall clock for offset computation)
        auto t2_wall = std::chrono::duration_cast<std::chrono::microseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        // Graceful SSL shutdown (ignore errors, some servers don't support it)
        beast::error_code ec;
        stream.shutdown(ec);

        // Parse Bybit response: {"retCode":0,"result":{"timeSecond":"...","timeNano":"..."}}
        auto json = nlohmann::json::parse(res.body());

        if (!json.contains("retCode") || json["retCode"].get<int>() != 0) {
            std::cerr << "[TimeSync] Exchange returned error: " << res.body()
                      << std::endl;
            return false;
        }

        // Bybit returns time in milliseconds as string in "timeSecond" (actually ms)
        // or "timeNano" (nanoseconds as string)
        int64_t exchange_time_us = 0;
        if (json["result"].contains("timeNano")) {
            std::string nano_str = json["result"]["timeNano"].get<std::string>();
            int64_t nano = std::stoll(nano_str);
            exchange_time_us = nano / 1000;
        } else if (json["result"].contains("timeSecond")) {
            std::string sec_str = json["result"]["timeSecond"].get<std::string>();
            int64_t sec = std::stoll(sec_str);
            exchange_time_us = sec * 1000000;
        } else {
            std::cerr << "[TimeSync] Unexpected time response format"
                      << std::endl;
            return false;
        }

        // Compute offset using NTP-style formula
        int64_t rtt_us = t2_wall - t1_wall;
        int64_t local_midpoint_us = t1_wall + rtt_us / 2;

        out.offset_us = exchange_time_us - local_midpoint_us;
        out.rtt_us = rtt_us;

        return true;

    } catch (const std::exception& e) {
        std::cerr << "[TimeSync] Probe exception: " << e.what() << std::endl;
        return false;
    }
}

// ---------------------------------------------------------------------------
// Offset computation with outlier rejection
// ---------------------------------------------------------------------------

int64_t TimeSync::compute_offset(std::vector<ProbeSample>& samples) const {
    if (samples.empty()) {
        return 0;
    }

    if (samples.size() == 1) {
        return samples[0].offset_us;
    }

    // Compute mean and standard deviation
    double sum = 0.0;
    for (const auto& s : samples) {
        sum += static_cast<double>(s.offset_us);
    }
    double mean = sum / static_cast<double>(samples.size());

    double sq_sum = 0.0;
    for (const auto& s : samples) {
        double diff = static_cast<double>(s.offset_us) - mean;
        sq_sum += diff * diff;
    }
    double stddev = std::sqrt(sq_sum / static_cast<double>(samples.size()));

    // Reject outliers beyond configured sigma
    std::vector<int64_t> filtered;
    filtered.reserve(samples.size());
    for (const auto& s : samples) {
        double diff = std::abs(static_cast<double>(s.offset_us) - mean);
        if (stddev < 1.0 || diff <= config_.outlier_sigma * stddev) {
            filtered.push_back(s.offset_us);
        }
    }

    if (filtered.empty()) {
        // All samples were outliers -- fall back to full set median
        for (const auto& s : samples) {
            filtered.push_back(s.offset_us);
        }
    }

    // Return median
    std::sort(filtered.begin(), filtered.end());
    return filtered[filtered.size() / 2];
}

// ---------------------------------------------------------------------------
// Continuous recalibration
// ---------------------------------------------------------------------------

void TimeSync::schedule_recalibration() {
    if (!running_.load() || !recalibrate_timer_) {
        return;
    }

    recalibrate_timer_->expires_after(
        std::chrono::seconds(config_.recalibrate_interval_sec));
    recalibrate_timer_->async_wait([this](boost::system::error_code ec) {
        if (ec || !running_.load()) {
            return;
        }

        // Single probe for recalibration
        ProbeSample sample{};
        if (probe(sample)) {
            // Exponential moving average with the existing offset
            int64_t old_offset = offset_us_.load(std::memory_order_acquire);
            // Weight new sample at 30% to smooth out jitter
            int64_t new_offset = old_offset + (sample.offset_us - old_offset) * 3 / 10;

            offset_us_.store(new_offset, std::memory_order_release);

            {
                std::lock_guard<std::mutex> lock(mutex_);
                calibration_count_++;
                last_calibration_ = std::chrono::steady_clock::now();
                min_rtt_us_ = std::min(min_rtt_us_, sample.rtt_us);
            }
        } else {
            std::cerr << "[TimeSync] Recalibration probe failed" << std::endl;
        }

        // Schedule next recalibration
        schedule_recalibration();
    });
}

}  // namespace bot
