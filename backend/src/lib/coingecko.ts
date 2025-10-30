/**
 * CoinGecko API Service
 *
 * Provides market cap data for cryptocurrencies using CoinGecko Free API.
 * Includes caching to avoid rate limits and optimize performance.
 */

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  market_cap: number;
  current_price: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

interface MarketCapCache {
  data: Map<string, number>;
  timestamp: number;
}

/**
 * Map trading symbols to CoinGecko IDs
 * Example: BTCUSDT -> bitcoin, ETHUSDT -> ethereum
 */
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  // Major cryptocurrencies
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'NEAR': 'near',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'ICP': 'internet-computer',
  'FIL': 'filecoin',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'INJ': 'injective-protocol',
  'SUI': 'sui',
  'STX': 'blockstack',
  'TIA': 'celestia',
  'SEI': 'sei-network',
  'PEPE': 'pepe',
  'WLD': 'worldcoin-wld',
  'FET': 'fetch-ai',
  'GRT': 'the-graph',
  'RUNE': 'thorchain',
  'AAVE': 'aave',
  'MKR': 'maker',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AXS': 'axie-infinity',
  'THETA': 'theta-token',
  'FTM': 'fantom',
  'GALA': 'gala',
  'CHZ': 'chiliz',
  'ENJ': 'enjincoin',
  'ZEC': 'zcash',
  'DASH': 'dash',
  'ETC': 'ethereum-classic',
  'XMR': 'monero',
  'CAKE': 'pancakeswap-token',
  'CRV': 'curve-dao-token',
  'SNX': 'havven',
  'COMP': 'compound-governance-token',
  'YFI': 'yearn-finance',
  'SUSHI': 'sushi',
  '1INCH': '1inch',
  'BAT': 'basic-attention-token',
  'ZRX': '0x',
  'LRC': 'loopring',
  'PEOPLE': 'constitutiondao',
  'APE': 'apecoin',
  'GMT': 'stepn',
  'JOE': 'joe',
  'BLUR': 'blur',
  'DYDX': 'dydx',
  'IMX': 'immutable-x',
  'MASK': 'mask-network',
  'LDO': 'lido-dao',
  'CFX': 'conflux-token',
  'MAGIC': 'magic',
  'FLUX': 'zelcash',
  'JASMY': 'jasmycoin',
  'HBAR': 'hedera-hashgraph',
  'EGLD': 'elrond-erd-2',
  'FLOW': 'flow',
  'KAVA': 'kava',
  'ROSE': 'oasis-network',
  'ONE': 'harmony',
  'CELO': 'celo',
  'WAVES': 'waves',
  'QTUM': 'qtum',
  'ZIL': 'zilliqa',
  'IOTA': 'iota',
  'ONT': 'ontology',
  'ICX': 'icon',
  'ZEN': 'zencash',
  'HIVE': 'hive',
  'NEO': 'neo',
  'IOST': 'iostoken',
  'KSM': 'kusama',
  'AR': 'arweave',
  'XTZ': 'tezos',
  'EOS': 'eos',
  'TRX': 'tron',
  'SHIB': 'shiba-inu',
  'FLOKI': 'floki',
  'BONK': 'bonk',
  'AGIX': 'singularitynet',
  'RNDR': 'render-token',
  'ORDI': 'ordinals',
  'SATS': '1000sats',
  'RATS': 'rats-ordinals',
  'MEME': 'memecoin-2',
  'WIF': 'dogwifcoin',
  'JUP': 'jupiter-exchange-solana',
  'PYTH': 'pyth-network',
  'ARKM': 'arkham',
  'ACE': 'ace-casino',
  'NFP': 'nftprompt',
  'AI': 'sleepless-ai',
  'XAI': 'xai-blockchain',
  'MANTA': 'manta-network',
  'ALT': 'altlayer',
  'JTO': 'jito-governance-token',
  'DYM': 'dymension',
  'PIXEL': 'pixels',
  'STRK': 'starknet',
  'PORTAL': 'portal',
  'AEVO': 'aevo',
  'BOME': 'book-of-meme',
  'ETHFI': 'ether-fi',
  'ENA': 'ethena',
  'W': 'wormhole',
  'SAGA': 'saga-2',
  'TAO': 'bittensor',
  'OMNI': 'omni-network',
  'REZ': 'renzo',
  'BB': 'bouncebit',
  'NOT': 'notcoin',
  'IO': 'io-net',
  'ZK': 'zksync',
  'ZRO': 'layerzero',
  'G': 'gravity',
  'DOGS': 'dogs-2',
  'TON': 'the-open-network',
  'CATI': 'catizen',
  'HMSTR': 'hamster-kombat',
  'EIGEN': 'eigenlayer',
  'NEIRO': 'neiro',
  'TURBO': 'turbo',
  'BABYDOGE': 'baby-doge-coin',
};

export class CoinGeckoService {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private static cache: MarketCapCache | null = null;

  /**
   * Extract base symbol from trading pair
   * Example: BTCUSDT -> BTC, ETHUSDT -> ETH
   */
  private static extractBaseSymbol(symbol: string): string {
    // Remove common quote currencies
    return symbol
      .replace(/USDT$/i, '')
      .replace(/USDC$/i, '')
      .replace(/USD$/i, '')
      .replace(/BUSD$/i, '')
      .toUpperCase();
  }

  /**
   * Convert trading symbol to CoinGecko ID
   */
  private static symbolToCoinGeckoId(symbol: string): string | null {
    const baseSymbol = this.extractBaseSymbol(symbol);
    return SYMBOL_TO_COINGECKO_ID[baseSymbol] || null;
  }

  /**
   * Fetch market data from CoinGecko API
   */
  private static async fetchMarketData(): Promise<CoinGeckoMarketData[]> {
    const coinIds = Object.values(SYMBOL_TO_COINGECKO_ID).join(',');

    const url = `${this.BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=250&page=1&sparkline=false`;

    // console.log('[CoinGecko] Fetching market data from API...');

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoMarketData[] = await response.json();
    console.log(`[CoinGecko] Fetched ${data.length} coins market data`);

    return data;
  }

  /**
   * Update cache with fresh data from CoinGecko
   */
  private static async updateCache(): Promise<void> {
    try {
      const marketData = await this.fetchMarketData();

      const marketCapMap = new Map<string, number>();

      marketData.forEach((coin) => {
        marketCapMap.set(coin.id, coin.market_cap);
      });

      this.cache = {
        data: marketCapMap,
        timestamp: Date.now(),
      };

      console.log(`[CoinGecko] Cache updated with ${marketCapMap.size} coins`);
    } catch (error: any) {
      console.error('[CoinGecko] Failed to update cache:', error.message);
      throw error;
    }
  }

  /**
   * Check if cache is valid (not expired)
   */
  private static isCacheValid(): boolean {
    if (!this.cache) return false;
    const age = Date.now() - this.cache.timestamp;
    return age < this.CACHE_TTL_MS;
  }

  /**
   * Get market cap for a trading symbol
   *
   * @param symbol Trading symbol (e.g., "BTCUSDT", "ETHUSDT")
   * @returns Market cap in USD, or 0 if not found
   */
  public static async getMarketCap(symbol: string): Promise<number> {
    try {
      // Update cache if invalid or missing
      if (!this.isCacheValid()) {
        await this.updateCache();
      }

      if (!this.cache) {
        console.warn('[CoinGecko] Cache not available');
        return 0;
      }

      const coinId = this.symbolToCoinGeckoId(symbol);
      if (!coinId) {
        console.debug(`[CoinGecko] No mapping found for symbol: ${symbol}`);
        return 0;
      }

      const marketCap = this.cache.data.get(coinId) || 0;
      console.debug(`[CoinGecko] Market cap for ${symbol} (${coinId}): $${marketCap.toLocaleString()}`);

      return marketCap;
    } catch (error: any) {
      console.error(`[CoinGecko] Error getting market cap for ${symbol}:`, error.message);
      return 0;
    }
  }

  /**
   * Get market caps for multiple symbols
   *
   * @param symbols Array of trading symbols
   * @returns Map of symbol to market cap
   */
  public static async getMarketCaps(symbols: string[]): Promise<Map<string, number>> {
    try {
      // Update cache if invalid or missing
      if (!this.isCacheValid()) {
        await this.updateCache();
      }

      if (!this.cache) {
        console.warn('[CoinGecko] Cache not available');
        return new Map();
      }

      const result = new Map<string, number>();

      symbols.forEach((symbol) => {
        const coinId = this.symbolToCoinGeckoId(symbol);
        if (coinId) {
          const marketCap = this.cache!.data.get(coinId) || 0;
          result.set(symbol, marketCap);
        } else {
          result.set(symbol, 0);
        }
      });

      console.log(`[CoinGecko] Retrieved market caps for ${result.size} symbols`);

      return result;
    } catch (error: any) {
      console.error('[CoinGecko] Error getting market caps:', error.message);
      return new Map();
    }
  }

  /**
   * Preload cache (useful for warming up on server start)
   */
  public static async preloadCache(): Promise<void> {
    // console.log('[CoinGecko] Preloading cache...');
    await this.updateCache();
  }
}
