# Performance Comparison: TypeScript vs C++ Execution Paths

## Overview

This document provides a detailed performance comparison between the two execution
paths in the crypto arbitrage trading platform:

1. **TypeScript path** - Node.js process handling WebSocket, order placement, and
   time sync entirely in JavaScript/TypeScript
2. **C++ path** - Standalone binary handling Bybit WebSocket and time sync via
   Beast/Boost.Asio, communicating with the TypeScript engine via shared memory
   ring buffer and Unix domain sockets

Analysis date: 2026-04-10
Architecture: Docker containers, Linux x86-64

---

## 1. Market Data Latency

### TypeScript Path

```
Exchange WS message
  -> Node.js 'ws' library receives Buffer
  -> JSON.parse() on message string
  -> EventEmitter.emit('update', parsed)
  -> Subscriber callback invoked
  -> Price available in application
```

**Key observations from `websocket-manager.service.ts`:**
- Uses the `ws` npm library with standard Node.js event loop
- Message path: `ws.on('message')` -> `JSON.parse()` -> `emitter.emit('update')`
- JSON.parse is the main CPU cost; a typical Bybit ticker message is ~500 bytes
- Node.js event loop latency adds 0.1-2ms jitter depending on load
- No intermediate copies beyond the ws library's internal Buffer handling

**Estimated latency breakdown:**
| Step                          | Typical (us) | P95 (us) |
|-------------------------------|-------------|----------|
| TLS decrypt (kernel/openssl)  | 5-20        | 50       |
| ws library frame decode       | 5-15        | 30       |
| JSON.parse (~500 bytes)       | 10-30       | 50       |
| EventEmitter dispatch         | 1-5         | 10       |
| **Total in-process**          | **21-70**   | **140**  |

### C++ Path

```
Exchange WS message
  -> Beast async_read completes on io_context thread
  -> nlohmann::json::parse() on message string
  -> parse_ticker() extracts bid/ask
  -> ticker_callback_ invoked (writes to ring buffer)
  -> RingBufferWriter::write() with atomic release
  -> TypeScript RingBufferReader::tryRead() with fs.readSync()
  -> Price available in TypeScript application
```

**Key observations from `bybit_connector.cpp` and `ring_buffer.cpp`:**
- Beast async_read delivers complete WebSocket frames via Boost.Asio
- nlohmann::json::parse is comparable to V8 JSON.parse for small payloads
- Ring buffer write: 64 bytes memcpy + atomic store = sub-microsecond
- **Critical bottleneck**: TypeScript reader uses `fs.readSync()` per slot

**The TypeScript ring buffer reader (`ring-buffer.ts` lines 394-401):**
```typescript
private refreshHeader(): void {
  fs.readSync(this.fd, this.localBuffer, 0, RING_BUFFER_HEADER_SIZE, 0);
}
private refreshSlot(slotOffset: number): void {
  fs.readSync(this.fd, this.localBuffer, slotOffset, RING_BUFFER_SLOT_SIZE, slotOffset);
}
```

Each `tryRead()` performs:
1. `refreshHeader()` - 128-byte pread syscall
2. `refreshSlot()` - 64-byte pread syscall
3. Second `refreshSlot()` for torn-read detection - 64-byte pread syscall

That is 3 syscalls per tick read, because Node.js cannot do true mmap from
pure JavaScript. Each pread is ~1-5us on Linux tmpfs.

**Estimated latency breakdown:**
| Step                          | Typical (us) | P95 (us) |
|-------------------------------|-------------|----------|
| TLS decrypt (kernel/openssl)  | 5-20        | 50       |
| Beast frame decode            | 3-10        | 20       |
| nlohmann::json::parse         | 8-25        | 40       |
| parse_ticker + state update   | 1-3         | 5        |
| Ring buffer write (atomic)    | 0.1-0.5     | 1        |
| **C++ subtotal**              | **17-58**   | **116**  |
| TS reader: pread header       | 1-5         | 10       |
| TS reader: pread slot         | 1-5         | 10       |
| TS reader: pread slot (verify)| 1-5         | 10       |
| Buffer.readDoubleLE etc       | 1-3         | 5        |
| **TS reader subtotal**        | **4-18**    | **35**   |
| **Total end-to-end**          | **21-76**   | **151**  |

### Verdict: Market Data Latency

The C++ path does not improve market data latency to the TypeScript application.
The C++ WebSocket handling saves approximately 5-15us in frame decode and JSON
parsing, but the ring buffer IPC adds 4-18us back due to the 3 pread syscalls
required by the TypeScript reader.

**Net difference: approximately 0us (within noise).**

The ring buffer would only provide a meaningful advantage if the reader were also
C++ (true mmap, zero syscalls) or if a Node.js native addon provided mmap access.

---

## 2. Order Submission Latency

### TypeScript Path

```
Trade decision
  -> BybitConnector.placeMarketOrder()
  -> validateAndAdjustQuantity() [REST call to getInstrumentsInfo]
  -> BybitService.placeOrder() [REST POST to /v5/order/create]
  -> Exchange ACK response
```

**Key observations from `bybit.connector.ts`:**
- Every market order makes TWO REST calls: instrument info + place order
- `validateAndAdjustQuantity()` fetches lot size rules on every order
  (no caching observed in the connector)
- Total: 2x HTTPS round-trips to Bybit (~50-200ms each)
- HMAC-SHA256 signing in JavaScript is ~0.1ms (negligible)

**Estimated latency:**
| Step                          | Typical (ms) | P95 (ms) |
|-------------------------------|-------------|----------|
| validateAndAdjustQuantity     | 50-150      | 250      |
| placeOrder REST call          | 50-150      | 250      |
| **Total**                     | **100-300** | **500**  |

### C++ Path

```
UDS command received by C++ process
  -> JSON decode command
  -> OrderPipeline::submit_market_order()
  -> check_slippage() [in-memory, from WebSocket state]
  -> authenticated_post() [synchronous Beast HTTPS to /v5/order/create]
  -> confirm_fill() [polling loop: authenticated_get /v5/order/realtime]
  -> UDS response back to TypeScript
```

**Key observations from `order_pipeline.cpp`:**
- No instrument info pre-fetch -- relies on caller for validated quantity
- Single REST call for order submission (not two)
- `confirm_fill()` adds a polling loop (up to `confirm_max_retries` attempts
  with `confirm_retry_delay_ms` sleep between each)
- Slippage check uses in-memory WebSocket state (zero network cost)
- HMAC-SHA256 via OpenSSL is ~0.05ms
- BUT: creates a new TCP+TLS connection per REST call (no connection pooling)

**Estimated latency:**
| Step                          | Typical (ms) | P95 (ms) |
|-------------------------------|-------------|----------|
| UDS command receive + decode  | 0.1-0.5     | 1        |
| Slippage check (in-memory)    | 0.001       | 0.01     |
| TCP connect + TLS handshake   | 30-80       | 150      |
| REST POST /v5/order/create    | 20-100      | 200      |
| confirm_fill (1+ polls)       | 50-300      | 500      |
| UDS response encode + send    | 0.1-0.5     | 1        |
| **Total**                     | **100-480** | **852**  |

### Verdict: Order Submission Latency

The C++ path is **potentially slower** for order submission because:

1. It creates a fresh TCP+TLS connection for every REST call (no pooling),
   adding 30-80ms of connection setup overhead
2. The `confirm_fill()` polling loop adds significant latency that the
   TypeScript path does not incur (TypeScript returns after placeOrder ACK)
3. The UDS round-trip adds ~0.5ms (negligible)

The C++ path saves ~50-150ms by skipping the instrument info pre-fetch, but
loses it back on connection setup and fill confirmation.

**Net difference: C++ is 0-200ms slower due to confirm_fill polling.**
**Without confirm_fill: C++ saves ~50ms by skipping instrument info fetch.**

The real optimization would be: cache instrument info in TypeScript (eliminates
the extra REST call) and implement connection pooling in C++ (eliminates per-call
TLS handshake).

---

## 3. Time Synchronization Accuracy

### TypeScript Path (`bybit.ts`)

- Single REST call to `getServerTime()` at initialization
- Periodic resync every 5 seconds via `setInterval`
- NTP-style offset: `offset = serverTime - (startTime + rtt/2)`
- Single probe per sync cycle (no outlier rejection)
- Offset stored as plain `number` (millisecond precision)
- No EMA smoothing -- each sync overwrites the offset completely

**Accuracy estimate:**
- Single-probe jitter: 20-100ms (one-way latency variance)
- No outlier rejection means occasional spikes propagate directly
- 5-second resync helps, but each resync introduces a step change
- **Typical accuracy: 10-50ms**

### C++ Path (`time_sync.cpp`)

- Initial calibration: 5 probes with outlier rejection (2-sigma)
- Uses median of filtered samples (robust to asymmetric routes)
- Continuous recalibration every 60 seconds
- EMA smoothing: `new_offset = old + (sample - old) * 0.3`
- Microsecond precision (`int64_t` microseconds)
- Nanosecond timestamps from `timeNano` endpoint when available

**Accuracy estimate:**
- Multi-probe median with outlier rejection: typical 5-20ms offset error
- EMA smoothing prevents step changes between recalibrations
- 60-second interval means less network overhead but slower adaptation
- **Typical accuracy: 5-20ms**

### Verdict: Time Synchronization

The C++ time sync is measurably better:
- **2-3x more accurate** due to multi-probe median and outlier rejection
- **Smoother** due to EMA blending (no sudden jumps)
- **More robust** against network jitter spikes

However, both are limited by the same fundamental constraint: HTTPS round-trip
to Bybit servers (~50-250ms RTT). Even perfect NTP-style algorithms cannot
achieve better than RTT/2 uncertainty.

**Net improvement: ~20-30ms better worst-case accuracy.**

For funding arbitrage (settlement windows of 30 seconds), this improvement is
meaningful but not transformative. The real risk is not clock offset but
execution timing during the settlement window.

---

## 4. Ring Buffer Throughput Analysis

### Configuration
- Slot size: 64 bytes (one cache line)
- Slot count: 4096
- Total buffer: 262,272 bytes (256 KB + 128-byte header)
- Protocol: SPSC lock-free with SeqLock variant

### C++ Writer Throughput

The writer path (`ring_buffer.cpp::write()`):
1. Compute slot index via bitmask: 1 instruction
2. memcpy 6 fields into slot: ~10ns for 48 bytes
3. Compute XOR checksum over 56 bytes: ~5ns
4. Atomic store with release semantics: ~5-20ns
5. Update header write cursor: ~5-20ns

**Theoretical maximum: ~25-50 million writes/second (20-40ns per write)**

In practice, the writer is paced by WebSocket message arrival rate. Bybit sends
ticker updates approximately 10-50 times per second per symbol. With 2 symbols
(BTCUSDT, ETHUSDT), the writer processes ~20-100 ticks/second -- far below
capacity.

### TypeScript Reader Throughput

The reader path (`ring-buffer.ts::tryRead()`):
1. `refreshHeader()`: pread(fd, 128 bytes, offset=0) -> ~2-5us
2. BigInt comparison for cursor check -> ~0.1us
3. `refreshSlot()`: pread(fd, 64 bytes, offset=N) -> ~2-5us
4. 8x Buffer.readXXXLE calls -> ~1-3us
5. Second `refreshSlot()` for torn detection -> ~2-5us
6. Checksum verification -> ~1us

**Per-read cost: ~8-19us (3 syscalls dominate)**

**Theoretical reader throughput: ~50,000-125,000 reads/second**

### Throughput vs Demand

| Metric                        | Value           |
|-------------------------------|-----------------|
| Writer capacity               | 25M writes/sec  |
| Reader capacity               | 50K-125K reads/sec |
| Actual tick rate (2 symbols)  | 20-100 ticks/sec |
| Reader headroom               | 500-6000x       |
| Buffer depth at 100 ticks/sec | 4096 / 100 = 40.9 seconds |

The ring buffer is massively over-provisioned for current use. The reader can
keep up with the writer by a factor of 500x+. Buffer overflow is not a concern.

### Latency per Read

At 100 ticks/sec with polling:
- If polling every 1ms: ~1ms average latency (plus ~10us read cost)
- If polling every 10ms: ~10ms average latency
- If event-driven (inotify): ~50-200us notification latency + ~10us read cost

**The polling interval dominates ring buffer read latency, not the read cost.**

---

## 5. IPC Overhead: UDS Message Round-Trip

### Frame Format
- 4-byte uint32 big-endian length prefix
- JSON payload (UTF-8 encoded)

### TypeScript UDS Client (`uds-transport.ts`)

Sending a command:
1. Build MessageEnvelope object with UUID, timestamp, sequence
2. `JSON.stringify()` the envelope: ~10-50us for typical command
3. Allocate 4-byte header + payload Buffer: ~1us
4. `socket.write()`: kernel copies to socket buffer: ~5-20us
5. Kernel delivers to receiver: ~10-50us (local UDS, no network)

Receiving a response:
1. `socket.on('data')` fires when kernel buffer has data: ~10-50us
2. `FrameDecoder.feed()` accumulates and parses: ~5-20us
3. `JSON.parse()` the payload: ~10-50us
4. Zod schema validation: ~5-20us

### C++ UDS Client (`uds_client.cpp`)

Sending:
1. `nlohmann::json` serialize: ~5-30us
2. `encode_frame()`: 4-byte header + copy: ~1us
3. `async_write()` to socket: ~5-20us

Receiving:
1. `async_read` header (4 bytes): ~10-50us
2. `async_read` body (N bytes): ~10-50us
3. `nlohmann::json::parse()`: ~5-30us
4. Callback dispatch: ~1us

### Full Round-Trip Estimate

```
TS Client -> UDS -> C++ Server: ~30-120us
C++ processes command: variable (depends on operation)
C++ Server -> UDS -> TS Client: ~30-120us
Total IPC overhead: ~60-240us per round-trip
```

### Comparison: Direct Function Call (TypeScript-only)

A direct function call within the same Node.js process:
- Function call + argument passing: ~0.01us
- No serialization needed
- No kernel involvement

**IPC overhead penalty: ~60-240us per command, or 0.06-0.24ms**

For order submission where the exchange REST call takes 50-200ms, this
0.06-0.24ms overhead is negligible (0.03-0.48% of total latency).

For high-frequency price data, the ring buffer (not UDS) is used, so UDS
overhead is not in the hot path.

---

## 6. Settlement Window Analysis

During the critical 30-second funding settlement window, the system must:
1. Monitor price changes across exchanges
2. Detect convergence/divergence opportunities
3. Submit orders within the window

### Tick Processing Capacity

In a 30-second window:

| Metric                          | TypeScript Path  | C++ Path        |
|---------------------------------|-----------------|-----------------|
| Incoming ticks (2 symbols)      | 600-3000        | 600-3000        |
| Tick processing time            | ~0.05ms each    | ~0.05ms each    |
| Total tick processing           | 30-150ms        | 30-150ms        |
| Available for decision + orders | 29.85-29.97s    | 29.85-29.97s    |

### Worst-Case Jitter

**TypeScript path:**
- Node.js event loop lag: 1-10ms under normal load, 10-50ms under GC pressure
- GC pause (V8 minor): 1-5ms, infrequent
- GC pause (V8 major): 10-100ms, rare but catastrophic during settlement
- Total worst-case jitter: **10-100ms**

**C++ path:**
- No GC pauses in C++ process
- Boost.Asio io_context is deterministic
- Ring buffer write is lock-free, bounded latency
- BUT: TypeScript reader still subject to Node.js GC
- UDS communication still subject to Node.js event loop
- Total worst-case jitter: **5-50ms** (bounded by TS reader side)

### Execution Window Risk

The funding settlement window (typically 30 seconds) is large relative to
execution latency. The critical path is:

1. Detect opportunity: ~0.1ms (price comparison)
2. Submit order: ~100-300ms (REST API round-trip)
3. Confirm fill: ~50-200ms (REST poll)

**Total execution time: ~150-500ms out of 30,000ms window.**

The C++ path reduces jitter by ~5-50ms but does not change the fundamental
constraint: the exchange REST API round-trip dominates execution time.

### Does C++ Reduce Settlement Window Risk?

Marginally. The primary risks during settlement are:
1. Exchange API slowdown under load (all participants trading simultaneously)
2. Network congestion to exchange servers
3. Rate limiting from excessive API calls

None of these are mitigated by C++ vs TypeScript. The C++ path helps with:
- Slightly better GC jitter isolation (but TS reader still has GC)
- Slightly better time sync accuracy (20-30ms improvement)

---

## 7. Summary Comparison Table

| Dimension                    | TypeScript     | C++ Path       | Difference       |
|------------------------------|---------------|----------------|------------------|
| Market data latency          | 21-70us       | 21-76us        | ~0us (neutral)   |
| Order submission             | 100-300ms     | 100-480ms      | 0-200ms slower   |
| Time sync accuracy           | 10-50ms       | 5-20ms         | 20-30ms better   |
| Ring buffer throughput       | N/A           | 50K-125K rd/s  | Over-provisioned |
| UDS round-trip overhead      | N/A           | 0.06-0.24ms    | Negligible       |
| Settlement window jitter     | 10-100ms      | 5-50ms         | Modest improvement|
| GC pause immunity            | No            | Partial        | Partial benefit  |

---

## 8. Recommendations

### Is the C++ Core Justified?

**For the current architecture: No.** The C++ core adds significant complexity
(build system, cross-language IPC, dual debugging) without delivering meaningful
latency improvement. The reasons:

1. **Network I/O dominates**: Exchange REST API calls (50-200ms) dwarf any
   in-process optimization. Making JSON parsing 10us faster is irrelevant when
   the order takes 150ms to reach the exchange.

2. **The ring buffer bottleneck**: The TypeScript reader cannot do true mmap
   from pure JavaScript, so the ring buffer's zero-copy advantage is negated by
   3 pread syscalls per read. The C++ writer's sub-microsecond writes are wasted
   when the reader takes 8-19us.

3. **Order pipeline regression**: The C++ order pipeline creates a new TLS
   connection per REST call (no pooling) and adds a fill-confirmation polling
   loop, making it potentially slower than the TypeScript path.

4. **Partial GC isolation**: Since the TypeScript engine must still read the
   ring buffer and process UDS messages, GC pauses still affect the hot path.
   True GC isolation would require the C++ core to make trading decisions
   autonomously.

### Actual Latency Improvement

| Metric                   | Improvement        |
|--------------------------|--------------------|
| Market data latency      | 0ms (neutral)      |
| Order submission         | -200ms (regression)|
| Time sync accuracy       | +20-30ms           |
| Settlement jitter        | +5-50ms            |

### What Should Move to C++ Next (If Anything)

If the C++ path is maintained, the highest-impact additions would be:

1. **Connection pooling for REST API calls**: Keep-alive HTTPS connections to
   Bybit would save 30-80ms per order (TLS handshake elimination). This is the
   single largest improvement available.

2. **Native mmap addon for Node.js**: A small N-API module that provides true
   mmap access to the ring buffer would eliminate the 3 pread syscalls per read,
   bringing reader latency from 8-19us down to ~0.5us.

3. **Autonomous execution mode**: If the C++ core could make and execute trading
   decisions independently (detect opportunity -> submit order -> confirm fill),
   it would eliminate the UDS round-trip and Node.js GC dependency entirely.
   This would provide true microsecond-level execution.

### Architectural Changes With Bigger Impact Than C++ Migration

**These would yield 10-100x more improvement than the C++ core:**

1. **WebSocket private feed for order updates** (saves 50-300ms per trade):
   Instead of polling `/v5/order/realtime` for fill confirmation, subscribe to
   Bybit's private WebSocket order stream. Fill notifications arrive in 1-10ms
   instead of requiring a REST poll.

2. **Instrument info caching** (saves 50-150ms per order):
   Cache lot size filters and trading rules at startup (or with TTL). The
   current TypeScript path calls `getInstrumentsInfo` on every single order.

3. **HTTP connection keep-alive** (saves 30-80ms per REST call):
   Maintain persistent HTTPS connections to exchange APIs. Both the TypeScript
   and C++ paths currently create new connections per request.

4. **Co-located infrastructure** (saves 10-50ms per REST call):
   Deploy the trading bot in the same AWS/GCP region as the exchange's matching
   engine. Network proximity reduces RTT from 50-200ms to 5-20ms.

5. **Pre-computed order parameters** (saves 1-5ms per decision):
   Compute position sizes, leverage, and order parameters ahead of the
   settlement window rather than calculating during the critical path.

---

## Appendix: Test Methodology

This analysis is based on:
- Static code path analysis of both TypeScript and C++ implementations
- Known system call costs on Linux x86-64 (tmpfs pread, UDS write, etc.)
- Bybit API documented latency characteristics
- Calibration data from the running C++ core (~93ms offset, ~257ms RTT to Bybit)
- Node.js V8 GC pause characteristics from production profiling literature

For empirical validation, use the benchmark service at
`/api/benchmark/run` with the `RING_BUFFER_READ` and `UDS_ROUND_TRIP`
event types added in the companion code change.
