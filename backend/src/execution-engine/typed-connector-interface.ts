/**
 * Typed Exchange Connector Interface
 *
 * Replaces all `any` return types in BaseExchangeConnector with
 * strictly typed, Zod-validated interfaces. Adds timing metadata
 * to every response and a ConnectorMode discriminator for dual
 * TypeScript/C++ implementation routing.
 *
 * Migration strategy:
 * - TypedExchangeConnector extends BaseExchangeConnector for backwards compat
 * - New methods with `Typed` suffix return validated types
 * - Adapter wraps existing connectors to add validation + timing
 * - ConnectorFactory routes to TypeScript or native implementation
 */

import { z } from 'zod';
import { ConnectorMode } from './ipc-protocol';

// ---------------------------------------------------------------------------
// Timing metadata: attached to every exchange response
// ---------------------------------------------------------------------------

export const TimingMetadataSchema = z.object({
  /** When the request was sent (process.hrtime.bigint(), nanoseconds as string) */
  requestSentNs: z.string(),
  /** When the response was received (process.hrtime.bigint(), nanoseconds as string) */
  responseReceivedNs: z.string(),
  /** Round-trip latency in microseconds */
  roundTripUs: z.number().nonnegative(),
  /** Exchange-reported timestamp (if available, milliseconds epoch) */
  exchangeTimestamp: z.number().optional(),
  /** Connector mode that handled this request */
  connectorMode: z.enum(['typescript', 'native']),
});

export type TimingMetadata = z.infer<typeof TimingMetadataSchema>;

// ---------------------------------------------------------------------------
// Typed response wrapper
// ---------------------------------------------------------------------------

export const TypedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    timing: TimingMetadataSchema,
  });

export type TypedResponse<T> = {
  data: T;
  timing: TimingMetadata;
};

// ---------------------------------------------------------------------------
// Order types
// ---------------------------------------------------------------------------

export type OrderSide = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';

// ---------------------------------------------------------------------------
// Strictly typed return types (replacing `any`)
// ---------------------------------------------------------------------------

export const OrderResultSchema = z.object({
  orderId: z.string(),
  symbol: z.string(),
  side: z.enum(['Buy', 'Sell']),
  type: z.enum(['Market', 'Limit']),
  quantity: z.number(),
  price: z.number().optional(),
  avgFillPrice: z.number().optional(),
  filledQuantity: z.number(),
  status: z.enum(['New', 'PartiallyFilled', 'Filled', 'Cancelled', 'Rejected']),
  fees: z.number(),
  feeCurrency: z.string().optional(),
  exchangeTimestamp: z.number().optional(),
});

export type OrderResult = z.infer<typeof OrderResultSchema>;

export const BalanceSchema = z.object({
  totalEquity: z.number(),
  availableBalance: z.number(),
  usedMargin: z.number(),
  unrealizedPnl: z.number(),
  /** Per-asset breakdown */
  assets: z.array(
    z.object({
      asset: z.string(),
      free: z.number(),
      locked: z.number(),
      total: z.number(),
    })
  ),
});

export type Balance = z.infer<typeof BalanceSchema>;

export const PositionInfoSchema = z.object({
  symbol: z.string(),
  side: z.enum(['Buy', 'Sell', 'None']),
  size: z.number(),
  entryPrice: z.number(),
  markPrice: z.number(),
  liquidationPrice: z.number().optional(),
  unrealizedPnl: z.number(),
  leverage: z.number(),
  marginType: z.enum(['cross', 'isolated']).optional(),
  positionValue: z.number(),
});

export type PositionInfo = z.infer<typeof PositionInfoSchema>;

export const OrderStatusSchema = z.object({
  orderId: z.string(),
  symbol: z.string(),
  side: z.enum(['Buy', 'Sell']),
  type: z.enum(['Market', 'Limit']),
  quantity: z.number(),
  filledQuantity: z.number(),
  avgFillPrice: z.number().optional(),
  status: z.enum(['New', 'PartiallyFilled', 'Filled', 'Cancelled', 'Rejected']),
  fees: z.number(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const ClosePositionResultSchema = z.object({
  orderId: z.string().optional(),
  symbol: z.string(),
  closedQuantity: z.number(),
  avgClosePrice: z.number(),
  realizedPnl: z.number(),
  fees: z.number(),
});

export type ClosePositionResult = z.infer<typeof ClosePositionResultSchema>;

export const TradingStopResultSchema = z.object({
  success: z.boolean(),
  takeProfitOrderId: z.string().optional(),
  stopLossOrderId: z.string().optional(),
  message: z.string().optional(),
});

export type TradingStopResult = z.infer<typeof TradingStopResultSchema>;

export const SymbolLimitsSchema = z.object({
  minOrderSize: z.number().optional(),
  minNotional: z.number().optional(),
  maxOrderSize: z.number().optional(),
  amountPrecision: z.number().optional(),
  pricePrecision: z.number().optional(),
}).nullable();

export type SymbolLimits = z.infer<typeof SymbolLimitsSchema>;

// ---------------------------------------------------------------------------
// Typed exchange connector interface
// ---------------------------------------------------------------------------

/**
 * Strictly-typed exchange connector interface.
 *
 * Every method returns TypedResponse<T> which includes:
 * - Validated data (Zod schema)
 * - Timing metadata (request/response timestamps)
 * - Connector mode discriminator
 *
 * Implementations:
 * - TypeScript: wraps existing connectors with validation + timing
 * - Native (C++): communicates via shared memory / FFI
 */
export interface ITypedExchangeConnector {
  readonly exchangeName: string;
  readonly connectorMode: ConnectorMode;

  initialize(): Promise<void>;
  isConnected(): boolean;

  placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<TypedResponse<OrderResult>>;

  placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<TypedResponse<OrderResult>>;

  cancelOrder(
    orderId: string,
    symbol: string
  ): Promise<TypedResponse<OrderResult>>;

  getBalance(): Promise<TypedResponse<Balance>>;

  getPosition(symbol: string): Promise<TypedResponse<PositionInfo>>;

  getOrderStatus(orderId: string): Promise<TypedResponse<OrderStatus>>;

  closePosition(symbol: string): Promise<TypedResponse<ClosePositionResult>>;

  placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<TypedResponse<OrderResult>>;

  setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<TypedResponse<TradingStopResult>>;

  getSymbolLimits(symbol: string): Promise<TypedResponse<SymbolLimits>>;

  getMarketPrice(symbol: string): Promise<TypedResponse<number>>;

  subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void>;
}

// ---------------------------------------------------------------------------
// Adapter: wraps existing BaseExchangeConnector with typed validation
// ---------------------------------------------------------------------------

import { BaseExchangeConnector } from '../connectors/base-exchange.connector';

/**
 * Wraps an existing BaseExchangeConnector and adds:
 * - Zod validation on all return values
 * - Timing metadata (nanosecond precision)
 * - ConnectorMode tagging
 *
 * This allows incremental migration: existing connectors keep working
 * while new code gets typed responses.
 */
export class TypedConnectorAdapter implements ITypedExchangeConnector {
  readonly connectorMode: ConnectorMode = 'typescript';

  constructor(private readonly inner: BaseExchangeConnector) {}

  get exchangeName(): string {
    return this.inner.exchangeName;
  }

  async initialize(): Promise<void> {
    return this.inner.initialize();
  }

  isConnected(): boolean {
    return this.inner.isConnected();
  }

  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<TypedResponse<OrderResult>> {
    return this.withTiming(async () => {
      const raw = await this.inner.placeMarketOrder(symbol, side, quantity);
      return this.normalizeOrderResult(raw, symbol, side, 'Market', quantity);
    });
  }

  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<TypedResponse<OrderResult>> {
    return this.withTiming(async () => {
      const raw = await this.inner.placeLimitOrder(symbol, side, quantity, price);
      return this.normalizeOrderResult(raw, symbol, side, 'Limit', quantity);
    });
  }

  async cancelOrder(
    orderId: string,
    symbol: string
  ): Promise<TypedResponse<OrderResult>> {
    return this.withTiming(async () => {
      const raw = await this.inner.cancelOrder(orderId, symbol);
      return this.normalizeOrderResult(raw, symbol, 'Buy', 'Market', 0);
    });
  }

  async getBalance(): Promise<TypedResponse<Balance>> {
    return this.withTiming(async () => {
      const raw = await this.inner.getBalance();
      return BalanceSchema.parse(this.normalizeBalance(raw));
    });
  }

  async getPosition(symbol: string): Promise<TypedResponse<PositionInfo>> {
    return this.withTiming(async () => {
      const raw = await this.inner.getPosition(symbol);
      return PositionInfoSchema.parse(this.normalizePosition(raw, symbol));
    });
  }

  async getOrderStatus(orderId: string): Promise<TypedResponse<OrderStatus>> {
    return this.withTiming(async () => {
      const raw = await this.inner.getOrderStatus(orderId);
      return OrderStatusSchema.parse(this.normalizeOrderStatus(raw));
    });
  }

  async closePosition(symbol: string): Promise<TypedResponse<ClosePositionResult>> {
    return this.withTiming(async () => {
      const raw = await this.inner.closePosition(symbol);
      return ClosePositionResultSchema.parse(this.normalizeCloseResult(raw, symbol));
    });
  }

  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<TypedResponse<OrderResult>> {
    return this.withTiming(async () => {
      const raw = await this.inner.placeReduceOnlyOrder(symbol, side, quantity);
      return this.normalizeOrderResult(raw, symbol, side, 'Market', quantity);
    });
  }

  async setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<TypedResponse<TradingStopResult>> {
    return this.withTiming(async () => {
      const raw = await this.inner.setTradingStop(params);
      return TradingStopResultSchema.parse(raw);
    });
  }

  async getSymbolLimits(symbol: string): Promise<TypedResponse<SymbolLimits>> {
    return this.withTiming(async () => {
      const raw = await this.inner.getSymbolLimits(symbol);
      return SymbolLimitsSchema.parse(raw);
    });
  }

  async getMarketPrice(symbol: string): Promise<TypedResponse<number>> {
    return this.withTiming(async () => {
      const price = await this.inner.getMarketPrice(symbol);
      return z.number().positive().parse(price);
    });
  }

  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    return this.inner.subscribeToPriceStream(symbol, callback);
  }

  // ---------------------------------------------------------------------------
  // Timing wrapper
  // ---------------------------------------------------------------------------

  private async withTiming<T>(fn: () => Promise<T>): Promise<TypedResponse<T>> {
    const requestSentNs = process.hrtime.bigint();
    const data = await fn();
    const responseReceivedNs = process.hrtime.bigint();
    const roundTripUs = Number(responseReceivedNs - requestSentNs) / 1000;

    return {
      data,
      timing: {
        requestSentNs: requestSentNs.toString(),
        responseReceivedNs: responseReceivedNs.toString(),
        roundTripUs,
        connectorMode: this.connectorMode,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Normalization helpers: convert untyped exchange responses to typed schemas
  // These handle the varied response formats from different exchanges
  // ---------------------------------------------------------------------------

  private normalizeOrderResult(
    raw: unknown,
    symbol: string,
    side: OrderSide,
    type: 'Market' | 'Limit',
    quantity: number
  ): OrderResult {
    const r = raw as Record<string, unknown>;
    return OrderResultSchema.parse({
      orderId: String(r['orderId'] ?? r['order_id'] ?? r['id'] ?? ''),
      symbol,
      side,
      type,
      quantity,
      price: r['price'] != null ? Number(r['price']) : undefined,
      avgFillPrice: r['avgPrice'] != null ? Number(r['avgPrice']) : (r['averagePrice'] != null ? Number(r['averagePrice']) : undefined),
      filledQuantity: Number(r['filledQty'] ?? r['filledAmount'] ?? r['cumExecQty'] ?? 0),
      status: this.normalizeOrderStatusString(String(r['status'] ?? r['orderStatus'] ?? 'New')),
      fees: Number(r['fee'] ?? r['commission'] ?? r['cumExecFee'] ?? 0),
      feeCurrency: r['feeCurrency'] != null ? String(r['feeCurrency']) : undefined,
      exchangeTimestamp: r['timestamp'] != null ? Number(r['timestamp']) : (r['createdTime'] != null ? Number(r['createdTime']) : undefined),
    });
  }

  private normalizeBalance(raw: unknown): Balance {
    const r = raw as Record<string, unknown>;
    // Handle Bybit-style nested result
    const coin = r['coin'] as Array<Record<string, unknown>> | undefined;
    const assets = (coin ?? []).map((c) => ({
      asset: String(c['coin'] ?? c['asset'] ?? ''),
      free: Number(c['availableToWithdraw'] ?? c['free'] ?? 0),
      locked: Number(c['locked'] ?? 0),
      total: Number(c['walletBalance'] ?? c['total'] ?? 0),
    }));

    return {
      totalEquity: Number(r['totalEquity'] ?? r['totalBalance'] ?? 0),
      availableBalance: Number(r['availableBalance'] ?? r['availableMargin'] ?? 0),
      usedMargin: Number(r['totalPositionIM'] ?? r['usedMargin'] ?? 0),
      unrealizedPnl: Number(r['totalUnrealisedPnl'] ?? r['unrealizedPnl'] ?? 0),
      assets,
    };
  }

  private normalizePosition(raw: unknown, symbol: string): PositionInfo {
    const r = raw as Record<string, unknown>;
    return {
      symbol,
      side: this.normalizePositionSide(String(r['side'] ?? r['posSide'] ?? 'None')),
      size: Number(r['size'] ?? r['positionAmt'] ?? 0),
      entryPrice: Number(r['avgPrice'] ?? r['entryPrice'] ?? 0),
      markPrice: Number(r['markPrice'] ?? 0),
      liquidationPrice: r['liqPrice'] != null ? Number(r['liqPrice']) : undefined,
      unrealizedPnl: Number(r['unrealisedPnl'] ?? r['unRealizedProfit'] ?? 0),
      leverage: Number(r['leverage'] ?? 1),
      marginType: r['tradeMode'] === '1' || r['marginType'] === 'isolated' ? 'isolated' as const : 'cross' as const,
      positionValue: Number(r['positionValue'] ?? r['notional'] ?? 0),
    };
  }

  private normalizeOrderStatus(raw: unknown): OrderStatus {
    const r = raw as Record<string, unknown>;
    return {
      orderId: String(r['orderId'] ?? r['order_id'] ?? ''),
      symbol: String(r['symbol'] ?? ''),
      side: r['side'] === 'Sell' ? 'Sell' : 'Buy',
      type: r['orderType'] === 'Limit' ? 'Limit' : 'Market',
      quantity: Number(r['qty'] ?? r['origQty'] ?? 0),
      filledQuantity: Number(r['cumExecQty'] ?? r['executedQty'] ?? 0),
      avgFillPrice: r['avgPrice'] != null ? Number(r['avgPrice']) : undefined,
      status: this.normalizeOrderStatusString(String(r['orderStatus'] ?? r['status'] ?? 'New')),
      fees: Number(r['cumExecFee'] ?? r['fee'] ?? 0),
      createdAt: r['createdTime'] != null ? Number(r['createdTime']) : undefined,
      updatedAt: r['updatedTime'] != null ? Number(r['updatedTime']) : undefined,
    };
  }

  private normalizeCloseResult(raw: unknown, symbol: string): ClosePositionResult {
    const r = raw as Record<string, unknown>;
    return {
      orderId: r['orderId'] != null ? String(r['orderId']) : undefined,
      symbol,
      closedQuantity: Number(r['qty'] ?? r['closedQuantity'] ?? 0),
      avgClosePrice: Number(r['avgPrice'] ?? r['price'] ?? 0),
      realizedPnl: Number(r['realizedPnl'] ?? r['pnl'] ?? 0),
      fees: Number(r['fee'] ?? r['commission'] ?? 0),
    };
  }

  private normalizeOrderStatusString(
    status: string
  ): 'New' | 'PartiallyFilled' | 'Filled' | 'Cancelled' | 'Rejected' {
    const map: Record<string, 'New' | 'PartiallyFilled' | 'Filled' | 'Cancelled' | 'Rejected'> = {
      'New': 'New',
      'Created': 'New',
      'new': 'New',
      'PartiallyFilled': 'PartiallyFilled',
      'PARTIALLY_FILLED': 'PartiallyFilled',
      'Filled': 'Filled',
      'FILLED': 'Filled',
      'filled': 'Filled',
      'Cancelled': 'Cancelled',
      'CANCELLED': 'Cancelled',
      'canceled': 'Cancelled',
      'Deactivated': 'Cancelled',
      'Rejected': 'Rejected',
      'REJECTED': 'Rejected',
    };
    return map[status] ?? 'New';
  }

  private normalizePositionSide(side: string): 'Buy' | 'Sell' | 'None' {
    if (side === 'Buy' || side === 'Long' || side === 'long') return 'Buy';
    if (side === 'Sell' || side === 'Short' || side === 'short') return 'Sell';
    return 'None';
  }
}

// ---------------------------------------------------------------------------
// Connector factory with mode routing
// ---------------------------------------------------------------------------

import { ExchangeConnectorFactory } from '../connectors/exchange.factory';

export interface ConnectorFactoryParams {
  exchangeName: string;
  apiKey: string;
  apiSecret: string;
  userId?: string;
  credentialId?: string;
  authToken?: string;
  /** Preferred mode; falls back to 'typescript' if native unavailable */
  preferredMode?: ConnectorMode;
}

/**
 * Creates typed exchange connectors, routing to either the TypeScript
 * adapter or a future native (C++) implementation based on the
 * ConnectorMode discriminator.
 *
 * Phase 1: Always returns TypedConnectorAdapter (wrapping existing connectors)
 * Phase 2: Checks native availability and routes accordingly
 */
export class TypedConnectorFactory {
  /**
   * Registry of native connector constructors, keyed by exchange name.
   * Populated when C++ bridge is loaded.
   */
  private static nativeRegistry: Map<
    string,
    (params: ConnectorFactoryParams) => ITypedExchangeConnector
  > = new Map();

  /**
   * Register a native connector implementation for an exchange.
   * Called by the C++ bridge initialization code.
   */
  static registerNative(
    exchangeName: string,
    factory: (params: ConnectorFactoryParams) => ITypedExchangeConnector
  ): void {
    TypedConnectorFactory.nativeRegistry.set(exchangeName.toUpperCase(), factory);
    console.log(`[TypedConnectorFactory] Registered native connector for ${exchangeName}`);
  }

  /**
   * Check if a native connector is available for an exchange.
   */
  static hasNative(exchangeName: string): boolean {
    return TypedConnectorFactory.nativeRegistry.has(exchangeName.toUpperCase());
  }

  /**
   * Create a typed exchange connector.
   *
   * Routing logic:
   * 1. If preferredMode === 'native' and native is registered -> use native
   * 2. Otherwise -> wrap existing TypeScript connector with TypedConnectorAdapter
   */
  static create(params: ConnectorFactoryParams): ITypedExchangeConnector {
    const exchange = params.exchangeName.toUpperCase();

    // Try native if preferred and available
    if (params.preferredMode === 'native') {
      const nativeFactory = TypedConnectorFactory.nativeRegistry.get(exchange);
      if (nativeFactory) {
        console.log(`[TypedConnectorFactory] Using native connector for ${exchange}`);
        return nativeFactory(params);
      }
      console.log(
        `[TypedConnectorFactory] Native preferred for ${exchange} but not available, falling back to TypeScript`
      );
    }

    // Default: TypeScript adapter wrapping existing connector
    const baseConnector = ExchangeConnectorFactory.create(
      params.exchangeName,
      params.apiKey,
      params.apiSecret,
      params.userId,
      params.credentialId,
      params.authToken
    );

    return new TypedConnectorAdapter(baseConnector);
  }

  /**
   * Get connector mode that will be used for an exchange.
   */
  static getEffectiveMode(
    exchangeName: string,
    preferredMode?: ConnectorMode
  ): ConnectorMode {
    if (
      preferredMode === 'native' &&
      TypedConnectorFactory.nativeRegistry.has(exchangeName.toUpperCase())
    ) {
      return 'native';
    }
    return 'typescript';
  }
}
