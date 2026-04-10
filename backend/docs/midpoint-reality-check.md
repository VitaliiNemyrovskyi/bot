# Midpoint Reality Check: GO / NO-GO Assessment

**Date**: 2026-04-10
**Reviewer**: Reality Checker (skeptical, evidence-based)
**Branch**: `mvp`
**Verdict**: **CONDITIONAL GO** -- proceed to Phase 3 only after resolving 3 blockers

---

## Overall Decision

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | IPC Protocol Spec Completeness | **PASS** |
| 2 | Position State Machine Safety | **NEEDS WORK** |
| 3 | Security Posture | **NEEDS WORK** |
| 4 | Execution Engine Stability | **NEEDS WORK** |
| 5 | Ring Buffer Correctness | **NEEDS WORK** |
| 6 | FlatBuffers Schema Quality | **PASS** |
| 7 | Technical Debt | **BLOCKER** |

**3 items MUST be resolved before Phase 3 begins.** See Blockers section below.

---

## 1. IPC Protocol Spec Completeness -- PASS

**File**: `backend/docs/ipc-protocol-spec.md` (28KB)

The spec is thorough and implementable by a C++ developer without the TS codebase. It covers:

- Wire format with length-prefixed framing (Section 2.1)
- JSON/FlatBuffers auto-detection via first byte (Section 2.2)
- Complete message catalog with 13 commands, 11 events, 1 response type (Section 3)
- State machine contract with explicit transition table (Section 4)
- Ring buffer memory layout with byte offsets (Section 5)
- Error taxonomy with retry semantics (Section 6)
- Timing contract with clock sources and latency budgets (Section 7)
- C++ scope definition (Section 8)
- Migration bridge design (Section 9)
- Testing contract (Section 11)

**Minor gaps (non-blocking)**:
- Section 2.6 defines keepalive at 5s/15s timeout but does not specify what happens to in-flight commands when the engine is declared dead. Should commands time out independently?
- Section 5.3 step 6 says writer stores `write_cursor` with release semantics, but the actual value stored is `seq` (= `write_cursor + 1`). The spec and code agree, but the naming is confusing -- `write_cursor` in the header is really the latest sequence number, not a 0-based cursor.
- No backpressure spec for UDS: if the API layer sends commands faster than the engine processes them, what happens? The 1MB payload limit exists but there is no command queue depth limit.

**Verdict**: A competent C++ developer can implement against this spec. The gaps are clarification-level, not structural.

---

## 2. Position State Machine Safety -- NEEDS WORK

**Files**:
- `backend/src/execution-engine/position-state-machine.ts`
- `backend/src/execution-engine/wal-repository.ts`

**What is good**:
- All 13 states defined with explicit transition table (line 68-119)
- Terminal states properly block all transitions (COMPLETED, ROLLED_BACK, CANCELLED)
- CAPITAL_AT_RISK_STATES correctly identifies all states where money is on exchanges (line 133-143)
- Recovery decision matrix is comprehensive (line 366-377)
- WAL repository uses PostgreSQL with proper PENDING -> EXECUTING -> CONFIRMED lifecycle

**What is concerning**:

**(a) The state machine is in-memory only; WAL write is the caller's responsibility (line 228)**

```typescript
transition(toState: PositionState, reason: string): void {
  // in-memory only; WAL write is caller's responsibility
```

The spec says "Every transition MUST be logged to WAL BEFORE the exchange call" (Section 4.3, rule 1). But the `PositionStateMachine` class does not enforce this. It trusts the caller to:
1. Write WAL PENDING
2. Call `transition()`
3. Make exchange call
4. Confirm WAL

If any caller skips step 1 or step 4, capital safety is compromised. The state machine should either own the WAL write or refuse to transition without a WAL sequence number as proof.

**(b) No WAL write failure handling**

The critical question from the brief: "What happens if both exchange calls succeed but the WAL write fails?" Answer: **there is no handling for this case.** The `WALRepository.confirm()` method (wal-repository.ts line 84-96) is a simple Prisma update. If PostgreSQL is briefly unreachable when calling `confirm()`, the WAL entry stays in EXECUTING state. On recovery, this position would be treated as having an in-flight transition, and `supersedePendingEntries` (line 187) would mark it SUPERSEDED -- losing the fact that the exchange calls actually succeeded. The recovery logic would then ESCALATE (because `exchangeReachable` is hardcoded to `false` in the current stub).

**(c) Recovery is stubbed out (engine-process.ts lines 388-405)**

The `recoverPosition` method creates mock `ExchangePositionVerification` objects with `exchangeReachable: false` and `positionExists: false`. This means EVERY recovery will result in `RecoveryAction.ESCALATE` (because unreachable exchanges always escalate). If this engine is ever restarted with active positions, it will flag everything as needing operator intervention rather than auto-recovering.

The security audit flagged this as L4 (LOW). I disagree -- once real positions exist, this is HIGH. However, since Phase 3 is about C++ code (not going live with real money), it is not a blocker for Phase 3 specifically.

**Verdict**: The design is sound. The implementation has gaps in enforcement and recovery. Not a blocker for C++ development, but MUST be fixed before real capital flows through this system.

---

## 3. Security Posture -- NEEDS WORK

**File**: `backend/docs/security-audit.md`

**Status of the 4 CRITICAL findings**:

| Finding | Status | Evidence |
|---------|--------|----------|
| C1: Secrets in Git history | **PARTIALLY RESOLVED** | `.env` is not currently tracked (`git ls-files --error-unmatch .env` returns error). However, `backups/.env.backup_20251031_100759` WAS committed to history. The question is whether secret rotation has happened. No evidence of rotation. |
| C2: JWT fallback secret | **RESOLVED** | `auth.ts` line 29-36 now throws FATAL if JWT_SECRET is missing or < 32 chars. No fallback. |
| C3: Debug endpoints | **PARTIALLY RESOLVED** | Admin routes (`sync-symbols`, `update-funding-intervals`) now have ADMIN auth guards. But debug endpoints (`/api/debug/test-tpsl`, `/api/debug/test-gateio-tpsl`) still exist with NO authentication (test-tpsl/route.ts line 8: bare `POST` handler). |
| C4: Legacy encryption | **UNVERIFIED** | Not checked whether the legacy `/api/trading/api-keys/route.ts` has been removed. |

**Remaining risk**: The debug endpoints (`/api/debug/*`) are still live and unauthenticated. These allow arbitrary TP/SL execution. This is a capital-at-risk vulnerability in production.

**Verdict**: C2 is fixed. C1 needs secret rotation confirmation. C3 is half-fixed (admin routes hardened, debug routes still open). These do NOT block C++ development (Phase 3 is not a production deployment), but they MUST be closed before any production deployment.

---

## 4. Execution Engine Stability -- NEEDS WORK

**File**: `backend/src/execution-engine/engine-process.ts`

**What is good**:
- Clean lifecycle states: STARTING -> RECOVERING -> READY -> SHUTTING_DOWN -> STOPPED
- SIGTERM/SIGINT handlers with graceful shutdown (lines 528-535)
- `uncaughtException` triggers graceful shutdown (lines 536-538)
- `unhandledRejection` is caught and logged (lines 539-541)
- Shutdown rejects new commands with `ENGINE_SHUTTING_DOWN` (line 433)
- Services stopped in reverse order with try/catch per service (line 280-313)

**What is concerning**:

**(a) No PostgreSQL reconnection logic**

If PostgreSQL becomes briefly unreachable during `initializeDatabases()`, the engine throws and exits (line 162). There is no retry. If PostgreSQL drops mid-operation, the Prisma client will throw per-query, and the only error handling is the per-position try/catch in recovery (line 348). There is no circuit breaker, no connection pool health check, no automatic reconnection.

**(b) Redis failure is silently swallowed (line 223-226)**

```typescript
} catch (err: unknown) {
  console.warn('[ExecutionEngine] Redis connection failed, continuing without cache:', message);
}
```

The engine continues without Redis. This is reasonable for caching, but some services (funding tracker, liquidation monitor) may depend on Redis for pub/sub. If they fail silently, monitoring gaps could emerge.

**(c) Services typed as `unknown` (line 99)**

```typescript
private services: Record<string, unknown> = {};
```

Every service access requires an unsafe type assertion: `(svc['fundingTracker'] as { stopTracking: () => void }).stopTracking()`. If any service's API changes, this will fail at runtime, not compile time.

**(d) No shutdown timeout enforcement**

The config has `shutdownTimeoutMs` (default 30s), but `shutdown()` (line 171) does not actually enforce it. The `stopServices()` call can hang indefinitely if a service's stop method blocks. There should be a `Promise.race` with the timeout.

**(e) Heartbeat not wired up**

The `heartbeatIntervalMs` is passed to UDSServer but the engine itself does not verify heartbeats or emit heartbeat events with the schema defined in `EngineHeartbeatSchema` (event_loop_lag, wal_queue_depth, etc.). The UDSServer may send a basic keepalive, but the rich heartbeat payload from the spec is not populated.

**Verdict**: Adequate for development/testing. Not production-ready. The PostgreSQL resilience gap is the biggest concern for a system managing real positions.

---

## 5. Ring Buffer Correctness -- NEEDS WORK

**File**: `backend/src/execution-engine/ring-buffer.ts`

**What is good**:
- Correct SPSC pattern: single writer, single reader
- SeqLock variant with sequence written last via `Atomics.store` (release semantics, line 200)
- Reader double-checks sequence with `Atomics.load` (acquire semantics, lines 379, 397)
- Torn read detection with retry (up to 8 attempts, line 376)
- Checksum verification (XOR of 7 uint64 values, line 516)
- Overrun detection with cursor distance check (line 365)
- Batch read API (line 439)

**What is concerning**:

**(a) NOT actually cross-process shared memory**

The `RingBufferWriter` creates a `new SharedArrayBuffer(totalBytes)` in-process (line 125). The `persistToFile()` method (line 151) writes a **snapshot** of the buffer to disk using `fs.writeFileSync`. The `RingBufferReader.fromFile()` (line 334) reads this snapshot into a **new** `SharedArrayBuffer`.

**This does not create cross-process shared memory.** After `persistToFile()`, the writer's buffer and the reader's buffer are completely independent copies. Writes by the writer are NOT visible to the reader. This is a fundamental design flaw for the stated purpose (cross-process market data delivery).

For real cross-process shared memory, you need:
- On Linux: `shm_open` + `mmap` (or `/dev/shm/`)
- On macOS: `mmap` with `MAP_SHARED` on a file descriptor
- In Node.js: this requires a native addon (e.g., `mmap-io` or a custom N-API module) to map a file into a `SharedArrayBuffer`

The current implementation works correctly for **same-process** testing (passing the `SharedArrayBuffer` directly via constructor), but it will NOT work for the C++/TypeScript cross-process scenario described in the spec.

**This is the single biggest technical risk for Phase 3.** The C++ binary cannot see the TypeScript's `SharedArrayBuffer`, and vice versa.

**(b) ipc-protocol.ts slot layout comment says "padding" at offset 52-55**

The ipc-protocol.ts comment (line 266) says `[52..55] padding: 4 bytes`, but the actual ring-buffer.ts implementation writes `flags` at offset 52 (line 190: `this.dataView.setUint32(slotOffset + SLOT_OFF_FLAGS, 0, true)`). The IPC spec (Section 5.2) and FlatBuffers schema (market_data.fbs line 59) both say `flags`. The ipc-protocol.ts comment is stale. Minor inconsistency, but a C++ developer reading ipc-protocol.ts would see "padding" and skip those 4 bytes.

**(c) No ABA problem, but `Atomics` on non-shared DataView**

The writer uses `this.dataView.setFloat64(...)` for data fields (relaxed writes) and `Atomics.store` only for the sequence. This is correct for SPSC -- the sequence with release/acquire semantics provides the ordering guarantee. No ABA concern because sequences are monotonically increasing.

However, `DataView` operations on a `SharedArrayBuffer` are NOT guaranteed to be atomic for 8-byte values on all platforms. The spec says "data reads use relaxed loads" which in C++ means `std::memory_order_relaxed` on `std::atomic<uint64_t>`. In JavaScript, `DataView.getFloat64` on a `SharedArrayBuffer` is technically a non-atomic read, which could produce torn values on 32-bit platforms. On 64-bit x86/ARM64 (the target), aligned 8-byte loads are naturally atomic, so this is fine in practice. But it is an implicit platform assumption not documented anywhere.

**Verdict**: The algorithm is correct in principle, but the implementation cannot actually do cross-process IPC. This must be solved before C++ integration works.

---

## 6. FlatBuffers Schema Quality -- PASS

**Files**:
- `backend/src/execution-engine/schemas/envelope.fbs`
- `backend/src/execution-engine/schemas/commands.fbs`
- `backend/src/execution-engine/schemas/events.fbs`
- `backend/src/execution-engine/schemas/market_data.fbs`

**Consistency check**:

| Aspect | TypeScript (ipc-protocol.ts) | FlatBuffers (.fbs) | Match? |
|--------|------------------------------|---------------------|--------|
| Command types (13) | `CommandType` enum, string values | `MessageType` enum, uint8 values 0-21 | YES (1:1 mapping) |
| Event types (16) | `EventType` enum, string values | `MessageType` enum, uint8 values 100-151 | YES (1:1 mapping, includes PRICE_UPDATE/SPREAD_UPDATE) |
| Response status | `ResponseStatus` enum: ok/error/rejected | `ResponseStatusEnum`: Ok=0/Error=1/Rejected=2 | YES |
| Position states (13) | `PositionState` enum, string values | `PositionStateEnum` uint8, values 0-12 | YES (exact match in order and count) |
| Error codes | `ErrorCode` enum, dot-notation strings | Passed as `string` in `RespCommand.error_code` | COMPATIBLE (strings, not enum on wire) |
| Market data slot | `MarketDataSlot` interface | `PriceTick` struct in market_data.fbs | YES (identical field order/types/offsets) |
| Ring buffer header | Constants in ipc-protocol.ts | `RingBufferHeader` struct in market_data.fbs | YES (offsets match) |

**Minor observations**:
- The FlatBuffers `EvtEngineHeartbeat` includes `clock_offsets:[ExchangeClockOffset]` which is not in the TypeScript `EngineHeartbeatSchema` Zod schema. This is expected (TS heartbeat is Phase 1 JSON; clock offsets are Phase 2 C++ feature).
- The envelope uses optional table fields instead of FlatBuffers unions (envelope.fbs line 18-21 comment). This trades wire size for cross-language compatibility. Acceptable tradeoff.
- The `EvtEngineReady` in the FlatBuffers schema has `protocol_version:uint32` field. The TypeScript `ENGINE_READY` event does not include this field. The C++ implementation will need to add it.

**Verdict**: Schemas are well-structured and consistent with TypeScript types. A C++ developer can compile and implement against these.

---

## 7. Technical Debt -- BLOCKER

**Shortcuts that will bite during C++ integration**:

### BLOCKER-1: Ring buffer is not actually shared memory (see criterion 5a)

The `SharedArrayBuffer` + `writeFileSync` approach creates independent copies, not shared memory. The entire market data pipeline between C++ and TypeScript will not function. This MUST be resolved with a proper mmap-based approach before the C++ binary can read/write the ring buffer.

**Fix**: Create or adopt a Node.js native addon that provides `mmap`-backed `ArrayBuffer` / `SharedArrayBuffer`. The C++ side will use standard POSIX `mmap`. Both map the same file.

### BLOCKER-2: Recovery is stubbed -- positions will be orphaned on restart

`engine-process.ts` lines 388-405: `exchangeReachable: false` is hardcoded. Every recovery will escalate. If the engine is restarted during testing with any positions (even paper), they become permanently stuck in ERROR state requiring manual database intervention.

**Fix**: Wire the recovery to actual exchange connectors. Even a basic implementation that queries position existence would be sufficient.

### BLOCKER-3: Debug endpoints still live and unauthenticated

`/api/debug/test-tpsl` and `/api/debug/test-gateio-tpsl` still exist with zero authentication. Even during development, these are dangerous if the application is accessible on a network.

**Fix**: Delete these files. If test functionality is needed, put it behind ADMIN auth or a `NODE_ENV !== 'production'` guard.

### HIGH-RISK (not blocking Phase 3 but track):

**(a) Services typed as `unknown` in engine**

Every service is stored as `unknown` and accessed via unsafe casts. When the C++ bridge starts routing commands to services, type mismatches will be runtime errors, not compile errors. This should be migrated to a typed service registry.

**(b) No shutdown timeout enforcement**

`shutdownTimeoutMs` config exists but is not enforced. A hung service will prevent clean shutdown.

**(c) WAL write failure during confirmed exchange state**

No retry or recovery path if PostgreSQL is unreachable when confirming a WAL entry after a successful exchange call. Capital state could be lost.

**(d) ipc-protocol.ts comment says "padding" where implementation writes "flags"**

Line 266 of ipc-protocol.ts. A C++ developer reading this file (vs the spec or FlatBuffers schema) would get the wrong layout. Stale comment should be fixed.

**(e) `ConnectorMode` type mismatch between ipc-protocol.ts and connector-bridge.ts**

`ipc-protocol.ts` defines `ConnectorMode = 'typescript' | 'native'` (2 modes). `connector-bridge.ts` defines `BridgeMode = ConnectorMode | 'shadow'` (3 modes). The IPC spec (Section 9.1) defines 3 modes. The FlatBuffers schemas do not define a `ConnectorMode` enum at all. A C++ implementation would need to be told about `shadow` mode separately.

---

## Blockers (MUST resolve before Phase 3)

| # | Issue | Owner | Effort | Evidence |
|---|-------|-------|--------|----------|
| B1 | Ring buffer is not real shared memory | Backend | 2-3 days | ring-buffer.ts line 125: `new SharedArrayBuffer()` is process-local; `persistToFile()` creates a snapshot copy, not a shared mapping |
| B2 | Recovery is hardcoded to fail | Backend | 1-2 days | engine-process.ts lines 388-405: `exchangeReachable: false` stub means all recovery escalates |
| B3 | Debug endpoints unauthenticated | Backend | 1 hour | `backend/src/app/api/debug/test-tpsl/route.ts` line 8, `test-gateio-tpsl/route.ts` line 10: no auth check |

---

## Risks (track, do not block)

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R1 | WAL confirm failure after successful exchange call loses state | HIGH | Add retry with exponential backoff on WAL confirm; add a local fallback log file |
| R2 | State machine does not enforce WAL-before-transition | HIGH | Add `walSequence` parameter to `transition()` method |
| R3 | PostgreSQL unreachable during operation = engine crash | HIGH | Add connection pool health checks and retry logic |
| R4 | No shutdown timeout enforcement | MEDIUM | Add `Promise.race` with `shutdownTimeoutMs` in `shutdown()` |
| R5 | Services stored as `unknown` = runtime type errors | MEDIUM | Create typed service registry interface |
| R6 | Secret rotation not confirmed for C1 | MEDIUM | Verify ENCRYPTION_KEY, exchange keys, JWT_SECRET have been rotated |
| R7 | `DataView` 8-byte reads on SharedArrayBuffer are non-atomic | LOW | Document platform requirement (64-bit x86/ARM64) |
| R8 | Stale "padding" comment in ipc-protocol.ts line 266 | LOW | Fix comment to say "flags" |

---

## Prioritized Punch List

**Before Phase 3 starts (this week):**

1. **[B1]** Replace `SharedArrayBuffer` + file snapshot with `mmap`-backed shared memory (native addon or `/dev/shm` approach)
2. **[B2]** Wire recovery to actual exchange position queries (at minimum: call `getPosition()` on the relevant connectors)
3. **[B3]** Delete `/api/debug/test-tpsl` and `/api/debug/test-gateio-tpsl` directories entirely
4. **[R8]** Fix stale "padding" comment in ipc-protocol.ts line 266 to say "flags"

**During Phase 3 (parallel):**

5. **[R1]** Add retry logic to `WALRepository.confirm()` with 3 attempts, 100ms backoff
6. **[R2]** Add `walSequence` parameter to `PositionStateMachine.transition()`
7. **[R3]** Add PostgreSQL connection health check on engine startup with retry
8. **[R4]** Enforce shutdown timeout with `Promise.race`
9. **[R5]** Create typed service registry to replace `Record<string, unknown>`

**Before production (Phase 4):**

10. **[R6]** Confirm all secrets from C1 have been rotated
11. Implement all 4 test suites from Section 11 of the IPC spec (state machine conformance, ring buffer correctness, IPC round-trip, timing accuracy)
12. Load test the ring buffer with 1M+ ticks across processes to verify no data corruption
13. Add the `ConnectorMode` enum (3 values including `shadow`) to the FlatBuffers schemas

---

## Summary

The architecture is solid. The IPC spec is genuinely good -- detailed enough for independent implementation, with proper error handling and versioning. The state machine design with WAL is the right approach for capital safety. The FlatBuffers schemas are consistent with TypeScript types.

The main risks are implementation gaps, not design flaws:
- The ring buffer cannot actually share memory across processes (fatal for C++ interop)
- Recovery is stubbed and will fail on every restart
- A few unauthenticated endpoints remain

Fix these 3 blockers and Phase 3 can proceed. The remaining items are important but can be addressed in parallel with C++ development.
