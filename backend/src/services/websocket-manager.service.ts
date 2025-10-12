/**
 * WebSocket Manager Service
 *
 * Centralized WebSocket connection management for exchange price streams
 * - One connection per exchange-symbol pair (shared across multiple subscribers)
 * - Automatic reconnection with exponential backoff
 * - Health monitoring and connection state tracking
 * - Memory-efficient cleanup on unsubscribe
 */

import WebSocket from 'ws';
import EventEmitter from 'events';

interface ConnectionConfig {
  url: string;
  subscribeMessage?: any;
  heartbeatInterval?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
}

interface ConnectionState {
  ws: WebSocket | null;
  emitter: EventEmitter;
  subscribers: Set<Function>;
  reconnectAttempts: number;
  lastUpdate: number;
  reconnectTimeout?: NodeJS.Timeout;
  heartbeatInterval?: NodeJS.Timeout;
  isClosing: boolean;
}

export class WebSocketManagerService {
  private connections: Map<string, ConnectionState> = new Map();
  private readonly DEFAULT_RECONNECT_DELAY = 1000; // 1 second
  private readonly MAX_RECONNECT_DELAY = 30000; // 30 seconds
  private readonly HEARTBEAT_INTERVAL = 20000; // 20 seconds
  private readonly CONNECTION_TIMEOUT = 10000; // 10 seconds

  /**
   * Subscribe to price updates for a specific exchange and symbol
   * @param exchange - Exchange name (e.g., 'bybit', 'bingx', 'mexc')
   * @param symbol - Trading pair symbol
   * @param config - WebSocket connection configuration
   * @param callback - Callback function for price updates
   * @returns Unsubscribe function
   */
  async subscribe(
    exchange: string,
    symbol: string,
    config: ConnectionConfig,
    callback: (data: any) => void
  ): Promise<() => void> {
    const connectionKey = `${exchange}:${symbol}`;
    console.log(`[WebSocketManager] Subscribing to ${connectionKey}`);

    // Get or create connection state
    let state = this.connections.get(connectionKey);

    if (!state) {
      console.log(`[WebSocketManager] Creating new connection for ${connectionKey}`);
      state = {
        ws: null,
        emitter: new EventEmitter(),
        subscribers: new Set(),
        reconnectAttempts: 0,
        lastUpdate: Date.now(),
        isClosing: false,
      };
      this.connections.set(connectionKey, state);

      // Establish WebSocket connection
      await this.connect(connectionKey, config);
    }

    // Add subscriber
    state.subscribers.add(callback);
    state.emitter.on('update', callback);
    console.log(`[WebSocketManager] ${connectionKey} now has ${state.subscribers.size} subscriber(s)`);

    // Return unsubscribe function
    return () => {
      console.log(`[WebSocketManager] Unsubscribing from ${connectionKey}`);
      const currentState = this.connections.get(connectionKey);
      if (currentState) {
        currentState.subscribers.delete(callback);
        currentState.emitter.off('update', callback);

        console.log(`[WebSocketManager] ${connectionKey} now has ${currentState.subscribers.size} subscriber(s)`);

        // Close connection if no subscribers left
        if (currentState.subscribers.size === 0) {
          console.log(`[WebSocketManager] No subscribers left for ${connectionKey}, closing connection`);
          this.closeConnection(connectionKey);
        }
      }
    };
  }

  /**
   * Establish WebSocket connection
   */
  private async connect(connectionKey: string, config: ConnectionConfig): Promise<void> {
    const state = this.connections.get(connectionKey);
    if (!state || state.isClosing) {
      return;
    }

    console.log(`[WebSocketManager] Connecting to ${connectionKey}...`);

    try {
      const ws = new WebSocket(config.url, {
        handshakeTimeout: this.CONNECTION_TIMEOUT,
      });

      state.ws = ws;

      // Connection opened
      ws.on('open', () => {
        console.log(`[WebSocketManager] Connected to ${connectionKey}`);
        state.reconnectAttempts = 0;

        // Send subscribe message if provided
        if (config.subscribeMessage) {
          ws.send(JSON.stringify(config.subscribeMessage));
          console.log(`[WebSocketManager] Sent subscribe message for ${connectionKey}`);
        }

        // Start heartbeat
        this.startHeartbeat(connectionKey, config.heartbeatInterval || this.HEARTBEAT_INTERVAL);
      });

      // Message received
      ws.on('message', (data: Buffer | string) => {
        try {
          const message = typeof data === 'string' ? data : data.toString();
          const parsed = JSON.parse(message);

          // Update last update timestamp
          state.lastUpdate = Date.now();

          // Emit to all subscribers
          state.emitter.emit('update', parsed);
        } catch (error: any) {
          console.error(`[WebSocketManager] Error parsing message for ${connectionKey}:`, error.message);
        }
      });

      // Connection error
      ws.on('error', (error: Error) => {
        console.error(`[WebSocketManager] WebSocket error for ${connectionKey}:`, error.message);
      });

      // Connection closed
      ws.on('close', (code: number, reason: Buffer) => {
        const reasonStr = reason.toString();
        console.log(`[WebSocketManager] Connection closed for ${connectionKey}:`, { code, reason: reasonStr });

        // Clear heartbeat
        if (state.heartbeatInterval) {
          clearInterval(state.heartbeatInterval);
          state.heartbeatInterval = undefined;
        }

        // Attempt reconnection if not intentionally closed and still has subscribers
        if (!state.isClosing && state.subscribers.size > 0) {
          this.scheduleReconnect(connectionKey, config);
        }
      });

      // Wait for connection to open (with timeout)
      await this.waitForConnection(ws, this.CONNECTION_TIMEOUT);
    } catch (error: any) {
      console.error(`[WebSocketManager] Failed to connect to ${connectionKey}:`, error.message);

      // Schedule reconnect if still has subscribers
      if (state.subscribers.size > 0 && !state.isClosing) {
        this.scheduleReconnect(connectionKey, config);
      }
    }
  }

  /**
   * Wait for WebSocket connection to open
   */
  private waitForConnection(ws: WebSocket, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      ws.once('open', () => {
        clearTimeout(timer);
        resolve();
      });

      ws.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  /**
   * Start heartbeat/ping-pong to keep connection alive
   */
  private startHeartbeat(connectionKey: string, interval: number): void {
    const state = this.connections.get(connectionKey);
    if (!state || !state.ws) {
      return;
    }

    // Clear existing heartbeat
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval);
    }

    state.heartbeatInterval = setInterval(() => {
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        state.ws.ping();
      }
    }, interval);
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(connectionKey: string, config: ConnectionConfig): void {
    const state = this.connections.get(connectionKey);
    if (!state || state.isClosing) {
      return;
    }

    // Calculate delay with exponential backoff
    const baseDelay = config.reconnectDelay || this.DEFAULT_RECONNECT_DELAY;
    const maxDelay = config.maxReconnectDelay || this.MAX_RECONNECT_DELAY;
    const delay = Math.min(baseDelay * Math.pow(2, state.reconnectAttempts), maxDelay);

    console.log(`[WebSocketManager] Scheduling reconnect for ${connectionKey} in ${delay}ms (attempt ${state.reconnectAttempts + 1})`);

    // Clear existing reconnect timeout
    if (state.reconnectTimeout) {
      clearTimeout(state.reconnectTimeout);
    }

    state.reconnectTimeout = setTimeout(() => {
      state.reconnectAttempts++;
      this.connect(connectionKey, config);
    }, delay);
  }

  /**
   * Close connection and cleanup
   */
  private closeConnection(connectionKey: string): void {
    const state = this.connections.get(connectionKey);
    if (!state) {
      return;
    }

    console.log(`[WebSocketManager] Closing connection for ${connectionKey}`);
    state.isClosing = true;

    // Clear timeouts
    if (state.reconnectTimeout) {
      clearTimeout(state.reconnectTimeout);
      state.reconnectTimeout = undefined;
    }

    // Clear heartbeat
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval);
      state.heartbeatInterval = undefined;
    }

    // Close WebSocket
    if (state.ws) {
      state.ws.removeAllListeners();
      if (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING) {
        state.ws.close();
      }
      state.ws = null;
    }

    // Remove all subscribers
    state.emitter.removeAllListeners();
    state.subscribers.clear();

    // Remove from connections map
    this.connections.delete(connectionKey);
    console.log(`[WebSocketManager] Connection ${connectionKey} closed and cleaned up`);
  }

  /**
   * Check if connection is active
   */
  isConnected(exchange: string, symbol: string): boolean {
    const connectionKey = `${exchange}:${symbol}`;
    const state = this.connections.get(connectionKey);
    return !!(state && state.ws && state.ws.readyState === WebSocket.OPEN);
  }

  /**
   * Get timestamp of last update
   */
  getLastUpdate(exchange: string, symbol: string): number {
    const connectionKey = `${exchange}:${symbol}`;
    const state = this.connections.get(connectionKey);
    return state ? state.lastUpdate : 0;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    connections: Array<{
      key: string;
      connected: boolean;
      subscribers: number;
      lastUpdate: number;
      reconnectAttempts: number;
    }>;
  } {
    const stats = {
      totalConnections: this.connections.size,
      activeConnections: 0,
      connections: [] as Array<{
        key: string;
        connected: boolean;
        subscribers: number;
        lastUpdate: number;
        reconnectAttempts: number;
      }>,
    };

    for (const [key, state] of this.connections.entries()) {
      const connected = !!(state.ws && state.ws.readyState === WebSocket.OPEN);
      if (connected) {
        stats.activeConnections++;
      }

      stats.connections.push({
        key,
        connected,
        subscribers: state.subscribers.size,
        lastUpdate: state.lastUpdate,
        reconnectAttempts: state.reconnectAttempts,
      });
    }

    return stats;
  }

  /**
   * Close all connections and cleanup
   */
  closeAll(): void {
    console.log(`[WebSocketManager] Closing all connections (${this.connections.size} total)`);
    for (const key of Array.from(this.connections.keys())) {
      this.closeConnection(key);
    }
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManagerService();
