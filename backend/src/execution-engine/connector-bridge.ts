/**
 * C++/TypeScript Connector Bridge
 *
 * Implements the migration bridge that allows TypeScript and C++ connectors
 * to coexist during the incremental transition. Supports three operational
 * modes per exchange:
 *
 *   1. 'typescript' -- all operations handled by TypeScript connector
 *   2. 'native'     -- all operations handled by C++ connector
 *   3. 'shadow'     -- TypeScript is primary, C++ runs in parallel for comparison
 *
 * Shadow mode sends every command to both implementations, uses the TypeScript
 * result for actual trading, and logs any divergence between the two results.
 * This allows validating C++ correctness with real market conditions before
 * switching over.
 */

import { ConnectorMode } from './ipc-protocol';
import {
  ITypedExchangeConnector,
  TypedResponse,
  OrderResult,
  Balance,
  PositionInfo,
  OrderStatus,
  ClosePositionResult,
  TradingStopResult,
  SymbolLimits,
  OrderSide,
  TimingMetadata,
} from './typed-connector-interface';

// ---------------------------------------------------------------------------
// Extended connector mode for the bridge
// ---------------------------------------------------------------------------

export type BridgeMode = ConnectorMode | 'shadow';

// ---------------------------------------------------------------------------
// Shadow comparison result
// ---------------------------------------------------------------------------

export interface ShadowComparisonResult {
  exchange: string;
  operation: string;
  symbol?: string;
  typescriptLatencyUs: number;
  nativeLatencyUs: number;
  divergence: ShadowDivergence | null;
  timestamp: Date;
}

export interface ShadowDivergence {
  field: string;
  typescriptValue: unknown;
  nativeValue: unknown;
  /** Relative difference for numeric fields (absolute value) */
  relativeDifference?: number;
}

// ---------------------------------------------------------------------------
// Shadow comparison callback
// ---------------------------------------------------------------------------

export type ShadowComparisonCallback = (result: ShadowComparisonResult) => void;

// ---------------------------------------------------------------------------
// Connector Bridge
// ---------------------------------------------------------------------------

/**
 * Wraps a pair of TypeScript and C++ connectors for the same exchange,
 * routing operations based on the configured mode.
 *
 * In shadow mode, every mutating operation (orders, closes) uses the
 * TypeScript connector as the authoritative source and runs the C++
 * connector in parallel for observation only.
 *
 * Read operations (balance, position, market price) can safely run
 * on both and be compared.
 */
export class ConnectorBridge implements ITypedExchangeConnector {
  readonly exchangeName: string;
  readonly connectorMode: ConnectorMode;

  private mode: BridgeMode;
  private readonly tsConnector: ITypedExchangeConnector;
  private nativeConnector: ITypedExchangeConnector | null;
  private shadowCallback: ShadowComparisonCallback | null = null;

  constructor(params: {
    tsConnector: ITypedExchangeConnector;
    nativeConnector: ITypedExchangeConnector | null;
    mode: BridgeMode;
    shadowCallback?: ShadowComparisonCallback;
  }) {
    this.tsConnector = params.tsConnector;
    this.nativeConnector = params.nativeConnector;
    this.mode = params.mode;
    this.shadowCallback = params.shadowCallback ?? null;
    this.exchangeName = params.tsConnector.exchangeName;
    // For ITypedExchangeConnector interface: report the primary mode
    this.connectorMode = params.mode === 'shadow' ? 'typescript' : params.mode;

    // Validate that native connector is available when required
    if (params.mode === 'native' && !params.nativeConnector) {
      throw new Error(
        `Native connector required for exchange ${this.exchangeName} but not provided`
      );
    }
  }

  /**
   * Get the currently active connector based on mode.
   */
  private primary(): ITypedExchangeConnector {
    if (this.mode === 'native' && this.nativeConnector) {
      return this.nativeConnector;
    }
    return this.tsConnector;
  }

  /**
   * Switch the bridge mode at runtime.
   * Transitions: typescript -> shadow -> native (and back)
   */
  setMode(mode: BridgeMode): void {
    if (mode === 'native' && !this.nativeConnector) {
      throw new Error(
        `Cannot switch to native mode: no native connector for ${this.exchangeName}`
      );
    }
    console.log(
      `[ConnectorBridge] ${this.exchangeName}: mode ${this.mode} -> ${mode}`
    );
    this.mode = mode;
  }

  getMode(): BridgeMode {
    return this.mode;
  }

  /**
   * Register or replace the native connector (used during hot-swap).
   */
  setNativeConnector(connector: ITypedExchangeConnector): void {
    this.nativeConnector = connector;
    console.log(
      `[ConnectorBridge] ${this.exchangeName}: native connector registered`
    );
  }

  /**
   * Set the callback for shadow mode comparison results.
   */
  setShadowCallback(callback: ShadowComparisonCallback): void {
    this.shadowCallback = callback;
  }

  // ---------------------------------------------------------------------------
  // ITypedExchangeConnector implementation
  // ---------------------------------------------------------------------------

  async initialize(): Promise<void> {
    await this.tsConnector.initialize();
    if (this.nativeConnector) {
      await this.nativeConnector.initialize();
    }
  }

  isConnected(): boolean {
    return this.primary().isConnected();
  }

  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<TypedResponse<OrderResult>> {
    // Mutating operation: in shadow mode, only TypeScript executes.
    // Native observes timing but does NOT submit real orders.
    const result = await this.primary().placeMarketOrder(symbol, side, quantity);

    if (this.mode === 'shadow' && this.nativeConnector) {
      // In shadow mode for mutating ops, we only compare timing,
      // not results (native does not actually submit orders).
      this.logShadowTiming('placeMarketOrder', symbol, result.timing);
    }

    return result;
  }

  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<TypedResponse<OrderResult>> {
    const result = await this.primary().placeLimitOrder(symbol, side, quantity, price);

    if (this.mode === 'shadow' && this.nativeConnector) {
      this.logShadowTiming('placeLimitOrder', symbol, result.timing);
    }

    return result;
  }

  async cancelOrder(
    orderId: string,
    symbol: string
  ): Promise<TypedResponse<OrderResult>> {
    return this.primary().cancelOrder(orderId, symbol);
  }

  async getBalance(): Promise<TypedResponse<Balance>> {
    // Read-only: safe to compare in shadow mode
    return this.withShadowCompare(
      'getBalance',
      undefined,
      () => this.tsConnector.getBalance(),
      () => this.nativeConnector!.getBalance(),
      (ts, native) => this.compareBalances(ts.data, native.data)
    );
  }

  async getPosition(symbol: string): Promise<TypedResponse<PositionInfo>> {
    return this.withShadowCompare(
      'getPosition',
      symbol,
      () => this.tsConnector.getPosition(symbol),
      () => this.nativeConnector!.getPosition(symbol),
      (ts, native) => this.comparePositions(ts.data, native.data)
    );
  }

  async getOrderStatus(orderId: string): Promise<TypedResponse<OrderStatus>> {
    return this.primary().getOrderStatus(orderId);
  }

  async closePosition(symbol: string): Promise<TypedResponse<ClosePositionResult>> {
    // Mutating: only primary executes
    return this.primary().closePosition(symbol);
  }

  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<TypedResponse<OrderResult>> {
    return this.primary().placeReduceOnlyOrder(symbol, side, quantity);
  }

  async setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<TypedResponse<TradingStopResult>> {
    return this.primary().setTradingStop(params);
  }

  async getSymbolLimits(symbol: string): Promise<TypedResponse<SymbolLimits>> {
    return this.primary().getSymbolLimits(symbol);
  }

  async getMarketPrice(symbol: string): Promise<TypedResponse<number>> {
    return this.withShadowCompare(
      'getMarketPrice',
      symbol,
      () => this.tsConnector.getMarketPrice(symbol),
      () => this.nativeConnector!.getMarketPrice(symbol),
      (ts, native) => {
        const diff = Math.abs(ts.data - native.data);
        const relDiff = ts.data > 0 ? diff / ts.data : 0;
        if (relDiff > 0.001) { // > 0.1% divergence
          return {
            field: 'price',
            typescriptValue: ts.data,
            nativeValue: native.data,
            relativeDifference: relDiff,
          };
        }
        return null;
      }
    );
  }

  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    return this.primary().subscribeToPriceStream(symbol, callback);
  }

  // ---------------------------------------------------------------------------
  // Shadow mode helpers
  // ---------------------------------------------------------------------------

  /**
   * Run an operation on both connectors in shadow mode and compare results.
   * Always returns the TypeScript result as authoritative.
   */
  private async withShadowCompare<T>(
    operation: string,
    symbol: string | undefined,
    tsFn: () => Promise<TypedResponse<T>>,
    nativeFn: () => Promise<TypedResponse<T>>,
    compare: (ts: TypedResponse<T>, native: TypedResponse<T>) => ShadowDivergence | null
  ): Promise<TypedResponse<T>> {
    if (this.mode !== 'shadow' || !this.nativeConnector) {
      return this.primary() === this.tsConnector ? tsFn() : nativeFn();
    }

    // Run both in parallel
    const [tsResult, nativeResult] = await Promise.allSettled([
      tsFn(),
      nativeFn(),
    ]);

    // TypeScript result is authoritative
    if (tsResult.status === 'rejected') {
      throw tsResult.reason;
    }

    const tsValue = tsResult.value;

    // Compare if native succeeded
    if (nativeResult.status === 'fulfilled') {
      const divergence = compare(tsValue, nativeResult.value);
      const compResult: ShadowComparisonResult = {
        exchange: this.exchangeName,
        operation,
        symbol,
        typescriptLatencyUs: tsValue.timing.roundTripUs,
        nativeLatencyUs: nativeResult.value.timing.roundTripUs,
        divergence,
        timestamp: new Date(),
      };

      if (this.shadowCallback) {
        this.shadowCallback(compResult);
      }

      if (divergence) {
        console.warn(
          `[ConnectorBridge] Shadow divergence on ${this.exchangeName}.${operation}: ` +
          `field=${divergence.field} ts=${divergence.typescriptValue} ` +
          `native=${divergence.nativeValue}`
        );
      }
    } else {
      console.warn(
        `[ConnectorBridge] Shadow native connector failed for ` +
        `${this.exchangeName}.${operation}: ${nativeResult.reason}`
      );
    }

    return tsValue;
  }

  private logShadowTiming(
    operation: string,
    symbol: string,
    timing: TimingMetadata
  ): void {
    if (this.shadowCallback) {
      this.shadowCallback({
        exchange: this.exchangeName,
        operation,
        symbol,
        typescriptLatencyUs: timing.roundTripUs,
        nativeLatencyUs: 0, // Native did not execute for mutating ops
        divergence: null,
        timestamp: new Date(),
      });
    }
  }

  private compareBalances(ts: Balance, native: Balance): ShadowDivergence | null {
    const relDiff = ts.totalEquity > 0
      ? Math.abs(ts.totalEquity - native.totalEquity) / ts.totalEquity
      : 0;
    if (relDiff > 0.001) {
      return {
        field: 'totalEquity',
        typescriptValue: ts.totalEquity,
        nativeValue: native.totalEquity,
        relativeDifference: relDiff,
      };
    }
    return null;
  }

  private comparePositions(ts: PositionInfo, native: PositionInfo): ShadowDivergence | null {
    if (ts.side !== native.side) {
      return {
        field: 'side',
        typescriptValue: ts.side,
        nativeValue: native.side,
      };
    }
    const sizeDiff = ts.size > 0
      ? Math.abs(ts.size - native.size) / ts.size
      : 0;
    if (sizeDiff > 0.001) {
      return {
        field: 'size',
        typescriptValue: ts.size,
        nativeValue: native.size,
        relativeDifference: sizeDiff,
      };
    }
    return null;
  }
}
