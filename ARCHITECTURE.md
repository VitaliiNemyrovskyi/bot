# Architecture Document -- Crypto Arbitrage Trading Platform

> Last updated: 2026-04-10
> Status: Documents what EXISTS in the codebase on the `mvp` branch.
> Anything marked **(stub)** or **(not yet wired)** is present as code but not fully integrated.


## 1. System Overview

Six Docker containers cooperate to deliver funding rate arbitrage, price arbitrage,
graduated entry, and (experimentally) triangular arbitrage on 10+ exchanges.

```
                          Internet
                             |
                     +-------+-------+
                     |   Nginx :80   |   frontend container
                     |  Angular 18   |   (static SPA build)
                     +-------+-------+
                             |
                     +-------+-------+
                     | Next.js 15    |   backend container :3000
                     | API routes    |   (instrumentation.ts starts
                     | + services    |    long-running services)
                     +---+---+---+---+
                         |   |   |
            UDS (sock)---+   |   +---PostgreSQL :5432
                             |              |
                     +-------+-------+      |
                     |  Execution    |------+
                     |  Engine       |   (same Prisma schema,
                     |  (Node.js)   |    direct DB access)
                     +---+---+------+
                         |   |
           Ring buffer---+   +---Redis :6379
           (shm tmpfs)
                         |
                     +---+----------+
                     |  C++ Core    |   cpp-core container
                     |  Bybit only  |   (shadow mode default)
                     |  WebSocket   |
                     +--------------+
```

### Container list (docker-compose.yml)

| # | Service            | Image / Build          | Port  | Purpose                                    |
|---|--------------------|------------------------|-------|--------------------------------------------|
| 1 | `postgres`         | postgres:16-alpine     | 5432  | Primary data store (Prisma ORM)            |
| 2 | `redis`            | redis:7-alpine         | 6379  | Cache, real-time data, pub/sub             |
| 3 | `backend`          | backend/Dockerfile     | 3000  | Next.js 15 API + instrumentation services  |
| 4 | `execution-engine` | backend/Dockerfile     | --    | Standalone Node.js, same image as backend  |
| 5 | `cpp-core`         | cpp-core/Dockerfile    | --    | C++ Bybit connector + ring buffer writer   |
| 6 | `frontend`         | frontend/Dockerfile    | 80    | Angular 18 SPA served by Nginx             |

Shared Docker volumes:
- `engine_socket` -- mounted at `/tmp` in backend, execution-engine, cpp-core (carries the UDS socket file)
- `engine_shm` -- tmpfs 64 MB mounted at `/data/shm` (carries the shared-memory ring buffer file)
- `postgres_data` -- persistent PostgreSQL data
- `redis_data` -- persistent Redis data


## 2. Process Architecture

### 2.1 Backend (Next.js 15)

Entry: `node server.js` then Prisma `db push`.

`instrumentation.ts` (Next.js instrumentation hook) starts these long-running services
in the Next.js Node.js process:

| Service                          | What it does                                             |
|----------------------------------|----------------------------------------------------------|
| `FundingArbitrageService`        | Manages funding rate arb subscriptions, countdown timers |
| `BybitFundingStrategyService`    | Bybit-specific NON_HEDGED fast funding strategy          |
| `GraduatedEntryArbitrageService` | Splits orders into N parts with configurable delay       |
| `FundingTrackerService`          | Tracks real funding payments from exchanges              |
| `LiquidationMonitorService`     | Monitors positions for liquidation risk                  |
| `FundingRateCollector`           | Periodically collects funding rates across exchanges     |
| `FundingIntervalScheduler`       | Hourly scheduler for funding interval updates            |

All services gracefully shut down on SIGTERM/SIGINT.

**Important note on duplication**: The execution engine (below) initializes the *same*
services. In the current architecture, both processes start them. The intent (per
engine-process.ts comments) is to migrate all execution services *out* of Next.js and
into the execution engine. Today they run in both places -- the UDS command routing
for position/subscription lifecycle commands is stubbed (`default` case returns
`VALIDATION_FAILED: Unknown command type`). Only `GET_ENGINE_STATUS` and
`SHUTDOWN_ENGINE` are fully wired.

### 2.2 Execution Engine (standalone Node.js)

Entry: `npx tsx src/execution-engine/engine-process.ts`

Startup sequence:
1. Connect to PostgreSQL (Prisma) and Redis
2. Run WAL recovery (query PositionWAL for capital-at-risk positions, verify on exchange)
3. Initialize all trading services (same set as instrumentation.ts)
4. Start UDS server on `/tmp/bot-execution-engine.sock`
5. Emit `ENGINE_READY` event over UDS

Lifecycle states: `STARTING -> RECOVERING -> READY -> SHUTTING_DOWN -> STOPPED`

### 2.3 C++ Core (Bybit shadow mode)

Entry: compiled binary from `cpp-core/src/main.cpp`

Components:
- `BybitConnector` -- WebSocket client for Bybit v5 public linear tickers
- `RingBufferWriter` -- writes 64-byte market data slots to `/data/shm/bot-market-data.shm`
- `UdsClient` -- connects to execution engine UDS socket
- `TimeSync` -- continuous Bybit REST time calibration (5 initial probes, recalibrate every 60s)
- `OrderPipeline` -- Bybit REST order submission (disabled in shadow mode)

Default mode is **shadow**: the C++ core streams market data and writes to the ring buffer
but does NOT submit orders. Set `CONNECTOR_MODE_BYBIT=native` and provide API keys to
enable order submission.

The C++ core writes a JSON sidecar file (`*.symbols.json`) alongside the ring buffer
so the TypeScript reader can map `uint16 symbolId` back to symbol strings.

Libraries: Boost.Asio, nlohmann/json.


## 3. IPC: Inter-Process Communication

Two transport mechanisms exist between the three Node.js/C++ processes:

### 3.1 Unix Domain Sockets (commands/responses)

Path: `/tmp/bot-execution-engine.sock` (env: `EXECUTION_ENGINE_SOCKET_PATH`)

Wire protocol:
- 4-byte uint32 big-endian length prefix + JSON payload (UTF-8)
- Max payload: 1 MB
- Heartbeat: every 5 seconds from engine
- Client reconnect: exponential backoff 1s -> 2s -> 4s ... max 30s

Message envelope (validated with Zod):
```
{ seq, timestampNs, correlationId (UUID), type, payload }
```

Command types (API -> Engine):
- `cmd:open_position`, `cmd:close_position`, `cmd:cancel_position`
- `cmd:create_subscription`, `cmd:cancel_subscription`
- `cmd:start_graduated_entry`, `cmd:stop_graduated_entry`
- `cmd:get_engine_status`, `cmd:shutdown_engine`
- `cmd:get_position_state`, `cmd:get_all_positions`
- `cmd:warmup_connector`, `cmd:invalidate_connector`

Event types (Engine -> API):
- Position lifecycle: `evt:position_state_changed`, `evt:position_opened/closed/error`
- Orders: `evt:order_submitted/filled/rejected`
- Funding: `evt:countdown_tick`, `evt:funding_collected`
- Liquidation: `evt:liquidation_warning/critical`
- Engine health: `evt:engine_heartbeat/ready/shutting_down`
- Market data (low freq): `evt:price_update`, `evt:spread_update`

**Current wiring status**: Only `GET_ENGINE_STATUS` and `SHUTDOWN_ENGINE` commands are
handled in the engine. All other command types hit the `default` case and return an
error. The services still operate directly (not through UDS commands).

### 3.2 Shared Memory Ring Buffer (market data)

Path: `/data/shm/bot-market-data.shm` (env: `MARKET_DATA_SHM_PATH`)

Lock-free SPSC (Single Producer, Single Consumer) ring buffer:

```
Header (128 bytes):
  [0..3]   magic: "BOTB" (0x424F5442)
  [4..7]   version: 1
  [8..11]  slotCount: uint32 (must be power of 2, default 4096)
  [12..15] slotSize: 64
  [16..23] writeCursor: uint64
  [24..31] readCursor: uint64
  [32..39] createdAtNs: uint64
  [40..43] writerPid: uint32
  [44..47] readerPid: uint32

Slot (64 bytes, one cache line):
  [0..7]   sequence: uint64     (written LAST, SeqLock pattern)
  [8..15]  timestampNs: uint64
  [16..23] bidPrice: float64
  [24..31] askPrice: float64
  [32..39] bidQty: float64
  [40..47] askQty: float64
  [48..49] exchangeId: uint16
  [50..51] symbolId: uint16
  [52..55] flags: uint32
  [56..63] checksum: uint64     (XOR of first 7 uint64s)
```

Default: 4096 slots = 256 KB ring + 128 byte header.

Torn-read detection: reader reads sequence, reads data, reads sequence again. Mismatch
means the writer was flushing mid-read -- retry up to 8 times.

**Implementation note**: The TypeScript `RingBufferWriter`/`RingBufferReader` use
`fs.writeSync`/`fs.readSync` through a file descriptor, not true mmap. This works for
IPC (both processes see the same file) but has higher latency than the C++ side which
can use real mmap. The comment says "for true zero-copy mmap, use the C++ reader."


## 4. Exchange Connectors

### 4.1 Factory Pattern

`ExchangeConnectorFactory.create(exchangeName, apiKey, apiSecret, userId?, credentialId?, authToken?)`

All connectors extend `BaseExchangeConnector` which defines the abstract interface:
`initialize()`, `placeMarketOrder()`, `placeLimitOrder()`, `cancelOrder()`,
`getBalance()`, `getPosition()`, `getOrderStatus()`, `closePosition()`,
`placeReduceOnlyOrder()`, `setTradingStop()`, `setLeverage()`, `getFundingRate()`,
`subscribeTicker()`.

### 4.2 Custom Connectors (direct API)

| Connector          | File                          | Notes                                     |
|--------------------|-------------------------------|-------------------------------------------|
| Bybit              | `bybit.connector.ts`          | Time sync, TP/SL, precise timing          |
| BingX              | `bingx.connector.ts`          | Time sync, position mode                  |
| MEXC               | `mexc.connector.ts`           | Auth token support, symbol format          |
| Gate.io SPOT       | `gateio-spot.connector.ts`    | Spot for triangular arb                   |
| KuCoin             | `kucoin.connector.ts`         | Passphrase auth, spot trading             |

Additional specialized connectors:
- `bybit-with-cache.connector.ts` -- wraps Bybit with connector state caching
- `bingx-with-cache.connector.ts` -- wraps BingX with connector state caching
- `bingx-spot.connector.ts` -- BingX spot market
- `binance-futures.connector.ts` -- Binance futures
- `gateio.connector.ts` -- Gate.io futures

### 4.3 CCXT Connector (generic)

`CCXTExchangeConnector` wraps the CCXT library for any exchange not covered by a custom
connector. Explicitly listed: Binance, OKX, Bitget, Gate, KuCoin, Huobi, Kraken,
Coinbase, Bitfinex, Bitstamp, Poloniex, Gemini. Falls back to CCXT for unlisted exchanges.

### 4.4 C++ Connector (Bybit only)

`cpp-core/src/connectors/bybit_connector.cpp` -- native WebSocket client for Bybit v5
public linear stream. Writes ticks directly to shared memory ring buffer. Order
submission via `OrderPipeline` (disabled by default in shadow mode).


## 5. Trading Strategies

### 5.1 Funding Rate Arbitrage (primary strategy)

**Service**: `FundingArbitrageService` (`funding-arbitrage.service.ts`, ~1000+ lines)

Two modes:
- **HEDGED**: Open long on one exchange + short on another, collect funding differential
  over ~8 hours. Close after funding payment.
- **NON_HEDGED**: Open single position seconds before funding, close seconds after.
  Higher risk, faster execution.

Execution flow (HEDGED mode):
1. User creates subscription via API (symbol, exchanges, leverage, quantity, mode)
2. Service starts countdown timer to next funding time
3. At `fundingTime - executionDelay` (default 5s): submit PRIMARY order
4. At `fundingTime` (countdown = 0): submit HEDGE order
5. After funding settles: close both positions, calculate P&L
6. For recurring subscriptions: reset and wait for next funding period

The service integrates with WAL-protected execution (see Section 6).

### 5.2 Bybit Funding Strategy

**Service**: `BybitFundingStrategyService` (`bybit-funding-strategy.service.ts`)

Bybit-specific NON_HEDGED strategy with configurable TP/SL as percentage of expected
funding rate. Supports position reopening within a funding cycle.

### 5.3 Price Arbitrage

**Service**: `PriceArbitrageService` (`price-arbitrage.service.ts`)

Monitors price spreads between exchanges. Opens SHORT on higher-priced exchange + LONG
on lower-priced exchange. Auto-closes on:
- Target spread convergence
- Stop-loss spread divergence
- Max holding time

Registered in the execution engine as `priceArbitrage` but comment says
"will be fully wired in Phase 2."

### 5.4 Graduated Entry

**Service**: `GraduatedEntryArbitrageService` (`graduated-entry-arbitrage.service.ts`)

Splits a large arbitrage order into N parts with configurable delay between each.
Simultaneously opens on primary + hedge exchanges. Strategy types:
- `combined` / `price_only` -- balance by coin quantity
- `funding_farm` / `spot_futures` -- balance by USDT value (uses ContractCalculator)

### 5.5 Triangular Arbitrage (experimental)

**Services**: `TriangularArbitrageOpportunityService`, `TriangularArbitrageExecutionService`

Database models exist (`TriangularArbitragePosition`, `TriangularArbitrageOpportunity`)
and service files are present. Uses Gate.io SPOT connector. Not started in
instrumentation.ts or the execution engine, so it appears to be experimental/manual only.


## 6. Safety Mechanisms

### 6.1 Position State Machine (13 states)

Defined in `position-state-machine.ts`. Every position progresses through explicit states
with validated transitions:

```
INTENT --> PRIMARY_SUBMITTING --> PRIMARY_FILLED --> HEDGE_SUBMITTING --> ACTIVE
                                                                          |
                                        CLOSE_TRIGGERED <----------------+
                                              |
                                           CLOSING --> PRIMARY_CLOSED --> COMPLETED
                                                                           (terminal)

Error paths:
  Any non-terminal state --> ERROR
  PRIMARY_FILLED or HEDGE_SUBMITTING --> ROLLING_BACK --> ROLLED_BACK (terminal)
  INTENT --> CANCELLED (terminal)
  ERROR --> ROLLING_BACK | CLOSING | COMPLETED (operator recovery)
```

Terminal states: `COMPLETED`, `ROLLED_BACK`, `CANCELLED`.

Capital-at-risk states (require exchange verification on recovery): `PRIMARY_SUBMITTING`,
`PRIMARY_FILLED`, `HEDGE_SUBMITTING`, `ACTIVE`, `CLOSE_TRIGGERED`, `CLOSING`,
`PRIMARY_CLOSED`, `ROLLING_BACK`, `ERROR`.

### 6.2 Write-Ahead Log (WAL)

**Repository**: `WALRepository` (`wal-repository.ts`) backed by `PositionWAL` table in
PostgreSQL (auto-incrementing sequence, append-only).

Every state transition follows:
1. Validate transition is allowed (state machine)
2. Write PENDING entry to PostgreSQL **before** any exchange call
3. If WAL write fails, exchange call **never** executes
4. On exchange success: confirm WAL entry
5. On exchange failure: mark WAL entry FAILED, alert, potentially rollback

WAL entry statuses: `PENDING`, `EXECUTING`, `CONFIRMED`, `FAILED`, `SUPERSEDED`.

### 6.3 WAL-Protected Execution Wrapper

**Class**: `WalProtectedExecution` (`wal-protected-execution.ts`)

Wraps exchange operations with WAL guarantees:
- `initPosition()` -- create state machine + INTENT WAL entry
- `openPrimaryLeg()` -- INTENT -> PRIMARY_SUBMITTING -> PRIMARY_FILLED
- `openHedgeLeg()` -- PRIMARY_FILLED -> HEDGE_SUBMITTING -> ACTIVE (with automatic rollback on hedge failure)
- `closePosition()` -- ACTIVE -> CLOSE_TRIGGERED -> CLOSING -> COMPLETED
- `openSingleLeg()` -- for NON_HEDGED mode (skips hedge states)
- `rollbackPrimary()` -- automatic when hedge fails: HEDGE_SUBMITTING -> ROLLING_BACK -> ROLLED_BACK

On hedge failure, the wrapper automatically:
1. Marks WAL entry as FAILED
2. Transitions to ROLLING_BACK
3. Calls the provided rollback function (close primary leg)
4. On rollback success: ROLLED_BACK (terminal), fires WARNING alert
5. On rollback failure: ERROR state, fires **CRITICAL** alert ("CAPITAL AT RISK: MANUAL_INTERVENTION_REQUIRED")

### 6.4 Crash Recovery

On startup, the execution engine:
1. Queries `PositionWAL` for all positions with capital at risk
2. For each, queries actual exchange state via the connector
3. Applies recovery decision matrix:

| Last WAL State      | Primary Exists | Hedge Exists | Action          |
|---------------------|---------------|--------------|-----------------|
| INTENT              | No            | No           | MARK_COMPLETED  |
| PRIMARY_SUBMITTING  | No            | No           | MARK_COMPLETED  |
| PRIMARY_SUBMITTING  | Yes           | No           | ROLLBACK        |
| PRIMARY_FILLED      | Yes           | No           | ROLLBACK        |
| HEDGE_SUBMITTING    | Yes           | Yes          | RESUME (ACTIVE) |
| ACTIVE              | Yes           | Yes          | RESUME          |
| ACTIVE              | Yes           | No           | EMERGENCY_CLOSE |
| ACTIVE              | No            | Yes          | EMERGENCY_CLOSE |
| Any                 | Unreachable   | Unreachable  | ESCALATE        |

ESCALATE fires a CRITICAL alert requiring operator intervention.

4. Supersedes any uncommitted (in-flight at crash time) WAL entries

### 6.5 Alert Service

**Service**: `AlertService` (`alert.service.ts`)

Severity levels: INFO, WARNING, CRITICAL.

Channels:
- Console (always enabled) -- logs via `console.error`
- Webhook (optional) -- Slack-compatible format via `ALERT_WEBHOOK_URL` env var

Fires automatically on:
- Position entering ERROR state
- Rollback failure (capital at risk)
- Recovery escalation (exchange unreachable)
- Invalid state transition attempts

### 6.6 Liquidation Monitor

**Service**: `LiquidationMonitorService` (`liquidation-monitor.service.ts`)

Runs continuously, monitors active positions for liquidation proximity.
Emits `evt:liquidation_warning` and `evt:liquidation_critical` events.

Uses `LiquidationCalculatorService` for position-specific calculations.


## 7. Data Model (PostgreSQL via Prisma)

Key tables:

| Model                            | Purpose                                            |
|----------------------------------|----------------------------------------------------|
| `User`                           | Auth, roles (BASIC/PREMIUM/ENTERPRISE/ADMIN)       |
| `ExchangeCredentials`            | Encrypted API keys per exchange, per user           |
| `FundingArbitrageSubscription`   | Funding arb subscriptions (HEDGED/NON_HEDGED)       |
| `PriceArbitragePosition`         | Price arb positions with entry/exit data            |
| `GraduatedEntryPosition`         | Multi-part graduated entry positions                |
| `TriangularArbitragePosition`    | Triangular arb (experimental)                       |
| `PositionWAL`                    | Write-ahead log (auto-increment seq, append-only)   |
| `FundingRate`                    | Historical funding rates (collector service)         |
| `TradingSymbol`                  | Exchange symbol metadata (qty step, tick size, etc.) |
| `ConnectorStateCache`            | Cached time offsets for exchange connectors           |
| `BenchmarkEvent` / `BenchmarkRun`| Latency benchmark results (nanosecond precision)     |
| `Subscription` / `PaymentEvent`  | Billing plans + NOWPayments IPN events               |
| `GridBot` / `GridBotTrade`       | Grid bot configuration and trades                    |
| `Session`                        | JWT sessions                                         |

Exchanges enum: BYBIT, BINANCE, OKX, KRAKEN, COINBASE, BINGX, MEXC, GATEIO, BITGET, KUCOIN.


## 8. API Layer (Next.js API Routes)

27 API route groups under `backend/src/app/api/`:

| Route Group              | Purpose                                         |
|--------------------------|-------------------------------------------------|
| `/api/auth`              | JWT login, Google OAuth, session management     |
| `/api/user`              | User profile, preferences                       |
| `/api/exchange-credentials` | CRUD for encrypted exchange API keys          |
| `/api/funding-arbitrage` | Create/cancel/list funding arb subscriptions     |
| `/api/arbitrage`         | Price arbitrage positions                        |
| `/api/funding-rates`     | Current and historical funding rates             |
| `/api/funding`           | Funding-related queries                          |
| `/api/billing`           | NOWPayments integration (create payment, IPN)    |
| `/api/subscriptions`     | Subscription plan management                     |
| `/api/benchmark`         | Latency benchmark execution and results          |
| `/api/bybit`             | Bybit-specific endpoints                         |
| `/api/bingx`             | BingX-specific endpoints                         |
| `/api/mexc`              | MEXC-specific endpoints                          |
| `/api/gateio`            | Gate.io-specific endpoints                       |
| `/api/kucoin`            | KuCoin-specific endpoints                        |
| `/api/okx`               | OKX-specific endpoints                           |
| `/api/binance`           | Binance-specific endpoints                       |
| `/api/bitget`            | Bitget-specific endpoints                        |
| `/api/exchange`          | Generic exchange operations                      |
| `/api/market-data`       | Market data queries                              |
| `/api/trading`           | Manual trading operations                        |
| `/api/liquidation`       | Liquidation risk queries                         |
| `/api/bybit-funding-strategy` | Bybit NON_HEDGED strategy management        |
| `/api/health`            | Health check endpoint                            |
| `/api/admin`             | Admin operations                                 |
| `/api/system`            | System status                                    |
| `/api/test-order`        | Order testing                                    |

Auth: JWT tokens + Google OAuth. Guards protect routes by role and subscription tier.


## 9. Frontend (Angular 18)

Served by Nginx on port 80. All components are lazy-loaded standalone components.

### Route map:

| Route                                         | Component                         | Guard          |
|-----------------------------------------------|-----------------------------------|----------------|
| `/login`                                      | LoginComponent                    | AuthGuard      |
| `/onboarding`                                 | OnboardingComponent               | AuthGuard      |
| `/dashboard`                                  | DashboardComponent                | Auth+Onboarding|
| `/trading/manual`                             | TradingDashboardComponent         | Auth+Onboarding|
| `/trading/bot/create`                         | BotConfigPageComponent            | Auth+Onboarding|
| `/trading/bot/edit/:id`                       | BotConfigPageComponent            | Auth+Onboarding|
| `/trading/bot/view/:id`                       | BotConfigPageComponent            | Auth+Onboarding|
| `/arbitrage/funding`                          | ArbitrageFundingComponent         | Auth+Onboarding|
| `/arbitrage/chart/:symbol/:primary/:hedge`    | ArbitrageChartComponent           | Auth+Onboarding|
| `/arbitrage/positions`                        | ActiveArbitragePositionsComponent | Auth+Onboarding|
| `/arbitrage/opportunities`                    | PriceArbitrageOpportunitiesComp.  | Auth+Onboarding+Subscription|
| `/profile`                                    | ProfileComponent                  | Auth+Onboarding|
| `/billing`                                    | BillingComponent                  | Auth+Onboarding|
| `/execution-metrics`                          | ExecutionMetricsComponent         | Auth+Onboarding|
| `/testing/api-tester`                         | ApiTesterComponent                | Auth+Onboarding|
| `/chart-demo`                                 | ChartDemoComponent                | Auth+Onboarding|
| `**`                                          | NotFoundComponent                 | --             |

Guards: `AuthGuard`, `OnboardingGuard`, `SubscriptionGuard`.


## 10. Trading Flow: Funding Arbitrage (HEDGED mode, step by step)

```
User                 Frontend            Backend API         Execution Engine       Exchange A    Exchange B
  |                     |                    |                      |                    |             |
  |--[create sub]------>|                    |                      |                    |             |
  |                     |--POST /api/funding-arbitrage------------>|                    |             |
  |                     |                    |--save to DB--------->|                    |             |
  |                     |                    |--create connector--->|                    |             |
  |                     |                    |--start countdown---->|                    |             |
  |                     |                    |                      |                    |             |
  |                     |<---countdown ticks (SSE/polling)---------|                    |             |
  |                     |                    |                      |                    |             |
  |            [T - executionDelay seconds]  |                      |                    |             |
  |                     |                    |                      |                    |             |
  |                     |                    |  WAL: INTENT->PRIMARY_SUBMITTING          |             |
  |                     |                    |--placeMarketOrder----|-->[submit order]-->|             |
  |                     |                    |  WAL: PRIMARY_SUBMITTING->PRIMARY_FILLED  |             |
  |                     |                    |                      |                    |             |
  |            [T = 0, funding time]         |                      |                    |             |
  |                     |                    |                      |                    |             |
  |                     |                    |  WAL: PRIMARY_FILLED->HEDGE_SUBMITTING    |             |
  |                     |                    |--placeMarketOrder----|---[submit order]---|------------>|
  |                     |                    |  WAL: HEDGE_SUBMITTING->ACTIVE            |             |
  |                     |                    |                      |                    |             |
  |            [Funding settles on exchange] |                      |                    |             |
  |                     |                    |                      |                    |             |
  |                     |                    |  WAL: ACTIVE->CLOSE_TRIGGERED->CLOSING    |             |
  |                     |                    |--closePosition-------|-->[close order]--->|             |
  |                     |                    |--closePosition-------|---[close order]----|------------>|
  |                     |                    |  WAL: CLOSING->COMPLETED                  |             |
  |                     |                    |--calculate P&L, update DB                 |             |
  |                     |<---position closed notification----------|                    |             |
  |<---[show result]----|                    |                      |                    |             |
```

If the hedge order fails, the WAL-protected execution wrapper automatically:
1. Marks HEDGE_SUBMITTING WAL entry as FAILED
2. Transitions to ROLLING_BACK
3. Closes the primary position on Exchange A
4. Transitions to ROLLED_BACK (or ERROR if rollback fails)
5. Fires alert


## 11. Data Flow: WebSocket to Ring Buffer to Engine

```
Bybit WebSocket                C++ Core                    Shared Memory            TS Engine
     |                            |                           (/data/shm)               |
     |--ticker JSON-------------->|                              |                       |
     |                            |--parse bid/ask/qty           |                       |
     |                            |--pack 64-byte slot           |                       |
     |                            |--write fields to slot        |                       |
     |                            |--write checksum              |                       |
     |                            |--write sequence LAST-------->| (slot flushed via fd)  |
     |                            |--update write cursor-------->| (header flushed)       |
     |                            |                              |                       |
     |                            |                              |<--tryRead()------------|
     |                            |                              |   refresh header       |
     |                            |                              |   refresh slot         |
     |                            |                              |   verify seq + checksum|
     |                            |                              |---MarketDataSlot------>|
     |                            |                              |                       |
     |                            |                              |        [use in arb     |
     |                            |                              |         calculations]  |
```

Notes:
- The TS `RingBufferReader` re-reads from the fd on each `tryRead()` -- not true mmap
- C++ writer uses true mmap, so writes are O(memcpy) + fsync
- Overrun detection: if reader falls behind by more than slotCount, it detects and skips


## 12. Latency Benchmarking

**Service**: `LatencyBenchmarkService` (`latency-benchmark.service.ts`)

Measures with `process.hrtime.bigint()` (nanosecond precision):
- Exchange REST order latency
- WebSocket first-message latency
- Time synchronization offset
- PostgreSQL write latency
- Settlement jitter (timing precision around funding time)
- Ring buffer read throughput
- UDS round-trip latency

Results stored in `BenchmarkRun` + `BenchmarkEvent` tables.
Viewable on the `/execution-metrics` frontend page.


## 13. Billing (NOWPayments)

Crypto payment integration via NOWPayments API:
- Create payment invoices
- IPN (Instant Payment Notification) webhook for payment status
- Idempotent processing via `PaymentEvent` table (unique `paymentId`)
- Sandbox mode for testing (`NOWPAYMENTS_SANDBOX=true`)
- Subscription plans: BASIC, PREMIUM, ENTERPRISE (with role-based access)

Env vars: `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `PUBLIC_BACKEND_URL`.


## 14. Technology Stack

| Layer          | Technology                | Version  |
|----------------|---------------------------|----------|
| Frontend       | Angular                   | 18       |
| Frontend serve | Nginx                     | (latest) |
| Backend API    | Next.js (App Router)      | 15       |
| Runtime        | Node.js                   | (LTS)   |
| Language       | TypeScript (strict)       | 5.x      |
| ORM            | Prisma                    | latest   |
| Database       | PostgreSQL                | 16       |
| Cache          | Redis                     | 7        |
| C++ Core       | C++17, Boost.Asio         | --       |
| C++ JSON       | nlohmann/json             | --       |
| Exchange lib   | CCXT                      | latest   |
| Validation     | Zod                       | latest   |
| Auth           | JWT + Google OAuth        | --       |
| Billing        | NOWPayments API           | --       |
| Container      | Docker Compose            | 3.8      |


## 15. Directory Structure

```
/
+-- docker-compose.yml              # All 6 services
+-- docker-compose.deploy.yml       # Production overrides
+-- ARCHITECTURE.md                 # This file
+-- CLAUDE.md                       # AI development instructions
+-- README.md
+-- .env.example
|
+-- backend/
|   +-- Dockerfile
|   +-- prisma/
|   |   +-- schema.prisma           # 25+ models
|   |   +-- seed-plans.ts           # Subscription plan seeding
|   |   +-- seed-admin.ts
|   +-- src/
|       +-- app/api/                # 27 API route groups
|       +-- connectors/             # 12 exchange connector files
|       |   +-- base-exchange.connector.ts
|       |   +-- exchange.factory.ts
|       |   +-- bybit.connector.ts
|       |   +-- bingx.connector.ts
|       |   +-- mexc.connector.ts
|       |   +-- ccxt-exchange.connector.ts
|       |   +-- ...
|       +-- execution-engine/       # Engine process + IPC
|       |   +-- engine-process.ts   # Standalone entry point
|       |   +-- ipc-protocol.ts     # Zod schemas, enums, ring buffer spec
|       |   +-- position-state-machine.ts  # 13 states + transitions
|       |   +-- wal-protected-execution.ts # WAL wrapper
|       |   +-- wal-repository.ts   # PostgreSQL WAL persistence
|       |   +-- ring-buffer.ts      # TS ring buffer reader/writer
|       |   +-- uds-transport.ts    # UDS server + client
|       |   +-- api-client.ts       # Engine API client
|       |   +-- connector-bridge.ts # Bridge to connectors
|       +-- services/               # 20+ service files
|       |   +-- funding-arbitrage.service.ts
|       |   +-- price-arbitrage.service.ts
|       |   +-- graduated-entry-arbitrage.service.ts
|       |   +-- alert.service.ts
|       |   +-- liquidation-monitor.service.ts
|       |   +-- latency-benchmark.service.ts
|       |   +-- ...
|       +-- lib/                    # Shared utilities
|       +-- strategies/             # Position close strategies
|       +-- types/                  # TypeScript type definitions
|       +-- instrumentation.ts      # Next.js startup hook
|
+-- cpp-core/
|   +-- Dockerfile
|   +-- src/
|       +-- main.cpp                # Entry point
|       +-- connectors/
|       |   +-- bybit_connector.hpp/cpp
|       +-- ipc/
|       |   +-- ring_buffer.hpp/cpp
|       |   +-- uds_client.hpp/cpp
|       +-- orders/
|       |   +-- order_pipeline.hpp/cpp
|       +-- time/
|           +-- time_sync.hpp/cpp
|
+-- frontend/
|   +-- Dockerfile
|   +-- src/app/
|       +-- app.routes.ts           # 15 routes
|       +-- pages/                  # 8 page components
|       +-- components/             # Shared components
|       +-- guards/                 # Auth, Onboarding, Subscription
|       +-- services/               # Angular services
|
+-- shared/                         # Shared utilities
+-- docs/                           # Additional documentation
+-- examples/                       # Usage examples
```


## 16. Key Environment Variables

| Variable                         | Used By          | Purpose                                      |
|----------------------------------|------------------|----------------------------------------------|
| `DATABASE_URL`                   | Backend, Engine  | PostgreSQL connection string                 |
| `REDIS_URL`                      | Backend, Engine  | Redis connection string                      |
| `JWT_SECRET`                     | Backend          | JWT token signing                            |
| `GOOGLE_CLIENT_ID/SECRET`        | Backend          | Google OAuth                                 |
| `ENCRYPTION_KEY`                 | Backend, Engine  | API key encryption at rest                   |
| `EXECUTION_ENGINE_SOCKET_PATH`   | All 3 processes  | UDS socket location                          |
| `MARKET_DATA_SHM_PATH`          | Engine, C++ Core | Ring buffer file path                        |
| `RING_BUFFER_SLOT_COUNT`         | C++ Core         | Ring buffer size (default 4096)              |
| `BYBIT_API_KEY/SECRET`           | Backend, Engine, C++ | Bybit API credentials                    |
| `BYBIT_SYMBOLS`                  | C++ Core         | Comma-separated symbols for WS subscription  |
| `CONNECTOR_MODE_BYBIT`           | C++ Core         | `shadow` (default) or `native`               |
| `MAX_SLIPPAGE_BPS`               | C++ Core         | Max slippage in basis points (default 50)    |
| `NOWPAYMENTS_API_KEY`            | Backend          | NOWPayments billing                          |
| `NOWPAYMENTS_IPN_SECRET`         | Backend          | IPN webhook verification                     |
| `NOWPAYMENTS_SANDBOX`            | Backend          | Use sandbox (default false)                  |
| `ALERT_WEBHOOK_URL`              | Engine           | Slack/Discord webhook for alerts             |
| `WHITELIST_IPS`                  | Backend          | Outbound IPs users must whitelist on exchanges|
| `FRONTEND_URL`                   | Backend          | CORS and OAuth redirect                      |
| `PUBLIC_BACKEND_URL`             | Backend          | Public URL for webhook callbacks             |


## 17. Known Architectural Tensions

1. **Service duplication**: Both `instrumentation.ts` (Next.js) and `engine-process.ts`
   initialize the same trading services. The intent is to migrate everything to the engine,
   but today both run them. This could cause duplicate timers or conflicting state.

2. **UDS command routing is mostly stubbed**: The IPC protocol defines 12 command types
   but only 2 are handled. Services still operate via direct function calls, not through
   the UDS command/response pattern.

3. **Ring buffer TS reader is not zero-copy**: Uses `fs.readSync`/`fs.writeSync` instead
   of true mmap. Works but adds syscall overhead compared to the C++ mmap side.

4. **C++ core is Bybit-only, shadow by default**: Other exchanges use TypeScript connectors
   exclusively. The C++ path for order submission exists but is not the production path.

5. **Connector factory imports both custom and CCXT**: Some exchanges appear in both lists
   (e.g., GATEIO, KUCOIN). The factory prefers custom connectors when available.
