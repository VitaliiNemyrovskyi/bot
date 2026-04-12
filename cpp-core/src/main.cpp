/**
 * C++ Execution Core - Main Entry Point
 *
 * Standalone binary that runs alongside the TypeScript execution engine.
 * Responsibilities:
 *   - Connect to Bybit WebSocket for real-time ticker data
 *   - Write market data ticks to shared memory ring buffer
 *   - Connect to TypeScript engine via Unix domain socket
 *   - Handle order submission commands from the engine
 *   - Maintain continuous time synchronization with Bybit
 *
 * Configuration: all parameters from environment variables.
 * Shutdown: graceful on SIGTERM/SIGINT.
 */

#include <atomic>
#include <chrono>
#include <csignal>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>
#include <utility>
#include <vector>

#include <boost/asio.hpp>
#include <nlohmann/json.hpp>

#include "connectors/bybit_connector.hpp"
#include "ipc/ring_buffer.hpp"
#include "ipc/uds_client.hpp"
#include "orders/order_pipeline.hpp"
#include "time/time_sync.hpp"

namespace {

// Global shutdown flag, set by signal handler
std::atomic<bool> g_shutdown_requested{false};

void signal_handler(int sig) {
    std::cout << "\n[main] Received signal " << sig
              << ", initiating graceful shutdown..." << std::endl;
    g_shutdown_requested.store(true);
}

// Read an environment variable, return default if not set
std::string env_or(const char* name, const std::string& default_val) {
    const char* val = std::getenv(name);
    return (val != nullptr) ? std::string(val) : default_val;
}

// Parse comma-separated string into vector
std::vector<std::string> split_csv(const std::string& s) {
    std::vector<std::string> result;
    std::istringstream stream(s);
    std::string token;
    while (std::getline(stream, token, ',')) {
        // Trim whitespace
        size_t start = token.find_first_not_of(" \t");
        size_t end = token.find_last_not_of(" \t");
        if (start != std::string::npos) {
            result.push_back(token.substr(start, end - start + 1));
        }
    }
    return result;
}

}  // namespace

int main(int /*argc*/, char* /*argv*/[]) {
    std::cout << "[main] C++ Execution Core starting..." << std::endl;

    // -----------------------------------------------------------------------
    // Parse configuration from environment variables
    // -----------------------------------------------------------------------

    // UDS socket path (must match TypeScript engine)
    std::string socket_path = env_or(
        "EXECUTION_ENGINE_SOCKET_PATH", "/tmp/bot-execution-engine.sock");

    // Shared memory path for ring buffer
    std::string shm_path = env_or(
        "MARKET_DATA_SHM_PATH", "/tmp/bot-market-data.shm");

    // Ring buffer slot count
    uint32_t slot_count = static_cast<uint32_t>(std::stoul(
        env_or("RING_BUFFER_SLOT_COUNT", "4096")));

    // Symbols to subscribe to
    std::string symbols_str = env_or("BYBIT_SYMBOLS", "BTCUSDT,ETHUSDT");
    auto symbols = split_csv(symbols_str);

    if (symbols.empty()) {
        std::cerr << "[main] FATAL: No symbols configured" << std::endl;
        return 1;
    }

    // Bybit API credentials: received from execution engine via UDS (PROVIDE_CREDENTIALS)
    // No longer read from env vars — the engine decrypts and pushes them at connect time.
    std::string api_key;
    std::string api_secret;

    // Bybit REST/WS hosts
    std::string ws_host = env_or("BYBIT_WS_HOST", "stream.bybit.com");
    std::string rest_host = env_or("BYBIT_REST_HOST", "api.bybit.com");

    // Shadow mode: if true, do not submit orders (observation only)
    bool shadow_mode = env_or("CONNECTOR_MODE_BYBIT", "shadow") == "shadow";

    // Slippage threshold
    double max_slippage_bps = std::stod(
        env_or("MAX_SLIPPAGE_BPS", "50.0"));

    std::cout << "[main] Configuration:" << std::endl;
    std::cout << "  socket_path: " << socket_path << std::endl;
    std::cout << "  shm_path: " << shm_path << std::endl;
    std::cout << "  slot_count: " << slot_count << std::endl;
    std::cout << "  symbols: " << symbols_str << std::endl;
    std::cout << "  ws_host: " << ws_host << std::endl;
    std::cout << "  rest_host: " << rest_host << std::endl;
    std::cout << "  shadow_mode: " << (shadow_mode ? "true" : "false") << std::endl;
    std::cout << "  max_slippage_bps: " << max_slippage_bps << std::endl;

    // -----------------------------------------------------------------------
    // Install signal handlers
    // -----------------------------------------------------------------------

    std::signal(SIGTERM, signal_handler);
    std::signal(SIGINT, signal_handler);

    // -----------------------------------------------------------------------
    // Initialize components
    // -----------------------------------------------------------------------

    // 1. Time synchronization
    bot::TimeSyncConfig time_config{
        .rest_host = rest_host,
        .rest_port = 443,
        .time_path = "/v5/market/time",
        .initial_probes = 5,
        .recalibrate_interval_sec = 60,
        .outlier_sigma = 2.0,
    };
    bot::TimeSync time_sync(time_config);

    if (!time_sync.calibrate_initial()) {
        std::cerr << "[main] WARNING: Initial time calibration failed, "
                  << "continuing with zero offset" << std::endl;
    }

    // 2. Ring buffer writer
    bot::RingBufferWriter ring_buffer(shm_path, slot_count);

    // Build symbol ID lookup table and write sidecar JSON
    std::map<std::string, uint16_t> symbol_ids;
    {
        nlohmann::json symbol_table = nlohmann::json::array();
        for (uint16_t i = 0; i < static_cast<uint16_t>(symbols.size()); ++i) {
            symbol_ids[symbols[i]] = i;
            symbol_table.push_back({{"symbol", symbols[i]}, {"id", i}});
        }
        // Write symbol lookup table sidecar file
        std::string sidecar_path = shm_path + ".symbols.json";
        std::ofstream sidecar(sidecar_path);
        if (sidecar.is_open()) {
            sidecar << symbol_table.dump(2);
            std::cout << "[main] Symbol lookup table written to "
                      << sidecar_path << std::endl;
        } else {
            std::cerr << "[main] WARNING: Could not write symbol sidecar to "
                      << sidecar_path << std::endl;
        }
    }

    // Exchange ID for Bybit (convention: 0 = Bybit)
    constexpr uint16_t BYBIT_EXCHANGE_ID = 0;

    // 3. WebSocket connector
    bot::BybitConnector::Config ws_config{
        .ws_url = ws_host,
        .ws_path = "/v5/public/linear",
        .ws_port = 443,
        .symbols = symbols,
        .reconnect_initial_ms = 1000,
        .reconnect_max_ms = 30000,
        .ping_interval_ms = 20000,
    };
    bot::BybitConnector ws_connector(ws_config);

    // Set ticker callback to write to ring buffer
    ws_connector.set_ticker_callback(
        [&ring_buffer, &symbol_ids, BYBIT_EXCHANGE_ID](
            const std::string& symbol,
            const bot::SymbolPriceState& state
        ) {
            auto it = symbol_ids.find(symbol);
            if (it == symbol_ids.end()) {
                return;
            }

            auto now = std::chrono::steady_clock::now();
            uint64_t ts_ns = static_cast<uint64_t>(
                std::chrono::duration_cast<std::chrono::nanoseconds>(
                    now.time_since_epoch()
                ).count());

            bot::MarketDataTick tick{
                .sequence = 0,  // Set by writer
                .timestamp_ns = ts_ns,
                .bid_price = state.bid_price,
                .ask_price = state.ask_price,
                .bid_qty = state.bid_qty,
                .ask_qty = state.ask_qty,
                .exchange_id = BYBIT_EXCHANGE_ID,
                .symbol_id = it->second,
                .flags = 0,
            };

            ring_buffer.write(tick);
        });

    // 4. Shared Boost.Asio io_context for UDS client and time sync
    boost::asio::io_context ioc;

    // 5. UDS client
    bot::UdsClientConfig uds_config{
        .socket_path = socket_path,
        .reconnect_initial_ms = 1000,
        .reconnect_max_ms = 30000,
        .heartbeat_interval_ms = 5000,
    };
    bot::UdsClient uds_client(uds_config);

    // 6. Order pipeline (lazily initialized when credentials arrive via UDS)
    std::unique_ptr<bot::OrderPipeline> order_pipeline;

    // Helper to initialize order pipeline once credentials are received
    auto init_order_pipeline = [&](const std::string& key, const std::string& secret) {
        if (order_pipeline) {
            std::cout << "[main] Order pipeline already initialized, skipping"
                      << std::endl;
            return;
        }
        if (shadow_mode) {
            std::cout << "[main] Credentials received but shadow mode active — "
                      << "order pipeline stays disabled" << std::endl;
            return;
        }

        bot::OrderPipelineConfig order_config{
            .rest_host = rest_host,
            .rest_port = 443,
            .api_key = key,
            .api_secret = secret,
            .max_slippage_bps = max_slippage_bps,
            .submit_timeout_ms = 10000,
            .confirm_max_retries = 10,
            .confirm_retry_delay_ms = 500,
            .recv_window_ms = 5000,
        };
        order_pipeline = std::make_unique<bot::OrderPipeline>(
            order_config, ws_connector, time_sync);

        // Report order results via UDS
        order_pipeline->set_result_callback(
            [&uds_client](const bot::OrderResult& result) {
                nlohmann::json payload;
                payload["orderId"] = result.order_id;
                payload["symbol"] = result.symbol;
                payload["side"] = (result.side == bot::OrderSide::Buy)
                    ? "Buy" : "Sell";
                payload["quantity"] = result.quantity;
                payload["avgFillPrice"] = result.avg_fill_price;
                payload["filledQuantity"] = result.filled_quantity;
                payload["status"] = static_cast<int>(result.status);
                payload["fees"] = result.fees;
                payload["slippageBps"] = result.slippage_bps;
                payload["roundTripUs"] = result.round_trip_us;

                if (!result.error_code.empty()) {
                    payload["errorCode"] = result.error_code;
                    payload["errorMessage"] = result.error_message;
                }

                std::string event_type = (result.status == bot::OrderStatus::Filled)
                    ? "evt:order_filled"
                    : "evt:order_rejected";

                uds_client.send_event(event_type, payload);
            });

        std::cout << "[main] Order pipeline initialized with credentials from engine"
                  << std::endl;
    };

    std::cout << "[main] Waiting for credentials from execution engine via UDS"
              << std::endl;

    // 7. Handle incoming UDS commands
    uds_client.set_message_callback(
        [&order_pipeline, &init_order_pipeline, &api_key, &api_secret,
         shadow_mode](const nlohmann::json& envelope) {
            std::string type = envelope.value("type", "");

            // Handle credential provisioning from execution engine
            if (type == "cmd:provide_credentials") {
                auto payload = envelope.value("payload", nlohmann::json::object());
                auto creds = payload.value("credentials", nlohmann::json::array());

                for (const auto& cred : creds) {
                    std::string exchange = cred.value("exchange", "");
                    if (exchange == "BYBIT") {
                        api_key = cred.value("apiKey", "");
                        api_secret = cred.value("apiSecret", "");
                        std::cout << "[main] Received Bybit credentials from engine"
                                  << " (credentialId: " << cred.value("credentialId", "")
                                  << ")" << std::endl;
                        init_order_pipeline(api_key, api_secret);
                        break;
                    }
                }

                if (api_key.empty()) {
                    std::cout << "[main] No Bybit credentials in provisioned set"
                              << std::endl;
                }
                return;
            }

            std::cout << "[main] Received command: " << type << std::endl;

            // In shadow mode, log but do not execute trading commands
            if (shadow_mode &&
                (type == "cmd:open_position" || type == "cmd:close_position")) {
                std::cout << "[main] Shadow mode: ignoring trading command "
                          << type << std::endl;
                return;
            }

            // Handle engine status queries
            if (type == "cmd:get_engine_status") {
                std::cout << "[main] Status query received (handled by TS engine)"
                          << std::endl;
                return;
            }
        });

    // -----------------------------------------------------------------------
    // Start all components
    // -----------------------------------------------------------------------

    ws_connector.start();
    time_sync.start_continuous(ioc);
    uds_client.start(ioc);

    // Send engine ready event
    uds_client.send_event("evt:engine_ready", {
        {"connectorMode", shadow_mode ? "shadow" : "native"},
        {"exchange", "BYBIT"},
        {"symbols", symbols},
        {"protocolVersion", 10001},
    });

    // -----------------------------------------------------------------------
    // Main event loop
    // -----------------------------------------------------------------------

    std::cout << "[main] C++ Execution Core running" << std::endl;

    // Run io_context on a dedicated thread
    std::thread ioc_thread([&ioc]() {
        boost::asio::io_context::work work(ioc);
        ioc.run();
    });

    // Main thread: poll for shutdown signal
    while (!g_shutdown_requested.load()) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    // -----------------------------------------------------------------------
    // Graceful shutdown
    // -----------------------------------------------------------------------

    std::cout << "[main] Shutting down..." << std::endl;

    // Notify TypeScript engine
    uds_client.send_event("evt:engine_shutting_down", {
        {"reason", "signal"},
        {"exchange", "BYBIT"},
    });

    // Allow the event to be sent
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // Stop components in reverse order
    uds_client.stop();
    time_sync.stop();
    ws_connector.stop();

    // Stop io_context
    ioc.stop();
    if (ioc_thread.joinable()) {
        ioc_thread.join();
    }

    // Clean up ring buffer (do not remove file -- TypeScript may still be reading)
    ring_buffer.cleanup(false);

    std::cout << "[main] C++ Execution Core stopped cleanly" << std::endl;
    return 0;
}
