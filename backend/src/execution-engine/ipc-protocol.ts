/**
 * IPC Protocol Specification
 *
 * Defines the communication contract between the API layer (Next.js)
 * and the execution engine (standalone Node.js process).
 *
 * Transport layers:
 * - Unix domain sockets for commands/responses (reliable, ordered)
 * - SharedArrayBuffer ring buffers for market data (zero-copy, lock-free)
 *
 * Message encoding:
 * - Phase 1 (TypeScript): JSON with length-prefix framing over UDS
 * - Phase 2 (C++ bridge): FlatBuffers for zero-copy deserialization
 *
 * All messages include monotonic sequence numbers for ordering guarantees
 * and nanosecond timestamps via process.hrtime.bigint().
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Envelope: every message across the wire is wrapped in this
// ---------------------------------------------------------------------------

export const MessageEnvelopeSchema = z.object({
  /** Monotonically increasing per-sender sequence number */
  seq: z.number().int().nonnegative(),
  /** Nanosecond timestamp from process.hrtime.bigint(), serialized as string */
  timestampNs: z.string(),
  /** Unique correlation ID for request/response matching */
  correlationId: z.string().uuid(),
  /** Message type discriminator */
  type: z.string(),
  /** Payload (type-specific, validated separately) */
  payload: z.unknown(),
});

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;

// ---------------------------------------------------------------------------
// Command messages: API layer -> Execution engine
// ---------------------------------------------------------------------------

export enum CommandType {
  // Position lifecycle
  OPEN_POSITION = 'cmd:open_position',
  CLOSE_POSITION = 'cmd:close_position',
  CANCEL_POSITION = 'cmd:cancel_position',

  // Subscription lifecycle (funding arbitrage)
  CREATE_SUBSCRIPTION = 'cmd:create_subscription',
  CANCEL_SUBSCRIPTION = 'cmd:cancel_subscription',

  // Graduated entry
  START_GRADUATED_ENTRY = 'cmd:start_graduated_entry',
  STOP_GRADUATED_ENTRY = 'cmd:stop_graduated_entry',

  // Engine control
  GET_ENGINE_STATUS = 'cmd:get_engine_status',
  SHUTDOWN_ENGINE = 'cmd:shutdown_engine',

  // Position queries (engine holds authoritative state)
  GET_POSITION_STATE = 'cmd:get_position_state',
  GET_ALL_POSITIONS = 'cmd:get_all_positions',

  // Connector management
  WARMUP_CONNECTOR = 'cmd:warmup_connector',
  INVALIDATE_CONNECTOR = 'cmd:invalidate_connector',
}

// ---------------------------------------------------------------------------
// Event messages: Execution engine -> API layer
// ---------------------------------------------------------------------------

export enum EventType {
  // Position state changes
  POSITION_STATE_CHANGED = 'evt:position_state_changed',
  POSITION_OPENED = 'evt:position_opened',
  POSITION_CLOSED = 'evt:position_closed',
  POSITION_ERROR = 'evt:position_error',

  // Execution progress
  ORDER_SUBMITTED = 'evt:order_submitted',
  ORDER_FILLED = 'evt:order_filled',
  ORDER_REJECTED = 'evt:order_rejected',
  GRADUATED_ENTRY_PROGRESS = 'evt:graduated_entry_progress',

  // Funding arbitrage
  COUNTDOWN_TICK = 'evt:countdown_tick',
  FUNDING_COLLECTED = 'evt:funding_collected',

  // Monitoring
  LIQUIDATION_WARNING = 'evt:liquidation_warning',
  LIQUIDATION_CRITICAL = 'evt:liquidation_critical',

  // Engine health
  ENGINE_HEARTBEAT = 'evt:engine_heartbeat',
  ENGINE_READY = 'evt:engine_ready',
  ENGINE_SHUTTING_DOWN = 'evt:engine_shutting_down',

  // Market data (for low-frequency updates over UDS; high-frequency goes via ring buffer)
  PRICE_UPDATE = 'evt:price_update',
  SPREAD_UPDATE = 'evt:spread_update',
}

// ---------------------------------------------------------------------------
// Response messages: Execution engine -> API layer (in response to commands)
// ---------------------------------------------------------------------------

export enum ResponseStatus {
  OK = 'ok',
  ERROR = 'error',
  REJECTED = 'rejected',
}

export const CommandResponseSchema = z.object({
  status: z.nativeEnum(ResponseStatus),
  /** Original command correlation ID */
  correlationId: z.string().uuid(),
  /** Result payload (type-specific) */
  data: z.unknown().optional(),
  /** Error details if status !== OK */
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      retryable: z.boolean(),
    })
    .optional(),
});

export type CommandResponse = z.infer<typeof CommandResponseSchema>;

// ---------------------------------------------------------------------------
// Error codes: hierarchical, machine-parseable
// ---------------------------------------------------------------------------

export enum ErrorCode {
  // Exchange errors
  EXCHANGE_UNREACHABLE = 'exchange.unreachable',
  EXCHANGE_RATE_LIMITED = 'exchange.rate_limited',
  EXCHANGE_INSUFFICIENT_BALANCE = 'exchange.insufficient_balance',
  EXCHANGE_INVALID_SYMBOL = 'exchange.invalid_symbol',
  EXCHANGE_ORDER_REJECTED = 'exchange.order_rejected',
  EXCHANGE_POSITION_NOT_FOUND = 'exchange.position_not_found',

  // Engine errors
  ENGINE_BUSY = 'engine.busy',
  ENGINE_SHUTTING_DOWN = 'engine.shutting_down',
  ENGINE_CONNECTOR_INIT_FAILED = 'engine.connector_init_failed',

  // Position errors
  POSITION_INVALID_STATE_TRANSITION = 'position.invalid_state_transition',
  POSITION_ALREADY_EXISTS = 'position.already_exists',
  POSITION_NOT_FOUND = 'position.not_found',
  POSITION_LEG_FAILED = 'position.leg_failed',
  POSITION_ROLLBACK_FAILED = 'position.rollback_failed',

  // Validation errors
  VALIDATION_FAILED = 'validation.failed',
  VALIDATION_MISSING_CREDENTIALS = 'validation.missing_credentials',

  // Internal errors
  INTERNAL_WAL_WRITE_FAILED = 'internal.wal_write_failed',
  INTERNAL_DB_ERROR = 'internal.db_error',
  INTERNAL_UNEXPECTED = 'internal.unexpected',
}

// ---------------------------------------------------------------------------
// Typed command payloads
// ---------------------------------------------------------------------------

export const OpenPositionCommandSchema = z.object({
  userId: z.string(),
  symbol: z.string(),
  primaryExchange: z.string(),
  primaryCredentialId: z.string(),
  primarySide: z.enum(['long', 'short']),
  primaryLeverage: z.number().positive(),
  primaryQuantity: z.number().positive(),
  hedgeExchange: z.string(),
  hedgeCredentialId: z.string(),
  hedgeSide: z.enum(['long', 'short']),
  hedgeLeverage: z.number().positive(),
  hedgeQuantity: z.number().positive(),
  graduatedEntryParts: z.number().int().positive().optional(),
  graduatedEntryDelayMs: z.number().int().nonnegative().optional(),
  strategyType: z.enum(['combined', 'price_only', 'funding_farm', 'spot_futures']).optional(),
});

export type OpenPositionCommand = z.infer<typeof OpenPositionCommandSchema>;

export const ClosePositionCommandSchema = z.object({
  positionId: z.string(),
  userId: z.string(),
  reason: z.enum(['user_requested', 'convergence', 'stop_loss', 'max_holding_time', 'liquidation_risk']),
});

export type ClosePositionCommand = z.infer<typeof ClosePositionCommandSchema>;

export const CreateSubscriptionCommandSchema = z.object({
  userId: z.string(),
  symbol: z.string(),
  fundingRate: z.number(),
  nextFundingTime: z.number().int().positive(),
  positionType: z.enum(['long', 'short']),
  quantity: z.number().positive(),
  primaryExchange: z.string(),
  primaryCredentialId: z.string(),
  hedgeExchange: z.string().optional(),
  hedgeCredentialId: z.string().optional(),
  mode: z.enum(['HEDGED', 'NON_HEDGED']),
  leverage: z.number().positive(),
  margin: z.number().positive().optional(),
  executionDelay: z.number().int().nonnegative().optional(),
  takeProfitPercent: z.number().optional(),
  stopLossPercent: z.number().optional(),
});

export type CreateSubscriptionCommand = z.infer<typeof CreateSubscriptionCommandSchema>;

// ---------------------------------------------------------------------------
// Typed event payloads
// ---------------------------------------------------------------------------

export const PositionStateChangedEventSchema = z.object({
  positionId: z.string(),
  previousState: z.string(),
  newState: z.string(),
  reason: z.string(),
  walSequence: z.number().int().nonnegative(),
  exchangeVerified: z.boolean(),
  timestampNs: z.string(),
});

export type PositionStateChangedEvent = z.infer<typeof PositionStateChangedEventSchema>;

export const EngineHeartbeatSchema = z.object({
  uptimeMs: z.number().int().nonnegative(),
  activePositions: z.number().int().nonnegative(),
  activeSubscriptions: z.number().int().nonnegative(),
  connectorCount: z.number().int().nonnegative(),
  memoryUsageMb: z.number().nonnegative(),
  eventLoopLagMs: z.number().nonnegative(),
  walQueueDepth: z.number().int().nonnegative(),
});

export type EngineHeartbeat = z.infer<typeof EngineHeartbeatSchema>;

// ---------------------------------------------------------------------------
// Ring buffer layout for market data (SharedArrayBuffer, lock-free SPSC)
// ---------------------------------------------------------------------------

/**
 * Market data ring buffer specification.
 *
 * Layout (per slot, 64 bytes aligned for cache line):
 *   [0..7]   sequence: uint64   - monotonic slot sequence
 *   [8..15]  timestampNs: uint64 - hrtime.bigint() when written
 *   [16..23] bidPrice: float64  - best bid
 *   [24..31] askPrice: float64  - best ask
 *   [32..39] bidQty: float64    - bid depth at best
 *   [40..47] askQty: float64    - ask depth at best
 *   [48..49] exchangeId: uint16 - enum index
 *   [50..51] symbolId: uint16   - lookup table index
 *   [52..55] padding: 4 bytes
 *   [56..63] checksum: uint64   - XOR of first 7 uint64s (corruption detection)
 *
 * Total slot size: 64 bytes (one cache line)
 * Ring size: configurable, recommended 4096 slots = 256 KB
 *
 * Protocol:
 * - Writer: increments sequence atomically AFTER writing all fields
 * - Reader: reads sequence, then fields, then sequence again. If mismatch, re-read.
 * - This is a single-producer single-consumer (SPSC) lock-free design.
 */

export const RING_BUFFER_SLOT_SIZE = 64;
export const RING_BUFFER_DEFAULT_SLOTS = 4096;
export const RING_BUFFER_HEADER_SIZE = 128; // Metadata: write cursor, read cursor, config

export interface RingBufferConfig {
  slotCount: number;
  slotSizeBytes: number;
  /** Filesystem path for the shared memory file (mmap-backed) */
  shmPath: string;
}

export interface MarketDataSlot {
  sequence: bigint;
  timestampNs: bigint;
  bidPrice: number;
  askPrice: number;
  bidQty: number;
  askQty: number;
  exchangeId: number;
  symbolId: number;
}

// ---------------------------------------------------------------------------
// Wire protocol: length-prefixed JSON over Unix domain socket
// ---------------------------------------------------------------------------

/**
 * Frame format for Unix domain socket messages:
 *
 *   [4 bytes] payload length (uint32 big-endian)
 *   [N bytes] JSON payload (UTF-8)
 *
 * Maximum payload size: 1 MB (sanity limit)
 * Keepalive: engine sends heartbeat every 5 seconds
 * Reconnect: API layer reconnects with exponential backoff (1s, 2s, 4s, max 30s)
 */

export const UDS_MAX_PAYLOAD_BYTES = 1024 * 1024; // 1 MB
export const UDS_HEARTBEAT_INTERVAL_MS = 5000;
export const UDS_RECONNECT_INITIAL_MS = 1000;
export const UDS_RECONNECT_MAX_MS = 30000;

/** Default Unix domain socket path */
export const UDS_SOCKET_PATH_ENV = 'EXECUTION_ENGINE_SOCKET_PATH';
export const UDS_SOCKET_PATH_DEFAULT = '/tmp/bot-execution-engine.sock';

/** Default shared memory path for ring buffer */
export const SHM_PATH_ENV = 'MARKET_DATA_SHM_PATH';
export const SHM_PATH_DEFAULT = '/tmp/bot-market-data.shm';

// ---------------------------------------------------------------------------
// ConnectorMode discriminator (for dual TypeScript/C++ implementation)
// ---------------------------------------------------------------------------

export type ConnectorMode = 'typescript' | 'native';

export const ConnectorModeSchema = z.enum(['typescript', 'native']);
