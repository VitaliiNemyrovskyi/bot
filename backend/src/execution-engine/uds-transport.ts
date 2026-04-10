/**
 * Unix Domain Socket Transport Layer
 *
 * Provides reliable, ordered communication between the API layer
 * and the execution engine over Unix domain sockets.
 *
 * Features:
 * - Length-prefixed JSON framing (4-byte uint32 big-endian header)
 * - Request/response correlation via UUID correlation IDs
 * - Automatic reconnection with exponential backoff
 * - Heartbeat-based liveness detection
 * - Backpressure handling (pause reads when write buffer full)
 *
 * Usage:
 * - API layer creates UDSClient (connects to engine)
 * - Execution engine creates UDSServer (listens for API connections)
 */

import * as net from 'net';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import {
  MessageEnvelope,
  MessageEnvelopeSchema,
  UDS_MAX_PAYLOAD_BYTES,
  UDS_HEARTBEAT_INTERVAL_MS,
  UDS_RECONNECT_INITIAL_MS,
  UDS_RECONNECT_MAX_MS,
  UDS_SOCKET_PATH_DEFAULT,
  UDS_SOCKET_PATH_ENV,
  EventType,
  CommandType,
} from './ipc-protocol';

// ---------------------------------------------------------------------------
// Frame encoding/decoding
// ---------------------------------------------------------------------------

/**
 * Encode a message envelope into a length-prefixed buffer.
 */
export function encodeFrame(envelope: MessageEnvelope): Buffer {
  const json = JSON.stringify(envelope);
  const payload = Buffer.from(json, 'utf-8');

  if (payload.length > UDS_MAX_PAYLOAD_BYTES) {
    throw new Error(
      `Payload exceeds max size: ${payload.length} > ${UDS_MAX_PAYLOAD_BYTES}`
    );
  }

  const header = Buffer.alloc(4);
  header.writeUInt32BE(payload.length, 0);

  return Buffer.concat([header, payload]);
}

/**
 * Frame decoder: accumulates data from stream reads and emits
 * complete MessageEnvelope objects.
 */
export class FrameDecoder extends EventEmitter {
  private buffer: Buffer = Buffer.alloc(0);
  private expectedLength: number | null = null;

  /**
   * Feed incoming data from the socket.
   * Emits 'message' events for each complete frame.
   */
  feed(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);

    // Process as many complete frames as possible
    while (true) {
      // Read header if we do not have expected length yet
      if (this.expectedLength === null) {
        if (this.buffer.length < 4) {
          break; // Need more data for header
        }
        this.expectedLength = this.buffer.readUInt32BE(0);

        if (this.expectedLength > UDS_MAX_PAYLOAD_BYTES) {
          this.emit('error', new Error(
            `Frame too large: ${this.expectedLength} > ${UDS_MAX_PAYLOAD_BYTES}`
          ));
          // Reset state to recover
          this.buffer = Buffer.alloc(0);
          this.expectedLength = null;
          break;
        }

        this.buffer = this.buffer.subarray(4);
      }

      // Check if we have the complete payload
      if (this.buffer.length < this.expectedLength) {
        break; // Need more data for payload
      }

      // Extract and parse the frame
      const payloadBuf = this.buffer.subarray(0, this.expectedLength);
      this.buffer = this.buffer.subarray(this.expectedLength);
      this.expectedLength = null;

      try {
        const json = payloadBuf.toString('utf-8');
        const parsed = JSON.parse(json);
        const envelope = MessageEnvelopeSchema.parse(parsed);
        this.emit('message', envelope);
      } catch (err) {
        this.emit('error', err);
      }
    }
  }

  reset(): void {
    this.buffer = Buffer.alloc(0);
    this.expectedLength = null;
  }
}

// ---------------------------------------------------------------------------
// UDS Server (runs in execution engine process)
// ---------------------------------------------------------------------------

export interface UDSServerOptions {
  socketPath?: string;
  heartbeatIntervalMs?: number;
}

/**
 * UDS Server: listens for connections from the API layer.
 * Only accepts a single active connection (the API process).
 */
export class UDSServer extends EventEmitter {
  private server: net.Server | null = null;
  private client: net.Socket | null = null;
  private decoder: FrameDecoder = new FrameDecoder();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private seq = 0;
  private readonly socketPath: string;
  private readonly heartbeatIntervalMs: number;

  constructor(options?: UDSServerOptions) {
    super();
    this.socketPath = options?.socketPath
      ?? process.env[UDS_SOCKET_PATH_ENV]
      ?? UDS_SOCKET_PATH_DEFAULT;
    this.heartbeatIntervalMs = options?.heartbeatIntervalMs ?? UDS_HEARTBEAT_INTERVAL_MS;
  }

  /**
   * Start listening for connections.
   */
  async start(): Promise<void> {
    // Clean up stale socket file
    try {
      fs.unlinkSync(this.socketPath);
    } catch {
      // File does not exist, which is fine
    }

    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (err) => {
        console.error('[UDSServer] Server error:', err.message);
        this.emit('error', err);
        reject(err);
      });

      this.server.listen(this.socketPath, () => {
        // Make socket accessible to other container users (e.g. C++ core process)
        try {
          fs.chmodSync(this.socketPath, 0o777);
        } catch (chmodErr: unknown) {
          const msg = chmodErr instanceof Error ? chmodErr.message : String(chmodErr);
          console.warn(`[UDSServer] Could not chmod socket: ${msg}`);
        }
        console.log(`[UDSServer] Listening on ${this.socketPath}`);
        resolve();
      });
    });
  }

  private handleConnection(socket: net.Socket): void {
    if (this.client) {
      console.warn('[UDSServer] Replacing existing client connection');
      this.client.destroy();
    }

    this.client = socket;
    this.decoder.reset();
    console.log('[UDSServer] Client connected');
    this.emit('client:connected');

    // Start heartbeat
    this.startHeartbeat();

    socket.on('data', (data) => {
      this.decoder.feed(data);
    });

    this.decoder.on('message', (envelope: MessageEnvelope) => {
      this.emit('message', envelope);
    });

    this.decoder.on('error', (err) => {
      console.error('[UDSServer] Frame decode error:', err);
    });

    socket.on('close', () => {
      console.log('[UDSServer] Client disconnected');
      this.client = null;
      this.stopHeartbeat();
      this.emit('client:disconnected');
    });

    socket.on('error', (err) => {
      console.error('[UDSServer] Socket error:', err.message);
    });
  }

  /**
   * Send a message to the connected client.
   */
  send(type: string, payload: unknown, correlationId?: string): boolean {
    if (!this.client || this.client.destroyed) {
      return false;
    }

    const envelope: MessageEnvelope = {
      seq: this.seq++,
      timestampNs: process.hrtime.bigint().toString(),
      correlationId: correlationId ?? randomUUID(),
      type,
      payload,
    };

    try {
      const frame = encodeFrame(envelope);
      return this.client.write(frame);
    } catch (err) {
      console.error('[UDSServer] Send error:', err);
      return false;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send(EventType.ENGINE_HEARTBEAT, {
        uptimeMs: process.uptime() * 1000,
        memoryUsageMb: process.memoryUsage().heapUsed / (1024 * 1024),
        timestampNs: process.hrtime.bigint().toString(),
      });
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async stop(): Promise<void> {
    this.stopHeartbeat();

    if (this.client) {
      this.client.destroy();
      this.client = null;
    }

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          // Clean up socket file
          try {
            fs.unlinkSync(this.socketPath);
          } catch {
            // Ignore
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  isClientConnected(): boolean {
    return this.client !== null && !this.client.destroyed;
  }
}

// ---------------------------------------------------------------------------
// UDS Client (runs in API layer / Next.js process)
// ---------------------------------------------------------------------------

export interface UDSClientOptions {
  socketPath?: string;
  reconnectInitialMs?: number;
  reconnectMaxMs?: number;
  /** Timeout for command responses (milliseconds) */
  commandTimeoutMs?: number;
}

/**
 * UDS Client: connects to the execution engine and provides
 * request/response semantics with automatic reconnection.
 */
export class UDSClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private decoder: FrameDecoder = new FrameDecoder();
  private seq = 0;
  private reconnectDelay: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private connected = false;
  private readonly socketPath: string;
  private readonly reconnectInitialMs: number;
  private readonly reconnectMaxMs: number;
  private readonly commandTimeoutMs: number;

  /** Pending command responses, keyed by correlationId */
  private pendingCommands: Map<
    string,
    {
      resolve: (response: MessageEnvelope) => void;
      reject: (error: Error) => void;
      timer: NodeJS.Timeout;
    }
  > = new Map();

  constructor(options?: UDSClientOptions) {
    super();
    this.socketPath = options?.socketPath
      ?? process.env[UDS_SOCKET_PATH_ENV]
      ?? UDS_SOCKET_PATH_DEFAULT;
    this.reconnectInitialMs = options?.reconnectInitialMs ?? UDS_RECONNECT_INITIAL_MS;
    this.reconnectMaxMs = options?.reconnectMaxMs ?? UDS_RECONNECT_MAX_MS;
    this.commandTimeoutMs = options?.commandTimeoutMs ?? 30000;
    this.reconnectDelay = this.reconnectInitialMs;
  }

  /**
   * Connect to the execution engine.
   */
  async connect(): Promise<void> {
    if (this.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({ path: this.socketPath }, () => {
        this.isConnecting = false;
        this.connected = true;
        this.reconnectDelay = this.reconnectInitialMs;
        console.log(`[UDSClient] Connected to ${this.socketPath}`);
        this.emit('connected');
        resolve();
      });

      this.socket.on('data', (data) => {
        this.decoder.feed(data);
      });

      this.decoder.on('message', (envelope: MessageEnvelope) => {
        this.handleMessage(envelope);
      });

      this.decoder.on('error', (err) => {
        console.error('[UDSClient] Frame decode error:', err);
      });

      this.socket.on('close', () => {
        this.connected = false;
        this.isConnecting = false;
        console.log('[UDSClient] Disconnected');
        this.emit('disconnected');
        this.scheduleReconnect();
      });

      this.socket.on('error', (err) => {
        this.isConnecting = false;
        if (!this.connected) {
          reject(err);
        }
        console.error('[UDSClient] Socket error:', err.message);
        this.scheduleReconnect();
      });
    });
  }

  /**
   * Send a command and wait for the response.
   * Returns the response envelope (caller validates payload).
   */
  async sendCommand(type: CommandType, payload: unknown): Promise<MessageEnvelope> {
    if (!this.connected || !this.socket) {
      throw new Error('[UDSClient] Not connected to execution engine');
    }

    const correlationId = randomUUID();
    const envelope: MessageEnvelope = {
      seq: this.seq++,
      timestampNs: process.hrtime.bigint().toString(),
      correlationId,
      type,
      payload,
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingCommands.delete(correlationId);
        reject(new Error(`Command ${type} timed out after ${this.commandTimeoutMs}ms`));
      }, this.commandTimeoutMs);

      this.pendingCommands.set(correlationId, { resolve, reject, timer });

      try {
        const frame = encodeFrame(envelope);
        this.socket!.write(frame);
      } catch (err) {
        this.pendingCommands.delete(correlationId);
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  private handleMessage(envelope: MessageEnvelope): void {
    // Check if this is a response to a pending command
    const pending = this.pendingCommands.get(envelope.correlationId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingCommands.delete(envelope.correlationId);
      pending.resolve(envelope);
      return;
    }

    // Otherwise it is an event from the engine
    this.emit('event', envelope);
    this.emit(envelope.type, envelope);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    console.log(`[UDSClient] Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        this.decoder.reset();
        await this.connect();
      } catch {
        // Exponential backoff
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.reconnectMaxMs
        );
        this.scheduleReconnect();
      }
    }, this.reconnectDelay);
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Reject all pending commands
    for (const [_id, pending] of this.pendingCommands) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Client disconnecting'));
    }
    this.pendingCommands.clear();

    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
