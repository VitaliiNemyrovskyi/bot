/**
 * Execution Engine API Client
 *
 * Singleton client used by Next.js API routes to communicate with
 * the execution engine process. Provides typed, promise-based
 * wrappers around UDS commands.
 *
 * Usage in API routes:
 *   import { engineClient } from '@/execution-engine/api-client';
 *   const status = await engineClient.getEngineStatus();
 *
 * The client automatically connects on first use and reconnects
 * if the engine restarts.
 */

import { UDSClient } from './uds-transport';
import {
  CommandType,
  EventType,
  ResponseStatus,
  MessageEnvelope,
  OpenPositionCommand,
  OpenPositionCommandSchema,
  ClosePositionCommand,
  ClosePositionCommandSchema,
  CreateSubscriptionCommand,
  CreateSubscriptionCommandSchema,
  EngineHeartbeat,
  EngineHeartbeatSchema,
} from './ipc-protocol';

// ---------------------------------------------------------------------------
// Engine status type
// ---------------------------------------------------------------------------

export interface EngineStatus {
  connected: boolean;
  state: string;
  uptimeMs: number;
  activePositions: number;
  memoryUsageMb: number;
  rssMemoryMb: number;
}

// ---------------------------------------------------------------------------
// API Client class
// ---------------------------------------------------------------------------

class ExecutionEngineClient {
  private client: UDSClient;
  private connecting: Promise<void> | null = null;
  private lastHeartbeat: EngineHeartbeat | null = null;

  constructor() {
    this.client = new UDSClient();

    // Track heartbeats
    this.client.on(EventType.ENGINE_HEARTBEAT, (envelope: MessageEnvelope) => {
      try {
        this.lastHeartbeat = EngineHeartbeatSchema.parse(envelope.payload);
      } catch {
        // Ignore malformed heartbeats
      }
    });

    // Log events
    this.client.on('connected', () => {
      console.log('[EngineClient] Connected to execution engine');
    });
    this.client.on('disconnected', () => {
      console.log('[EngineClient] Disconnected from execution engine');
      this.connecting = null;
    });
  }

  /**
   * Ensure connection to the engine.
   * Safe to call multiple times (idempotent).
   */
  private async ensureConnected(): Promise<void> {
    if (this.client.isConnected()) {
      return;
    }

    if (!this.connecting) {
      this.connecting = this.client.connect().catch((err) => {
        this.connecting = null;
        throw err;
      });
    }

    await this.connecting;
  }

  /**
   * Send a command to the engine and extract the response.
   * Throws if the engine returns an error.
   */
  private async sendCommand<T>(type: CommandType, payload: unknown): Promise<T> {
    await this.ensureConnected();

    const response = await this.client.sendCommand(type, payload);
    const body = response.payload as {
      status: string;
      data?: T;
      error?: { code: string; message: string; retryable: boolean };
    };

    if (body.status !== ResponseStatus.OK) {
      const err = body.error;
      throw new Error(
        `Engine command ${type} failed: [${err?.code}] ${err?.message}` +
        (err?.retryable ? ' (retryable)' : '')
      );
    }

    return body.data as T;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Get execution engine status.
   */
  async getEngineStatus(): Promise<EngineStatus> {
    try {
      const data = await this.sendCommand<{
        state: string;
        uptimeMs: number;
        activePositions: number;
        memoryUsageMb: number;
        rssMemoryMb: number;
      }>(CommandType.GET_ENGINE_STATUS, {});

      return {
        connected: true,
        ...data,
      };
    } catch {
      return {
        connected: false,
        state: 'DISCONNECTED',
        uptimeMs: 0,
        activePositions: 0,
        memoryUsageMb: 0,
        rssMemoryMb: 0,
      };
    }
  }

  /**
   * Open a new arbitrage position.
   * The engine handles WAL logging, exchange calls, and state management.
   */
  async openPosition(params: OpenPositionCommand): Promise<{ positionId: string }> {
    const validated = OpenPositionCommandSchema.parse(params);
    return this.sendCommand(CommandType.OPEN_POSITION, validated);
  }

  /**
   * Close an existing position.
   */
  async closePosition(params: ClosePositionCommand): Promise<{ success: boolean }> {
    const validated = ClosePositionCommandSchema.parse(params);
    return this.sendCommand(CommandType.CLOSE_POSITION, validated);
  }

  /**
   * Create a funding arbitrage subscription.
   */
  async createSubscription(params: CreateSubscriptionCommand): Promise<{ subscriptionId: string }> {
    const validated = CreateSubscriptionCommandSchema.parse(params);
    return this.sendCommand(CommandType.CREATE_SUBSCRIPTION, validated);
  }

  /**
   * Cancel a funding arbitrage subscription.
   */
  async cancelSubscription(subscriptionId: string, userId: string): Promise<{ success: boolean }> {
    return this.sendCommand(CommandType.CANCEL_SUBSCRIPTION, { subscriptionId, userId });
  }

  /**
   * Get position state from the engine (authoritative source).
   */
  async getPositionState(positionId: string): Promise<{
    positionId: string;
    state: string;
    hasCapitalAtRisk: boolean;
  }> {
    return this.sendCommand(CommandType.GET_POSITION_STATE, { positionId });
  }

  /**
   * Request engine shutdown.
   */
  async shutdownEngine(): Promise<void> {
    await this.sendCommand(CommandType.SHUTDOWN_ENGINE, {});
  }

  /**
   * Get last received heartbeat (from background monitoring).
   * Returns null if no heartbeat has been received yet.
   */
  getLastHeartbeat(): EngineHeartbeat | null {
    return this.lastHeartbeat;
  }

  /**
   * Check if the client is connected to the engine.
   */
  isConnected(): boolean {
    return this.client.isConnected();
  }

  /**
   * Subscribe to engine events.
   * Returns an unsubscribe function.
   */
  onEvent(eventType: string, handler: (envelope: MessageEnvelope) => void): () => void {
    this.client.on(eventType, handler);
    return () => {
      this.client.off(eventType, handler);
    };
  }

  /**
   * Disconnect from the engine.
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.connecting = null;
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

/**
 * Singleton engine client for use in API routes.
 *
 * Import and use:
 *   import { engineClient } from '@/execution-engine/api-client';
 */
export const engineClient = new ExecutionEngineClient();
