/**
 * Trading Models
 *
 * Comprehensive type definitions for manual cryptocurrency trading operations.
 * These interfaces define the data structures for orders, positions, balances,
 * and all trading-related entities in the application.
 */

/**
 * Supported cryptocurrency exchanges
 */
export type Exchange = 'bybit' | 'binance';

/**
 * Order side - Buy or Sell
 */
export type OrderSide = 'Buy' | 'Sell';

/**
 * Order type - Market or Limit
 */
export type OrderType = 'Market' | 'Limit';

/**
 * Order status
 */
export type OrderStatus =
  | 'Created'       // Order created but not yet submitted
  | 'New'           // Order submitted to exchange
  | 'PartiallyFilled'  // Order partially executed
  | 'Filled'        // Order completely filled
  | 'Cancelled'     // Order cancelled by user
  | 'Rejected'      // Order rejected by exchange
  | 'Expired';      // Order expired (e.g., IOC order not filled)

/**
 * Time in Force - defines order lifetime
 */
export type TimeInForce =
  | 'GTC'  // Good Till Cancelled - remains active until filled or cancelled
  | 'IOC'  // Immediate Or Cancel - fill immediately or cancel
  | 'FOK'  // Fill Or Kill - fill completely immediately or cancel
  | 'PostOnly';  // Post only - must be maker order

/**
 * Position side for futures trading
 */
export type PositionSide = 'Long' | 'Short';

/**
 * Trading pair symbol
 * @example 'BTCUSDT', 'ETHUSDT'
 */
export type TradingSymbol = string;

/**
 * Order request payload for placing new orders
 */
export interface OrderRequest {
  exchange: Exchange;
  symbol: TradingSymbol;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;  // Required for Limit orders
  stopLoss?: number;  // Optional stop loss price
  takeProfit?: number;  // Optional take profit price
  timeInForce?: TimeInForce;  // Default: GTC for limit orders
  reduceOnly?: boolean;  // For futures: only reduce position
  postOnly?: boolean;  // For limit orders: ensure maker order
  leverage?: number;  // For futures trading
  credentialId?: string;  // Optional: specify which API credential to use
}

/**
 * Order response from the exchange
 */
export interface OrderResponse {
  orderId: string;
  orderLinkId?: string;  // Client order ID
  exchange: Exchange;
  symbol: TradingSymbol;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  timeInForce: TimeInForce;
  createdAt: Date;
  updatedAt: Date;
  filledQuantity?: number;
  averagePrice?: number;
  commission?: number;
  commissionAsset?: string;
}

/**
 * Position information for futures/margin trading
 */
export interface Position {
  id: string;
  exchange: Exchange;
  symbol: TradingSymbol;
  side: OrderSide;  // Buy (Long) or Sell (Short)
  size: number;  // Position size
  entryPrice: number;  // Average entry price
  markPrice: number;  // Current mark price
  liquidationPrice?: number;  // Liquidation price for leveraged positions
  leverage: number;  // Position leverage
  unrealizedPnl: number;  // Unrealized profit/loss
  unrealizedPnlPercent: number;  // Unrealized PnL percentage
  realizedPnl?: number;  // Realized profit/loss
  marginType?: 'Cross' | 'Isolated';  // Margin type
  positionMargin?: number;  // Position margin
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order history item
 */
export interface Order {
  orderId: string;
  orderLinkId?: string;
  exchange: Exchange;
  symbol: TradingSymbol;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  timeInForce: TimeInForce;
  filledQuantity: number;
  averagePrice?: number;
  commission?: number;
  commissionAsset?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
}

/**
 * Account balance information
 */
export interface Balance {
  exchange: Exchange;
  totalBalance: number;  // Total account balance (including unrealized PnL)
  availableBalance: number;  // Available balance for trading
  usedMargin: number;  // Margin used in open positions
  unrealizedPnl: number;  // Total unrealized PnL from open positions
  walletBalance: number;  // Wallet balance (without unrealized PnL)
  currency: string;  // Base currency (e.g., 'USDT')
  updatedAt: Date;
}

/**
 * Trading symbol information
 */
export interface SymbolInfo {
  symbol: TradingSymbol;
  baseAsset: string;  // e.g., 'BTC'
  quoteAsset: string;  // e.g., 'USDT'
  status: 'Trading' | 'Halt' | 'Break';
  minOrderQty: number;  // Minimum order quantity
  maxOrderQty: number;  // Maximum order quantity
  minPrice: number;  // Minimum price
  maxPrice: number;  // Maximum price
  tickSize: number;  // Price step size
  qtyStep: number;  // Quantity step size
  leverage?: {
    min: number;
    max: number;
  };
}

/**
 * Close position request
 */
export interface ClosePositionRequest {
  exchange: Exchange;
  symbol: TradingSymbol;
  side: OrderSide;  // Side of position to close
  quantity?: number;  // Optional: partial close
}

/**
 * Cancel order request
 */
export interface CancelOrderRequest {
  exchange: Exchange;
  orderId: string;
  symbol: TradingSymbol;
}

/**
 * Trading statistics
 */
export interface TradingStats {
  totalTrades: number;
  winRate: number;  // Percentage
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  averagePnl: number;
  period: '24h' | '7d' | '30d' | 'all';
}

/**
 * Order book entry
 */
export interface OrderBookEntry {
  price: number;
  quantity: number;
  total?: number;  // Cumulative total
}

/**
 * Order book snapshot
 */
export interface OrderBook {
  symbol: TradingSymbol;
  bids: OrderBookEntry[];  // Buy orders
  asks: OrderBookEntry[];  // Sell orders
  timestamp: Date;
}

/**
 * Recent trade
 */
export interface RecentTrade {
  id: string;
  symbol: TradingSymbol;
  price: number;
  quantity: number;
  side: OrderSide;
  timestamp: Date;
}

/**
 * WebSocket update types
 */
export interface PositionUpdate {
  type: 'position';
  data: Position;
}

export interface OrderUpdate {
  type: 'order';
  data: Order;
}

export interface BalanceUpdate {
  type: 'balance';
  data: Balance;
}

/**
 * Trading dashboard state
 */
export interface TradingDashboardState {
  selectedExchange: Exchange;
  selectedSymbol: TradingSymbol;
  positions: Position[];
  orders: Order[];
  balance: Balance | null;
  loading: {
    positions: boolean;
    orders: boolean;
    balance: boolean;
    placeOrder: boolean;
  };
  error: {
    positions: string | null;
    orders: string | null;
    balance: string | null;
    placeOrder: string | null;
  };
}

/**
 * Order form validation errors
 */
export interface OrderFormErrors {
  quantity?: string;
  price?: string;
  stopLoss?: string;
  takeProfit?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
