/**
 * CoinGecko Service
 *
 * Service for fetching cryptocurrency market data from CoinGecko API
 * Handles:
 * - Market capitalization data
 * - Caching to reduce API calls
 * - Rate limiting compliance
 */

import axios from 'axios';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  market_cap: number;
  market_cap_rank: number;
  current_price: number;
}

interface MarketCapCache {
  data: Map<string, number>; // symbol -> market cap in millions USD
  lastUpdated: number;
}

// In-memory cache
const marketCapCache: MarketCapCache = {
  data: new Map(),
  lastUpdated: 0
};

/**
 * Normalize symbol to CoinGecko format
 * Removes USDT, USDC, USD suffixes
 */
function normalizeSymbol(symbol: string): string {
  return symbol.replace(/(USDT|USDC|USD)$/, '').toLowerCase();
}

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  return Date.now() - marketCapCache.lastUpdated < CACHE_DURATION_MS;
}

/**
 * Fetch market data from CoinGecko for top coins
 * This fetches top 250 coins by market cap to cover most trading pairs
 */
async function fetchMarketData(): Promise<CoinGeckoMarketData[]> {
  try {
    const response = await axios.get<CoinGeckoMarketData[]>(
      `${COINGECKO_API_BASE}/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching CoinGecko market data:', error);
    throw new Error('Failed to fetch market data from CoinGecko');
  }
}

/**
 * Update the cache with fresh data from CoinGecko
 */
async function updateCache(): Promise<void> {
  try {
    const marketData = await fetchMarketData();

    // Clear existing cache
    marketCapCache.data.clear();

    // Populate cache with new data
    for (const coin of marketData) {
      const normalizedSymbol = coin.symbol.toLowerCase();
      // Store market cap in millions USD
      const marketCapMillions = coin.market_cap / 1_000_000;
      marketCapCache.data.set(normalizedSymbol, marketCapMillions);
    }

    marketCapCache.lastUpdated = Date.now();

    console.log(`✅ CoinGecko cache updated with ${marketCapCache.data.size} coins`);
  } catch (error) {
    console.error('Failed to update CoinGecko cache:', error);
    // Keep old cache if update fails
  }
}

/**
 * Get market cap for a specific symbol
 * Returns market cap in millions USD
 */
export async function getMarketCap(symbol: string): Promise<number> {
  // Update cache if needed
  if (!isCacheValid() || marketCapCache.data.size === 0) {
    await updateCache();
  }

  const normalizedSymbol = normalizeSymbol(symbol);
  return marketCapCache.data.get(normalizedSymbol) || 0;
}

/**
 * Get market caps for multiple symbols
 * Returns a map of symbol -> market cap in millions USD
 */
export async function getMarketCaps(symbols: string[]): Promise<Map<string, number>> {
  // Update cache if needed
  if (!isCacheValid() || marketCapCache.data.size === 0) {
    await updateCache();
  }

  const result = new Map<string, number>();

  for (const symbol of symbols) {
    const normalizedSymbol = normalizeSymbol(symbol);
    const marketCap = marketCapCache.data.get(normalizedSymbol) || 0;
    result.set(symbol, marketCap);
  }

  return result;
}

/**
 * Get all cached market caps
 * Returns a map of symbol -> market cap in millions USD
 */
export async function getAllMarketCaps(): Promise<Map<string, number>> {
  // Update cache if needed
  if (!isCacheValid() || marketCapCache.data.size === 0) {
    await updateCache();
  }

  return new Map(marketCapCache.data);
}

/**
 * Force cache refresh
 */
export async function refreshCache(): Promise<void> {
  await updateCache();
}

// Initialize cache on service load
updateCache().catch(err => {
  console.error('Failed to initialize CoinGecko cache:', err);
});
