import Redis from 'ioredis';

/**
 * Redis Cache Service
 * Singleton instance for caching real-time prices and funding rates
 */
class RedisService {
  private static instance: RedisService | null = null;
  private client: Redis | null = null;
  private isConnected = false;

  // TTL configurations (in seconds)
  private readonly PRICE_TTL = 5; // 5 seconds for real-time prices
  private readonly FUNDING_RATE_TTL = 60; // 1 minute for funding rates

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      // Redis connection from environment or default localhost
      const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';

      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        retryStrategy: (times) => {
          // Stop retrying after 3 attempts
          if (times > 3) {
            console.warn('[Redis] Max retry attempts reached, giving up');
            return null; // Stop retrying
          }
          // Wait 1 second between retries
          return 1000;
        },
        reconnectOnError: () => false, // Don't auto-reconnect on errors
      });

      await this.client.connect();

      this.client.on('error', (err) => {
        // Only log first error, not spam
        if (this.isConnected) {
          console.error('[Redis] Connection error:', err.message);
          this.isConnected = false;
        }
      });

      this.client.on('connect', () => {
        // console.log('[Redis] Connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        // console.log('[Redis] Client ready');
        this.isConnected = true;
      });

      this.isConnected = true;
    } catch (error: any) {
      console.error('[Redis] Failed to connect:', error.message);
      this.isConnected = false;

      // Clean up the client if connection failed
      if (this.client) {
        try {
          await this.client.quit();
        } catch (quitError) {
          // Ignore quit errors
        }
        this.client = null;
      }

      throw error;
    }
  }

  /**
   * Get Redis client (for advanced usage)
   */
  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Cache real-time price
   * Key format: price:{exchange}:{symbol}
   */
  async cachePrice(exchange: string, symbol: string, price: number): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const key = `price:${exchange}:${symbol}`;
      const data = JSON.stringify({
        price,
        timestamp: Date.now(),
      });

      await this.client!.setex(key, this.PRICE_TTL, data);
    } catch (error: any) {
      console.error(`[Redis] Error caching price for ${exchange}:${symbol}:`, error.message);
    }
  }

  /**
   * Get cached price
   */
  async getPrice(exchange: string, symbol: string): Promise<{ price: number; timestamp: number } | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const key = `price:${exchange}:${symbol}`;
      const data = await this.client!.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error: any) {
      console.error(`[Redis] Error getting price for ${exchange}:${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Cache funding rate
   * Key format: funding:{exchange}:{symbol}
   */
  async cacheFundingRate(
    exchange: string,
    symbol: string,
    fundingRate: number,
    nextFundingTime: Date,
    markPrice?: number,
    indexPrice?: number
  ): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const key = `funding:${exchange}:${symbol}`;
      const data = JSON.stringify({
        fundingRate,
        nextFundingTime: nextFundingTime.toISOString(),
        markPrice,
        indexPrice,
        timestamp: Date.now(),
      });

      await this.client!.setex(key, this.FUNDING_RATE_TTL, data);
    } catch (error: any) {
      console.error(`[Redis] Error caching funding rate for ${exchange}:${symbol}:`, error.message);
    }
  }

  /**
   * Get cached funding rate
   */
  async getFundingRate(
    exchange: string,
    symbol: string
  ): Promise<{
    fundingRate: number;
    nextFundingTime: string;
    markPrice?: number;
    indexPrice?: number;
    timestamp: number;
  } | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const key = `funding:${exchange}:${symbol}`;
      const data = await this.client!.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error: any) {
      console.error(`[Redis] Error getting funding rate for ${exchange}:${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Cache multiple prices at once
   */
  async cachePrices(prices: Array<{ exchange: string; symbol: string; price: number }>): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    const pipeline = this.client!.pipeline();

    for (const { exchange, symbol, price } of prices) {
      const key = `price:${exchange}:${symbol}`;
      const data = JSON.stringify({
        price,
        timestamp: Date.now(),
      });
      pipeline.setex(key, this.PRICE_TTL, data);
    }

    try {
      await pipeline.exec();
    } catch (error: any) {
      console.error('[Redis] Error caching multiple prices:', error.message);
    }
  }

  /**
   * Get all cached prices for a symbol across exchanges
   */
  async getPricesForSymbol(symbol: string): Promise<Record<string, { price: number; timestamp: number }>> {
    if (!this.isReady()) {
      return {};
    }

    try {
      const pattern = `price:*:${symbol}`;
      const keys = await this.client!.keys(pattern);

      if (keys.length === 0) {
        return {};
      }

      const values = await this.client!.mget(...keys);
      const result: Record<string, { price: number; timestamp: number }> = {};

      keys.forEach((key, index) => {
        const exchange = key.split(':')[1]; // Extract exchange from key
        const value = values[index];

        if (value && exchange) {
          result[exchange] = JSON.parse(value);
        }
      });

      return result;
    } catch (error: any) {
      console.error(`[Redis] Error getting prices for symbol ${symbol}:`, error.message);
      return {};
    }
  }

  /**
   * Clear all cache
   */
  async flushAll(): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      await this.client!.flushall();
      // console.log('[Redis] Cache cleared');
    } catch (error: any) {
      console.error('[Redis] Error flushing cache:', error.message);
    }
  }

  /**
   * Cache bulk funding rates for an exchange
   * Key format: bulk-funding:{exchange}
   *
   * Used by public funding rate endpoints to cache entire response
   * for ultra-fast subsequent requests (~5ms vs ~200ms)
   */
  async cacheBulkFundingRates(exchange: string, data: any, ttlSeconds: number): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const key = `bulk-funding:${exchange.toUpperCase()}`;
      const cacheData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });

      await this.client!.setex(key, ttlSeconds, cacheData);
    } catch (error: any) {
      console.error(`[Redis] Error caching bulk funding rates for ${exchange}:`, error.message);
    }
  }

  /**
   * Get cached bulk funding rates for an exchange
   *
   * @returns Object with data and timestamp, or null if not cached
   */
  async getBulkFundingRates(exchange: string): Promise<{ data: any; timestamp: number } | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const key = `bulk-funding:${exchange.toUpperCase()}`;
      const cached = await this.client!.get(key);

      if (!cached) {
        return null;
      }

      return JSON.parse(cached);
    } catch (error: any) {
      console.error(`[Redis] Error getting bulk funding rates for ${exchange}:`, error.message);
      return null;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      // console.log('[Redis] Disconnected');
    }
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();
