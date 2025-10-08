/**
 * Trading Symbols Service
 *
 * Handles fetching, storing, and caching trading symbols from various exchanges.
 * Features:
 * - Syncs trading pairs from Bybit, Binance, and other exchanges
 * - Stores symbols in database with metadata
 * - Provides caching layer for fast API responses
 * - Scheduled daily updates via cron job
 */

import { Exchange, SymbolStatus } from '@prisma/client';
import NodeCache from 'node-cache';
import prisma from '@/lib/prisma';

// Cache configuration: 24 hours TTL
const symbolsCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELISTED';
  minOrderQty?: number;
  maxOrderQty?: number;
  minPrice?: number;
  maxPrice?: number;
  tickSize?: number;
  qtyStep?: number;
  minLeverage?: number;
  maxLeverage?: number;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

/**
 * Fetch trading symbols from Bybit (with pagination support)
 */
async function fetchBybitSymbols(): Promise<SymbolInfo[]> {
  try {
    const allSymbols: SymbolInfo[] = [];
    let cursor = '';
    let hasMore = true;

    while (hasMore) {
      const url = cursor
        ? `https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000&cursor=${cursor}`
        : 'https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000';

      const response = await fetch(url);
      const data = await response.json();

      if (data.retCode !== 0 || !data.result?.list) {
        throw new Error(`Bybit API error: ${data.retMsg}`);
      }

      const symbols: SymbolInfo[] = data.result.list
        .filter((instrument: any) => {
          // Filter for USDT perpetuals
          return instrument.quoteCoin === 'USDT' && instrument.symbol.endsWith('USDT');
        })
        .map((instrument: any) => ({
          symbol: instrument.symbol,
          baseAsset: instrument.baseCoin,
          quoteAsset: instrument.quoteCoin,
          status: instrument.status === 'Trading' ? 'ACTIVE' as const : 'INACTIVE' as const,
          minOrderQty: parseFloat(instrument.lotSizeFilter?.minOrderQty || '0'),
          maxOrderQty: parseFloat(instrument.lotSizeFilter?.maxOrderQty || '0'),
          minPrice: parseFloat(instrument.priceFilter?.minPrice || '0'),
          maxPrice: parseFloat(instrument.priceFilter?.maxPrice || '0'),
          tickSize: parseFloat(instrument.priceFilter?.tickSize || '0'),
          qtyStep: parseFloat(instrument.lotSizeFilter?.qtyStep || '0'),
          minLeverage: parseFloat(instrument.leverageFilter?.minLeverage || '1'),
          maxLeverage: parseFloat(instrument.leverageFilter?.maxLeverage || '1'),
          description: `${instrument.baseCoin}/USDT Perpetual`,
          category: 'FUTURES',
          metadata: {
            contractType: instrument.contractType,
            launchTime: instrument.launchTime,
            deliveryTime: instrument.deliveryTime,
            settleCoin: instrument.settleCoin,
          }
        }));

      allSymbols.push(...symbols);

      // Check if there are more pages
      cursor = data.result.nextPageCursor || '';
      hasMore = cursor !== '';

      console.log(`📄 Fetched page with ${symbols.length} symbols (total: ${allSymbols.length}, hasMore: ${hasMore})`);
    }

    console.log(`✅ Fetched ${allSymbols.length} symbols from Bybit`);
    return allSymbols;
  } catch (error) {
    console.error('❌ Error fetching Bybit symbols:', error);
    throw error;
  }
}

/**
 * Fetch trading symbols from Binance
 */
async function fetchBinanceSymbols(): Promise<SymbolInfo[]> {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
    const data = await response.json();

    if (!data.symbols) {
      throw new Error('Binance API error: No symbols data');
    }

    const symbols: SymbolInfo[] = data.symbols
      .filter((symbol: any) => {
        // Filter for USDT perpetuals
        return symbol.quoteAsset === 'USDT' && symbol.contractType === 'PERPETUAL';
      })
      .map((symbol: any) => {
        const lotSizeFilter = symbol.filters.find((f: any) => f.filterType === 'LOT_SIZE');
        const priceFilter = symbol.filters.find((f: any) => f.filterType === 'PRICE_FILTER');

        return {
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
          quoteAsset: symbol.quoteAsset,
          status: symbol.status === 'TRADING' ? 'ACTIVE' as const : 'INACTIVE' as const,
          minOrderQty: parseFloat(lotSizeFilter?.minQty || '0'),
          maxOrderQty: parseFloat(lotSizeFilter?.maxQty || '0'),
          minPrice: parseFloat(priceFilter?.minPrice || '0'),
          maxPrice: parseFloat(priceFilter?.maxPrice || '0'),
          tickSize: parseFloat(priceFilter?.tickSize || '0'),
          qtyStep: parseFloat(lotSizeFilter?.stepSize || '0'),
          description: `${symbol.baseAsset}/USDT Perpetual`,
          category: 'FUTURES',
          metadata: {
            contractType: symbol.contractType,
            deliveryDate: symbol.deliveryDate,
            onboardDate: symbol.onboardDate,
            underlyingType: symbol.underlyingType,
          }
        };
      });

    console.log(`✅ Fetched ${symbols.length} symbols from Binance`);
    return symbols;
  } catch (error) {
    console.error('❌ Error fetching Binance symbols:', error);
    throw error;
  }
}

/**
 * Sync symbols for a specific exchange to database
 */
async function syncExchangeSymbols(exchange: Exchange, symbols: SymbolInfo[]): Promise<void> {
  try {
    console.log(`🔄 Syncing ${symbols.length} symbols for ${exchange}...`);

    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      for (const symbolInfo of symbols) {
        await tx.tradingSymbol.upsert({
          where: {
            exchange_symbol: {
              exchange,
              symbol: symbolInfo.symbol
            }
          },
          update: {
            baseAsset: symbolInfo.baseAsset,
            quoteAsset: symbolInfo.quoteAsset,
            status: symbolInfo.status as SymbolStatus,
            minOrderQty: symbolInfo.minOrderQty,
            maxOrderQty: symbolInfo.maxOrderQty,
            minPrice: symbolInfo.minPrice,
            maxPrice: symbolInfo.maxPrice,
            tickSize: symbolInfo.tickSize,
            qtyStep: symbolInfo.qtyStep,
            minLeverage: symbolInfo.minLeverage,
            maxLeverage: symbolInfo.maxLeverage,
            description: symbolInfo.description,
            category: symbolInfo.category,
            metadata: symbolInfo.metadata as any,
            lastSyncedAt: new Date()
          },
          create: {
            exchange,
            symbol: symbolInfo.symbol,
            baseAsset: symbolInfo.baseAsset,
            quoteAsset: symbolInfo.quoteAsset,
            status: symbolInfo.status as SymbolStatus,
            minOrderQty: symbolInfo.minOrderQty,
            maxOrderQty: symbolInfo.maxOrderQty,
            minPrice: symbolInfo.minPrice,
            maxPrice: symbolInfo.maxPrice,
            tickSize: symbolInfo.tickSize,
            qtyStep: symbolInfo.qtyStep,
            minLeverage: symbolInfo.minLeverage,
            maxLeverage: symbolInfo.maxLeverage,
            description: symbolInfo.description,
            category: symbolInfo.category,
            metadata: symbolInfo.metadata as any,
            lastSyncedAt: new Date()
          }
        });
      }
    });

    console.log(`✅ Successfully synced ${symbols.length} symbols for ${exchange}`);

    // Invalidate cache for this exchange
    symbolsCache.del(`symbols:${exchange}`);
  } catch (error) {
    console.error(`❌ Error syncing symbols for ${exchange}:`, error);
    throw error;
  }
}

/**
 * Sync all exchanges
 */
export async function syncAllExchanges(): Promise<void> {
  console.log('🚀 Starting trading symbols sync for all exchanges...');

  const results = await Promise.allSettled([
    fetchBybitSymbols().then(symbols => syncExchangeSymbols('BYBIT', symbols)),
    fetchBinanceSymbols().then(symbols => syncExchangeSymbols('BINANCE', symbols)),
  ]);

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failCount = results.filter(r => r.status === 'rejected').length;

  console.log(`✅ Sync completed: ${successCount} successful, ${failCount} failed`);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const exchanges = ['BYBIT', 'BINANCE'];
      console.error(`❌ ${exchanges[index]} sync failed:`, result.reason);
    }
  });
}

/**
 * Get symbols for a specific exchange (with caching)
 */
export async function getSymbolsByExchange(exchange: Exchange): Promise<any[]> {
  const cacheKey = `symbols:${exchange}`;

  // Try to get from cache first
  const cached = symbolsCache.get<any[]>(cacheKey);
  if (cached) {
    console.log(`📦 Returning cached symbols for ${exchange} (${cached.length} symbols)`);
    return cached;
  }

  // Fetch from database
  const symbols = await prisma.tradingSymbol.findMany({
    where: {
      exchange,
      status: 'ACTIVE'
    },
    orderBy: {
      symbol: 'asc'
    }
  });

  // Cache the result
  symbolsCache.set(cacheKey, symbols);

  console.log(`💾 Fetched and cached ${symbols.length} symbols for ${exchange}`);
  return symbols;
}

/**
 * Get all active symbols across all exchanges
 */
export async function getAllActiveSymbols(): Promise<any[]> {
  const cacheKey = 'symbols:all';

  // Try to get from cache first
  const cached = symbolsCache.get<any[]>(cacheKey);
  if (cached) {
    console.log(`📦 Returning cached symbols for all exchanges (${cached.length} symbols)`);
    return cached;
  }

  // Fetch from database
  const symbols = await prisma.tradingSymbol.findMany({
    where: {
      status: 'ACTIVE'
    },
    orderBy: [
      { exchange: 'asc' },
      { symbol: 'asc' }
    ]
  });

  // Cache the result
  symbolsCache.set(cacheKey, symbols);

  console.log(`💾 Fetched and cached ${symbols.length} symbols for all exchanges`);
  return symbols;
}

/**
 * Check if symbols need updating (last sync > 24 hours ago)
 */
export async function shouldUpdateSymbols(exchange: Exchange): Promise<boolean> {
  const lastSymbol = await prisma.tradingSymbol.findFirst({
    where: { exchange },
    orderBy: { lastSyncedAt: 'desc' }
  });

  if (!lastSymbol) return true;

  const hoursSinceLastSync = (Date.now() - lastSymbol.lastSyncedAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastSync >= 24;
}

/**
 * Clear cache (useful for forcing a refresh)
 */
export function clearSymbolsCache(): void {
  symbolsCache.flushAll();
  console.log('🗑️ Symbols cache cleared');
}
