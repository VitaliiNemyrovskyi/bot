/**
 * Gate.io API Type Definitions
 * Based on Gate.io Futures API v4
 * Documentation: https://www.gate.io/docs/developers/apiv4/en/
 */

export interface GateIOConfig {
  apiKey: string;
  apiSecret: string;
  enableRateLimit?: boolean;
}

export interface GateIOAccountInfo {
  user: number;
  currency: string;
  total: string;         // Total account balance
  unrealised_pnl: string; // Unrealised PnL
  position_margin: string; // Position margin
  order_margin: string;    // Order margin
  available: string;       // Available balance
  point: string;
  bonus: string;
  in_dual_mode: boolean;
  enable_credit: boolean;
  position_initial_margin: string;
  maintenance_margin: string;
  bonus_max: string;
  transferred: string;
}

export interface GateIOPosition {
  user: number;
  contract: string;       // Contract name (e.g., "BTC_USDT")
  size: number;          // Position size (positive for long, negative for short)
  leverage: string;
  risk_limit: string;
  leverage_max: string;
  maintenance_rate: string;
  value: string;         // Position value in quote currency
  margin: string;        // Position margin
  entry_price: string;   // Average entry price
  liq_price: string;     // Liquidation price
  mark_price: string;    // Mark price
  unrealised_pnl: string; // Unrealised PnL
  realised_pnl: string;   // Realised PnL
  history_pnl: string;
  last_close_pnl: string;
  realised_point: string;
  history_point: string;
  adl_ranking: number;
  pending_orders: number;
  close_order: any | null;
  mode: string;          // Position mode: "single" or "dual_long"/"dual_short"
  cross_leverage_limit: string;
}

export interface GateIOOrderRequest {
  contract: string;       // Contract name (e.g., "BTC_USDT")
  size: number;          // Order size (positive for long, negative for short)
  price?: string;        // Order price (required for limit orders)
  tif?: string;          // Time in force: "gtc", "ioc", "poc" (default: "gtc")
  text?: string;         // User-defined text
  reduce_only?: boolean; // Reduce-only order
  close?: boolean;       // Close position
  iceberg?: number;      // Iceberg order
  auto_size?: string;    // Auto size: "close_long" or "close_short"
}

export interface GateIOOrder {
  id: number;
  user: number;
  contract: string;
  create_time: number;
  finish_time: number;
  finish_as: string;     // Finish as: "filled", "cancelled", "liquidated", etc.
  status: string;        // Order status: "open", "finished"
  size: number;          // Order size
  price: string;         // Order price
  fill_price: string;    // Average fill price
  left: number;          // Unfilled size
  text: string;
  tkfr: string;
  is_liq: boolean;
  is_close: boolean;
  is_reduce_only: boolean;
  tif: string;
  iceberg?: number;
  refu?: number;
}

export interface GateIOTicker {
  contract: string;
  last: string;          // Last price
  change_percentage: string;
  funding_rate: string;  // Current funding rate
  funding_rate_indicative: string;
  mark_price: string;    // Mark price
  index_price: string;   // Index price
  total_size: string;    // Total long position size
  volume_24h: string;
  volume_24h_btc: string;
  volume_24h_usd: string;
  volume_24h_base: string;
  volume_24h_quote: string;
  volume_24h_settle: string;
  quanto_base_rate: string;
  funding_next_apply: number; // Next funding time (Unix timestamp)
  low_24h: string;
  high_24h: string;
}

export interface GateIOFundingRate {
  t: number;             // Funding time (Unix timestamp in milliseconds)
  r: string;             // Funding rate
}

export interface GateIOContract {
  name: string;          // Contract name (e.g., "BTC_USDT")
  type: string;          // Contract type: "direct" or "inverse"
  quanto_multiplier: string;
  leverage_min: string;
  leverage_max: string;
  maintenance_rate: string;
  mark_type: string;
  mark_price: string;
  index_price: string;
  last_price: string;
  maker_fee_rate: string;
  taker_fee_rate: string;
  order_price_round: string;
  mark_price_round: string;
  funding_rate: string;
  funding_interval: number;
  funding_next_apply: number;
  risk_limit_base: string;
  risk_limit_step: string;
  risk_limit_max: string;
  order_size_min: number;
  order_size_max: number;
  order_price_deviate: string;
  ref_discount_rate: string;
  ref_rebate_rate: string;
  orderbook_id: number;
  trade_id: number;
  trade_size: number;
  position_size: number;
  config_change_time: number;
  in_delisting: boolean;
  orders_limit: number;
}

export interface GateIOApiResponse<T> {
  // Gate.io doesn't use a standard wrapper - data is returned directly
  // This interface is for internal use to maintain consistency
  data: T;
}

export interface GateIOBalance {
  user: number;
  currency: string;
  total: string;
  available: string;
}

/**
 * Gate.io Account Book (Ledger) Entry
 * Represents a change in account balance (funding, fees, PnL, etc.)
 */
export interface GateIOAccountBookEntry {
  time: number;          // Change time (Unix timestamp in seconds)
  change: string;        // Change amount (positive for income, negative for expense)
  balance: string;       // Balance after change
  type: string;          // Change type: "dnw" (deposit/withdrawal), "pnl" (PnL), "fee" (trading fee), "refr" (referral), "fund" (funding)
  text: string;          // User-defined text
}

/**
 * Gate.io Trade History Entry
 * Represents a user's executed trade
 */
export interface GateIOMyTrade {
  id: number;            // Trade ID
  create_time: number;   // Trade execution time (Unix timestamp in seconds)
  contract: string;      // Contract name (e.g., "BTC_USDT")
  order_id: string;      // Order ID
  size: number;          // Trade size (positive for long, negative for short)
  price: string;         // Trade price
  role: string;          // Trade role: "maker" or "taker"
  text: string;          // User-defined text
  fee: string;           // Trading fee (negative value)
  point_fee: string;     // Points used to deduct fee
}

/**
 * Gate.io Price-Triggered Order Request
 * Used for creating conditional orders (TP/SL)
 * Endpoint: POST /api/v4/futures/usdt/price_orders
 */
export interface GateIOPriceOrderRequest {
  contract: string;      // Contract name (e.g., "BTC_USDT")
  size?: number;         // Order size (optional, use with reduce_only for partial close)
  close?: boolean;       // Close position flag (deprecated, use reduce_only instead)
  reduce_only?: boolean; // Reduce-only flag (only close position, don't open new)
  trigger: {
    strategy_type: number; // 0 = by price, 1 = by mark price
    price_type: number;    // 0 = last price, 1 = mark price, 2 = index price
    price: string;         // Trigger price
    rule: number;          // 1 = price >= trigger, 2 = price <= trigger
  };
  put: {
    type: string;          // Order type when triggered: "market" or "limit"
    side: string;          // Order side: "ask" (sell/close long) or "bid" (buy/close short)
    price?: string;        // Limit price (required if type is "limit")
  };
  text?: string;         // User-defined text
}

/**
 * Gate.io Price-Triggered Order Response
 */
export interface GateIOPriceOrder {
  id: number;            // Price order ID
  user: number;          // User ID
  contract: string;      // Contract name
  trigger: {
    strategy_type: number;
    price_type: number;
    price: string;
    rule: number;
  };
  put: {
    type: string;
    side: string;
    price: string;
    amount: string;
    tif: string;
  };
  is_close: boolean;
  is_reduce_only: boolean;
  is_liq: boolean;
  status: string;        // Order status: "open", "finished"
  reason: string;
  create_time: number;
  finish_time: number;
  finish_as: string;     // How order finished: "filled", "cancelled", etc.
  size: number;
  me_order_id: string;
}
