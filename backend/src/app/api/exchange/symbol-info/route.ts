/**
 * GET /api/exchange/symbol-info
 * Get trading symbol information including minimum order requirements
 *
 * Query params:
 * - exchange: BINGX | BYBIT | MEXC | GATEIO | BITGET
 * - symbol: Trading symbol (e.g., BTC-USDT for BingX, BTCUSDT for Bybit)
 */

import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { BybitService } from '@/lib/bybit';

interface SymbolInfo {
  symbol: string;
  exchange: string;
  minOrderQty: number;
  minOrderValue?: number; // Minimum notional value in USDT
  qtyStep: number; // Quantity step size
  pricePrecision: number;
  qtyPrecision: number;
  maxOrderQty?: number;
  maxLeverage?: number;
}

/**
 * Normalize symbol for BingX exchange
 * Converts symbols like "MERLUSDT" to "MERL-USDT"
 */
function normalizeSymbolForBingX(symbol: string): string {
  // If already has hyphen, return as-is
  if (symbol.includes('-')) {
    return symbol;
  }

  // BingX perpetual futures use USDT or USDC as quote currency
  // Insert hyphen before the quote currency
  if (symbol.endsWith('USDT')) {
    const base = symbol.slice(0, -4); // Remove 'USDT'
    return `${base}-USDT`;
  }

  if (symbol.endsWith('USDC')) {
    const base = symbol.slice(0, -4); // Remove 'USDC'
    return `${base}-USDC`;
  }

  // If no known quote currency, return as-is
  return symbol;
}

/**
 * Normalize symbol for Gate.io exchange
 * Converts symbols like "NVDAXUSDT" to "NVDAX_USDT"
 */
function normalizeSymbolForGateIO(symbol: string): string {
  // If already has underscore, return as-is
  if (symbol.includes('_')) {
    return symbol;
  }

  // Gate.io perpetual futures use USDT or USDC as quote currency
  // Insert underscore before the quote currency
  if (symbol.endsWith('USDT')) {
    const base = symbol.slice(0, -4); // Remove 'USDT'
    return `${base}_USDT`;
  }

  if (symbol.endsWith('USDC')) {
    const base = symbol.slice(0, -4); // Remove 'USDC'
    return `${base}_USDC`;
  }

  // If no known quote currency, return as-is
  return symbol;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exchange = searchParams.get('exchange')?.toUpperCase();
    const symbol = searchParams.get('symbol');

    if (!exchange || !symbol) {
      return NextResponse.json(
        { success: false, error: 'Exchange and symbol are required' },
        { status: 400 }
      );
    }

    console.log(`[API] Getting symbol info for ${symbol} on ${exchange}`);

    let symbolInfo: SymbolInfo | null = null;

    switch (exchange) {
      case 'BINGX':
        // Normalize symbol for BingX (e.g., MERLUSDT -> MERL-USDT)
        const bingxSymbol = normalizeSymbolForBingX(symbol);
        console.log(`[API] BingX symbol normalized: ${symbol} -> ${bingxSymbol}`);
        symbolInfo = await getBingXSymbolInfo(bingxSymbol);
        break;
      case 'BYBIT':
        symbolInfo = await getBybitSymbolInfo(symbol);
        break;
      case 'GATEIO':
        // Normalize symbol for Gate.io (e.g., NVDAXUSDT -> NVDAX_USDT)
        const gateioSymbol = normalizeSymbolForGateIO(symbol);
        console.log(`[API] Gate.io symbol normalized: ${symbol} -> ${gateioSymbol}`);
        symbolInfo = await getGateIOSymbolInfo(gateioSymbol);
        break;
      case 'BITGET':
        symbolInfo = await getBitgetSymbolInfo(symbol);
        break;
      case 'MEXC':
        // TODO: Implement MEXC symbol info
        return NextResponse.json(
          { success: false, error: 'MEXC symbol info not yet implemented' },
          { status: 501 }
        );
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported exchange: ${exchange}` },
          { status: 400 }
        );
    }

    if (!symbolInfo) {
      return NextResponse.json(
        { success: false, error: `Symbol ${symbol} not found on ${exchange}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: symbolInfo,
    });
  } catch (error: any) {
    console.error('[API] Error getting symbol info:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get symbol info' },
      { status: 500 }
    );
  }
}

/**
 * Get BingX symbol information
 */
async function getBingXSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    // Create a temporary BingX service instance (no auth needed for public endpoint)
    const bingx = new BingXService({
      apiKey: 'dummy', // Public endpoint doesn't require real keys
      apiSecret: 'dummy',
      enableRateLimit: false,
    });

    const contracts = await bingx.getContracts();

    // Find the contract for this symbol
    const contract = contracts.find((c: any) => c.symbol === symbol);

    if (!contract) {
      console.warn(`[BingX] Symbol ${symbol} not found in contracts list`);
      return null;
    }

    console.log(`[BingX] Found contract for ${symbol}:`, {
      tradeMinQuantity: contract.tradeMinQuantity,
      minQty: contract.minQty,
      volume: contract.volume,
      quantityPrecision: contract.quantityPrecision,
      pricePrecision: contract.pricePrecision,
    });

    return {
      symbol: contract.symbol,
      exchange: 'BINGX',
      minOrderQty: parseFloat(contract.tradeMinQuantity || contract.minQty || '0.001'),
      minOrderValue: contract.volume ? parseFloat(contract.volume) : undefined,
      qtyStep: parseFloat(contract.size || '0.001'),
      pricePrecision: parseInt(contract.pricePrecision || '2'),
      qtyPrecision: parseInt(contract.quantityPrecision || '3'),
      maxOrderQty: contract.maxQty ? parseFloat(contract.maxQty) : undefined,
      maxLeverage: contract.maxLeverage ? parseInt(contract.maxLeverage) : undefined,
    };
  } catch (error: any) {
    console.error('[BingX] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Get Bybit symbol information
 */
async function getBybitSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    // Create a temporary Bybit service instance (no auth needed for public endpoint)
    const bybit = new BybitService({
      enableRateLimit: false,
    });

    const response = await bybit.getInstrumentsInfo('linear', symbol);

    if (!response.list || response.list.length === 0) {
      console.warn(`[Bybit] Symbol ${symbol} not found`);
      return null;
    }

    const instrument = response.list[0];

    console.log(`[Bybit] Found instrument for ${symbol}:`, {
      minOrderQty: instrument.lotSizeFilter?.minOrderQty,
      minOrderAmt: instrument.lotSizeFilter?.minOrderAmt,
      qtyStep: instrument.lotSizeFilter?.qtyStep,
      basePrecision: instrument.lotSizeFilter?.basePrecision,
      quotePrecision: instrument.lotSizeFilter?.quotePrecision,
    });

    return {
      symbol: instrument.symbol,
      exchange: 'BYBIT',
      minOrderQty: parseFloat(instrument.lotSizeFilter?.minOrderQty || '0.001'),
      minOrderValue: instrument.lotSizeFilter?.minOrderAmt ? parseFloat(instrument.lotSizeFilter.minOrderAmt) : undefined,
      qtyStep: parseFloat(instrument.lotSizeFilter?.qtyStep || '0.001'),
      pricePrecision: parseInt(instrument.priceFilter?.tickSize?.split('.')[1]?.length || '2'),
      qtyPrecision: parseInt(instrument.lotSizeFilter?.basePrecision || '3'),
      maxOrderQty: instrument.lotSizeFilter?.maxOrderQty ? parseFloat(instrument.lotSizeFilter.maxOrderQty) : undefined,
      maxLeverage: instrument.leverageFilter?.maxLeverage ? parseFloat(instrument.leverageFilter.maxLeverage) : undefined,
    };
  } catch (error: any) {
    console.error('[Bybit] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Get Gate.io symbol information
 */
async function getGateIOSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const url = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gate.io API error: ${response.status} ${response.statusText}`);
    }

    const contracts = await response.json();

    // Find the contract for this symbol
    const contract = contracts.find((c: any) => c.name === symbol);

    if (!contract) {
      console.warn(`[Gate.io] Symbol ${symbol} not found in contracts list`);
      return null;
    }

    console.log(`[Gate.io] Found contract for ${symbol}:`, {
      order_size_min: contract.order_size_min,
      order_size_max: contract.order_size_max,
      order_price_round: contract.order_price_round,
      mark_price_round: contract.mark_price_round,
      leverage_max: contract.leverage_max,
    });

    // Calculate precision from rounding values
    const pricePrecision = contract.mark_price_round ? contract.mark_price_round.split('.')[1]?.length || 2 : 2;
    const qtyPrecision = contract.order_size_min ? Math.abs(Math.log10(parseFloat(contract.order_size_min))) : 3;

    return {
      symbol: contract.name,
      exchange: 'GATEIO',
      minOrderQty: parseFloat(contract.order_size_min || '1'),
      minOrderValue: undefined,
      qtyStep: parseFloat(contract.order_size_min || '1'),
      pricePrecision: parseInt(pricePrecision.toString()),
      qtyPrecision: Math.ceil(qtyPrecision),
      maxOrderQty: contract.order_size_max ? parseFloat(contract.order_size_max) : undefined,
      maxLeverage: contract.leverage_max ? parseInt(contract.leverage_max) : undefined,
    };
  } catch (error: any) {
    console.error('[Gate.io] Error getting symbol info:', error.message);
    throw error;
  }
}

/**
 * Get Bitget symbol information
 */
async function getBitgetSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const url = 'https://api.bitget.com/api/v2/mix/market/contracts?productType=USDT-FUTURES';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Bitget API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== '00000' || !data.data) {
      throw new Error(`Bitget API error: ${data.msg}`);
    }

    // Find the contract for this symbol
    const contract = data.data.find((c: any) => c.symbol === symbol);

    if (!contract) {
      console.warn(`[Bitget] Symbol ${symbol} not found in contracts list`);
      return null;
    }

    console.log(`[Bitget] Found contract for ${symbol}:`, {
      minTradeNum: contract.minTradeNum,
      pricePlace: contract.pricePlace,
      volumePlace: contract.volumePlace,
      sizeMultiplier: contract.sizeMultiplier,
      maxLever: contract.maxLever,
    });

    return {
      symbol: contract.symbol,
      exchange: 'BITGET',
      minOrderQty: parseFloat(contract.minTradeNum || '0.001'),
      minOrderValue: undefined,
      qtyStep: parseFloat(contract.minTradeNum || '0.001'),
      pricePrecision: parseInt(contract.pricePlace || '2'),
      qtyPrecision: parseInt(contract.volumePlace || '3'),
      maxOrderQty: undefined,
      maxLeverage: contract.maxLever ? parseInt(contract.maxLever) : undefined,
    };
  } catch (error: any) {
    console.error('[Bitget] Error getting symbol info:', error.message);
    throw error;
  }
}
