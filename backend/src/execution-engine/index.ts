/**
 * Execution Engine Module
 *
 * Public API for the execution engine layer.
 *
 * For the API process (Next.js), import the UDS client:
 *   import { UDSClient, CommandType } from '@/execution-engine';
 *
 * For the execution engine process, import the engine:
 *   import { ExecutionEngine } from '@/execution-engine';
 */

// IPC Protocol (shared between API and engine)
export {
  MessageEnvelopeSchema,
  CommandType,
  EventType,
  ResponseStatus,
  ErrorCode,
  CommandResponseSchema,
  OpenPositionCommandSchema,
  ClosePositionCommandSchema,
  CreateSubscriptionCommandSchema,
  PositionStateChangedEventSchema,
  EngineHeartbeatSchema,
  RING_BUFFER_SLOT_SIZE,
  RING_BUFFER_DEFAULT_SLOTS,
  RING_BUFFER_HEADER_SIZE,
  UDS_MAX_PAYLOAD_BYTES,
  UDS_HEARTBEAT_INTERVAL_MS,
  UDS_SOCKET_PATH_ENV,
  UDS_SOCKET_PATH_DEFAULT,
  ConnectorModeSchema,
} from './ipc-protocol';
export type {
  MessageEnvelope,
  CommandResponse,
  OpenPositionCommand,
  ClosePositionCommand,
  CreateSubscriptionCommand,
  PositionStateChangedEvent,
  EngineHeartbeat,
  RingBufferConfig,
  MarketDataSlot,
  ConnectorMode,
} from './ipc-protocol';

// Position State Machine
export {
  PositionState,
  PositionStateMachine,
  PositionStateError,
  VALID_TRANSITIONS,
  TERMINAL_STATES,
  CAPITAL_AT_RISK_STATES,
  WALEntryStatus,
  WALEntrySchema,
  RecoveryAction,
  determineRecoveryAction,
} from './position-state-machine';
export type {
  WALEntry,
  ExchangePositionVerification,
  RecoveryPlan,
} from './position-state-machine';

// WAL Repository
export { WALRepository } from './wal-repository';

// Transport Layer
export {
  UDSServer,
  UDSClient,
  FrameDecoder,
  encodeFrame,
} from './uds-transport';
export type {
  UDSServerOptions,
  UDSClientOptions,
} from './uds-transport';

// Typed Connector Interface
export {
  TypedConnectorAdapter,
  TypedConnectorFactory,
  TimingMetadataSchema,
  OrderResultSchema,
  BalanceSchema,
  PositionInfoSchema,
  OrderStatusSchema,
  ClosePositionResultSchema,
  TradingStopResultSchema,
  SymbolLimitsSchema,
} from './typed-connector-interface';
export type {
  ITypedExchangeConnector,
  TypedResponse,
  TimingMetadata,
  OrderResult,
  Balance,
  PositionInfo,
  OrderStatus,
  ClosePositionResult,
  TradingStopResult,
  SymbolLimits,
  ConnectorFactoryParams,
} from './typed-connector-interface';

// Engine Process
export {
  ExecutionEngine,
  EngineLifecycleState,
} from './engine-process';
export type {
  ExecutionEngineConfig,
} from './engine-process';
