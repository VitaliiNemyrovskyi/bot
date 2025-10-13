import { RestClientV5, WebsocketClient } from 'bybit-api';
import { BybitKeysService } from './bybit-keys-service';

export interface BybitConfig {
  apiKey?: string;
  apiSecret?: string;
  testnet?: boolean;
  enableRateLimit?: boolean;
  userId?: string; // For fetching keys from database
}

export interface AccountInfo {
  totalEquity: string;
  totalWalletBalance: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  totalPerpUPL: string;
  totalInitialMargin: string;
  totalMaintenanceMargin: string;
  coin: any[];
}

export interface Position {
  symbol: string;
  side: 'Buy' | 'Sell';
  size: string;
  positionValue: string;
  entryPrice: string;
  markPrice: string;
  liqPrice: string;
  bustPrice: string;
  positionMM: string;
  positionIM: string;
  tpslMode: string;
  takeProfit: string;
  stopLoss: string;
  trailingStop: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
  createdTime: string;
  updatedTime: string;
}

export interface OrderRequest {
  category: 'linear' | 'spot' | 'option';
  symbol: string;
  side: 'Buy' | 'Sell';
  orderType: 'Market' | 'Limit';
  qty: string;
  price?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  orderLinkId?: string;
  reduceOnly?: boolean;
  closeOnTrigger?: boolean;
  takeProfit?: string;
  stopLoss?: string;
  tpTriggerBy?: string;
  slTriggerBy?: string;
}

export interface Order {
  orderId: string;
  orderLinkId: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  orderType: string;
  qty: string;
  price: string;
  orderStatus: string;
  timeInForce: string;
  createdTime: string;
  updatedTime: string;
  avgPrice: string;
  cumExecQty: string;
  cumExecValue: string;
  cumExecFee: string;
}

export interface TickerInfo {
  symbol: string;
  bid1Price: string;
  bid1Size: string;
  ask1Price: string;
  ask1Size: string;
  lastPrice: string;
  prevPrice24h: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
  volume24h: string;
}

export interface TransactionLog {
  id: string;
  symbol: string;
  category: string;
  side: 'Buy' | 'Sell' | 'None';
  transactionTime: string;
  type: string;
  qty: string;
  size: string;
  currency: string;
  tradePrice: string;
  funding: string;
  fee: string;
  cashFlow: string;
  change: string;
  cashBalance: string;
  feeRate: string;
  bonusChange: string;
  tradeId: string;
  orderId: string;
  orderLinkId: string;
}

export interface ApiKeyPermissions {
  ContractTrade?: string[];
  Spot?: string[];
  Wallet?: string[];
  Options?: string[];
  Derivatives?: string[];
  CopyTrading?: string[];
  BlockTrade?: string[];
  Exchange?: string[];
  NFT?: string[];
  Affiliate?: string[];
}

export interface ApiKeyInfo {
  id: string;
  note: string;
  apiKey: string;
  readOnly: number; // 0: read-write, 1: read-only
  secret: string;
  permissions: ApiKeyPermissions;
  ips: string[];
  type: number; // 1: personal, 2: third-party app
  deadlineDay: number;
  expiredAt: string;
  createdAt: string;
  unified: number; // 0: regular account, 1: unified trading account
  uta: number; // 0: regular account, 1: unified trading account
  userID: number;
  inviterID: number;
  vipLevel: string;
  mktMakerLevel: string;
  affiliateID: number;
  rsaPublicKey: string;
  isMaster: boolean;
}

export interface UserAccountInfo {
  unifiedMarginStatus: number;
  marginMode: 'ISOLATED_MARGIN' | 'REGULAR_MARGIN' | 'PORTFOLIO_MARGIN';
  dcpStatus: string;
  timeWindow: number;
  smpGroup: number;
  isMasterTrader: boolean;
  spotHedgingStatus: 'ON' | 'OFF';
  updatedTime: string;
}

export interface CoinBalance {
  coin: string;
  equity: string;
  usdValue: string;
  walletBalance: string;
  free: string; // Available balance
  locked: string; // Locked balance
  spotHedgingQty: string;
  borrowAmount: string;
  availableToBorrow: string;
  availableToWithdraw: string;
  accruedInterest: string;
  totalOrderIM: string;
  totalPositionIM: string;
  totalPositionMM: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
  bonus: string;
  collateralSwitch: boolean;
  marginCollateral: boolean;
  availableToBorrow: string;
}

export interface WalletBalanceDetail {
  totalEquity: string;
  accountIMRate: string;
  totalMarginBalance: string;
  totalInitialMargin: string;
  accountType: 'UNIFIED' | 'CONTRACT' | 'SPOT' | 'INVESTMENT' | 'OPTION' | 'FUND';
  totalAvailableBalance: string;
  accountMMRate: string;
  totalPerpUPL: string;
  totalWalletBalance: string;
  accountLTV: string;
  totalMaintenanceMargin: string;
  coin: CoinBalance[];
}

export interface FeeRate {
  symbol: string;
  takerFeeRate: string;
  makerFeeRate: string;
}

export interface UserProfile {
  // API Key Information
  apiKeyInfo?: ApiKeyInfo;
  // Account Configuration
  accountInfo?: UserAccountInfo;
  // Wallet Balance
  walletBalance?: WalletBalanceDetail;
  // Fee Rates
  feeRates?: FeeRate[];
}

export class BybitService {
  private restClient: RestClientV5;
  private wsClient?: WebsocketClient;
  private config: BybitConfig;
  private keysLoadedFromDb: boolean = false;
  private timeOffset: number = 0;
  private lastSyncTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 5 * 1000; // 5 seconds for precise timing strategies
  private readonly LARGE_OFFSET_WARNING_MS = 10000; // 10 seconds
  private readonly MAX_OFFSET_MS = 30000; // 30 seconds - matches increased recv_window

  constructor(config: BybitConfig = {}) {
    this.config = {
      testnet: config.testnet ?? true,
      enableRateLimit: config.enableRateLimit ?? true,
      ...config
    };

    console.log('[BybitService] Initializing with config:', {
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey?.length,
      hasApiSecret: !!this.config.apiSecret,
      apiSecretLength: this.config.apiSecret?.length,
      testnet: this.config.testnet,
      enableRateLimit: this.config.enableRateLimit,
      userId: this.config.userId
    });

    this.restClient = new RestClientV5({
      key: this.config.apiKey,
      secret: this.config.apiSecret,
      testnet: this.config.testnet,
      enableRateLimit: this.config.enableRateLimit,
      recv_window: 30000, // 30 seconds - increased from default 5000ms to handle time sync issues
    });

    if (this.config.apiKey && this.config.apiSecret) {
      this.wsClient = new WebsocketClient({
        key: this.config.apiKey,
        secret: this.config.apiSecret,
        testnet: this.config.testnet,
      });
      console.log('[BybitService] WebSocket client initialized');
    } else {
      console.log('[BybitService] WebSocket client not initialized (no credentials)');
    }
  }

  /**
   * Creates a BybitService instance with keys loaded from database
   *
   * @param userId - User ID to load keys for
   * @returns BybitService instance or null if no keys found
   */
  static async createFromDatabase(userId: string): Promise<BybitService | null> {
    try {
      console.log(`[BybitService] Loading keys from database for user: ${userId}`);
      const keys = await BybitKeysService.getApiKeys(userId);

      if (!keys) {
        console.log(`[BybitService] No keys found in database for user: ${userId}`);
        return null;
      }

      console.log(`[BybitService] Keys loaded from database - testnet: ${keys.testnet}`);

      const service = new BybitService({
        apiKey: keys.apiKey,
        apiSecret: keys.apiSecret,
        testnet: keys.testnet,
        enableRateLimit: true,
        userId,
      });

      service.keysLoadedFromDb = true;
      console.log(`[BybitService] Service created successfully from database`);
      return service;
    } catch (error: any) {
      console.error('[BybitService] Error creating service from database:', {
        userId,
        error: error.message,
        stack: error.stack
      });
      return null;
    }
  }

  /**
   * Get Bybit server time
   * Endpoint: GET /v5/market/time
   * Returns: { retCode: 0, retMsg: 'OK', result: { timeSecond: string, timeNano: string } }
   */
  async getServerTime(): Promise<number> {
    try {
      const response = await this.restClient.getServerTime();

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      // Convert timeSecond to milliseconds
      const serverTimeMs = parseInt(response.result.timeSecond) * 1000;
      return serverTimeMs;
    } catch (error: any) {
      console.error('[BybitService] Failed to get server time:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize local time with Bybit server time
   * Calculates the offset between local time and server time
   */
  async syncTime(): Promise<void> {
    try {
      const startTime = Date.now();
      const serverTime = await this.getServerTime();
      const endTime = Date.now();

      // Calculate network latency and offset with proper compensation
      // Formula: offset = serverTime - (localTime + latency/2)
      // Where localTime is the midpoint between request and response
      const roundTripTime = endTime - startTime;
      const latency = roundTripTime / 2;
      const midpoint = startTime + latency; // Estimated time when server processed request

      // Calculate offset: serverTime - midpoint
      const newOffset = serverTime - midpoint;
      this.timeOffset = newOffset;
      this.lastSyncTime = endTime;

      // Log sync status with detailed timing info
      console.log('[BybitService] Time synchronized:', {
        serverTime,
        localTime: endTime,
        midpoint,
        roundTripTime,
        latency,
        offset: newOffset
      });

      // Check if offset exceeds maximum allowed
      if (Math.abs(newOffset) > this.MAX_OFFSET_MS) {
        const errorMsg =
          `CRITICAL: Time offset (${newOffset}ms) exceeds maximum allowed (${this.MAX_OFFSET_MS}ms). ` +
          `Bybit API will reject all requests. ` +
          `\n\nTo fix this issue:\n` +
          `1. Sync your system time: Run 'sudo ntpdate -s time.apple.com' (macOS) or 'sudo ntpdate pool.ntp.org' (Linux)\n` +
          `2. Or use NTP service: 'sudo systemctl restart systemd-timesyncd' (Linux with systemd)\n` +
          `3. Restart the server after syncing time\n`;
        console.error(`[BybitService] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Warn if offset is large but acceptable
      if (Math.abs(newOffset) > this.LARGE_OFFSET_WARNING_MS) {
        console.warn(`[BybitService] WARNING: Large time offset detected: ${newOffset}ms. This may cause API request failures if it increases.`);
      }
    } catch (error: any) {
      console.error('[BybitService] Time sync failed:', error.message);

      // If this is a CRITICAL time offset error, re-throw it
      if (error.message.includes('CRITICAL: Time offset')) {
        throw error;
      }

      // For other errors, fall back to local time
      console.warn('[BybitService] Falling back to local time');
    }
  }

  /**
   * Get synchronized timestamp
   * Returns current timestamp adjusted with server time offset
   */
  getSyncedTime(): number {
    return Date.now() + this.timeOffset;
  }

  /**
   * Start periodic time synchronization
   * Syncs time every 5 seconds for precise timing strategies
   */
  startPeriodicSync(): void {
    if (this.syncInterval) {
      console.log('[BybitService] Periodic sync already running');
      return;
    }

    console.log(`[BybitService] Starting periodic time sync (interval: ${this.SYNC_INTERVAL_MS / 1000} seconds)`);

    this.syncInterval = setInterval(async () => {
      console.log('[BybitService] Performing periodic time sync...');
      await this.syncTime();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic time synchronization
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[BybitService] Periodic time sync stopped');
    }
  }

  /**
   * Get time sync status
   */
  getTimeSyncStatus(): { offset: number; lastSyncTime: number; syncAge: number } {
    return {
      offset: this.timeOffset,
      lastSyncTime: this.lastSyncTime,
      syncAge: Date.now() - this.lastSyncTime
    };
  }

  // Account Information Methods
  /**
   * Get API Key Information
   * Retrieves information about the current API key including permissions, type, and expiration
   * Endpoint: GET /v5/user/query-api
   */
  async getApiKeyInfo(): Promise<ApiKeyInfo> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required');
      }

      const response = await this.restClient.getQueryApiKey();

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result as ApiKeyInfo;
    } catch (error) {
      console.error('Error fetching API key info:', error);
      throw error;
    }
  }

  /**
   * Get User Account Information
   * Retrieves account configuration including margin mode, master trader status, etc.
   * Endpoint: GET /v5/account/info
   */
  async getUserAccountInfo(): Promise<UserAccountInfo> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const response = await this.restClient.getAccountInfo();

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result as UserAccountInfo;
    } catch (error) {
      console.error('Error fetching user account info:', error);
      throw error;
    }
  }

  /**
   * Get Detailed Wallet Balance
   * Retrieves detailed wallet balance information for all coins
   * Endpoint: GET /v5/account/wallet-balance
   */
  async getDetailedWalletBalance(
    accountType: 'UNIFIED' | 'CONTRACT' | 'SPOT' = 'UNIFIED',
    coin?: string
  ): Promise<WalletBalanceDetail> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const params: any = { accountType };
      if (coin) params.coin = coin;

      const response = await this.restClient.getWalletBalance(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list[0] as WalletBalanceDetail;
    } catch (error) {
      console.error('Error fetching detailed wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get Fee Rates
   * Retrieves trading fee rates for specified symbols
   * Endpoint: GET /v5/account/fee-rate
   */
  async getFeeRate(
    category: 'linear' | 'spot' | 'option' = 'linear',
    symbol?: string,
    baseCoin?: string
  ): Promise<FeeRate[]> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const params: any = { category };
      if (symbol) params.symbol = symbol;
      if (baseCoin) params.baseCoin = baseCoin;

      const response = await this.restClient.getFeeRate(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list as FeeRate[];
    } catch (error) {
      console.error('Error fetching fee rate:', error);
      throw error;
    }
  }

  /**
   * Get Complete User Profile
   * Retrieves all available user information in one call
   * This is a convenience method that combines multiple API calls
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const profile: UserProfile = {};

      // Fetch all user information in parallel for better performance
      const [apiKeyInfo, accountInfo, walletBalance, feeRates] = await Promise.allSettled([
        this.getApiKeyInfo(),
        this.getUserAccountInfo(),
        this.getDetailedWalletBalance('UNIFIED'),
        this.getFeeRate('linear')
      ]);

      // Process results and handle any errors
      if (apiKeyInfo.status === 'fulfilled') {
        profile.apiKeyInfo = apiKeyInfo.value;
      } else {
        console.warn('Failed to fetch API key info:', apiKeyInfo.reason);
      }

      if (accountInfo.status === 'fulfilled') {
        profile.accountInfo = accountInfo.value;
      } else {
        console.warn('Failed to fetch account info:', accountInfo.reason);
      }

      if (walletBalance.status === 'fulfilled') {
        profile.walletBalance = walletBalance.value;
      } else {
        console.warn('Failed to fetch wallet balance:', walletBalance.reason);
      }

      if (feeRates.status === 'fulfilled') {
        profile.feeRates = feeRates.value;
      } else {
        console.warn('Failed to fetch fee rates:', feeRates.reason);
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Check if API key has specific permission
   * Helper method to verify if the current API key has a specific permission
   */
  async hasPermission(permissionType: keyof ApiKeyPermissions, permission: string): Promise<boolean> {
    try {
      const apiKeyInfo = await this.getApiKeyInfo();
      const permissions = apiKeyInfo.permissions[permissionType];
      return permissions ? permissions.includes(permission) : false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get API key expiration info
   * Returns information about when the API key expires
   */
  async getApiKeyExpiration(): Promise<{ daysRemaining: number; expiresAt: string; isExpiringSoon: boolean }> {
    try {
      const apiKeyInfo = await this.getApiKeyInfo();
      const expiresAt = new Date(parseInt(apiKeyInfo.expiredAt));
      const now = new Date();
      const daysRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = daysRemaining <= 30;

      return {
        daysRemaining,
        expiresAt: apiKeyInfo.expiredAt,
        isExpiringSoon
      };
    } catch (error) {
      console.error('Error checking API key expiration:', error);
      throw error;
    }
  }

  /**
   * Get Account Info (Configuration)
   * This returns account configuration like margin mode, not balance info
   * For balance info, use getWalletBalance()
   */
  async getAccountInfo(): Promise<AccountInfo> {
    try {
      // getAccountInfo() returns account configuration, not wallet balance
      // We need to fetch wallet balance separately
      const response = await this.restClient.getWalletBalance({
        accountType: 'UNIFIED'
      });

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      // Handle empty list for new accounts
      if (!response.result?.list || response.result.list.length === 0) {
        return {
          totalEquity: '0',
          totalWalletBalance: '0',
          totalMarginBalance: '0',
          totalAvailableBalance: '0',
          totalPerpUPL: '0',
          totalInitialMargin: '0',
          totalMaintenanceMargin: '0',
          coin: []
        } as AccountInfo;
      }

      return response.result.list[0] as AccountInfo;
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  async getWalletBalance(accountType: 'UNIFIED' | 'CONTRACT' = 'UNIFIED', coin?: string) {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const params: any = { accountType };
      if (coin) params.coin = coin;

      console.log(`[Bybit] Fetching wallet balance - accountType: ${accountType}, coin: ${coin || 'all'}, testnet: ${this.config.testnet}`);

      const response = await this.restClient.getWalletBalance(params);

      console.log(`[Bybit] Wallet balance response - retCode: ${response.retCode}, retMsg: ${response.retMsg}`);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error (${response.retCode}): ${response.retMsg}`);
      }

      if (!response.result) {
        throw new Error('Bybit API returned empty result');
      }

      console.log(`[Bybit] Wallet balance retrieved successfully - accounts: ${response.result.list?.length || 0}`);

      // Log detailed balance data
      if (response.result.list && response.result.list.length > 0) {
        const account = response.result.list[0];
        console.log('[Bybit] Balance Details:', {
          totalEquity: account.totalEquity,
          totalWalletBalance: account.totalWalletBalance,
          totalAvailableBalance: account.totalAvailableBalance,
          accountType: account.accountType,
          coinsCount: account.coin?.length || 0
        });

        // Log first few coins with balances
        if (account.coin && account.coin.length > 0) {
          const topCoins = account.coin
            .filter((c: any) => parseFloat(c.walletBalance || '0') > 0)
            .slice(0, 5)
            .map((c: any) => `${c.coin}: ${c.walletBalance}`);
          console.log('[Bybit] Non-zero balances:', topCoins);
        } else {
          console.warn('[Bybit] ⚠️  Account has zero balance! This could mean:');
          console.warn('  1. Testnet account needs funds from https://testnet.bybit.com/app/user/api-management');
          console.warn('  2. Funds are in a different account type (try SPOT or CONTRACT)');
          console.warn('  3. API key lacks "Read-Write" or "Wallet" permissions');
        }
      }

      return response.result;
    } catch (error: any) {
      console.error('[Bybit] Error fetching wallet balance:', {
        message: error.message,
        accountType,
        coin,
        testnet: this.config.testnet,
        hasCredentials: this.hasCredentials()
      });
      throw error;
    }
  }

  /**
   * Get Asset Information
   * Retrieves asset information for different account types
   * Endpoint: GET /v5/asset/transfer/query-asset-info
   *
   * @param accountType - Optional account type (SPOT, CONTRACT, UNIFIED, etc.)
   * @param coin - Optional specific coin to query
   * @returns Asset information including available balance, locked amount, etc.
   */
  async getAssetInfo(accountType?: string, coin?: string) {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const params: any = {};
      if (accountType) params.accountType = accountType;
      if (coin) params.coin = coin;

      const response = await this.restClient.getAssetInfo(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error fetching asset info:', error);
      throw error;
    }
  }

  /**
   * Get All Coins Balance
   * Retrieves balance information for all coins in a specific account type
   * Endpoint: GET /v5/asset/transfer/query-account-coins-balance
   *
   * This method can query the FUND (Funding wallet) and other account types
   * to retrieve detailed balance information including transferBalance, walletBalance, and bonus.
   *
   * @param accountType - Account type (UNIFIED, SPOT, CONTRACT, FUND, OPTION, etc.) - defaults to FUND
   * @param coin - Optional specific coin to query (BTC, ETH, USDT, etc.)
   * @returns All coins balance including transferBalance, walletBalance, and bonus for each coin
   */
  async getAllCoinsBalance(accountType?: string, coin?: string) {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for this operation');
      }

      const params: any = {
        accountType: accountType || 'FUND'
      };
      if (coin) params.coin = coin;

      const response = await this.restClient.getAllCoinsBalance(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error fetching all coins balance:', error);
      throw error;
    }
  }

  // Position Management Methods
  async getPositions(category: 'linear' | 'spot' | 'option' = 'linear', symbol?: string): Promise<Position[]> {
    try {
      const params: any = { category };
      if (symbol) params.symbol = symbol;

      const response = await this.restClient.getPositionInfo(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list as Position[];
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  async closePosition(category: 'linear' | 'spot' | 'option', symbol: string, side: 'Buy' | 'Sell') {
    try {
      const positions = await this.getPositions(category, symbol);
      const position = positions.find(p => p.symbol === symbol && p.side === side);

      if (!position || parseFloat(position.size) === 0) {
        throw new Error(`No position found for ${symbol} on ${side} side`);
      }

      const oppositeSide: 'Buy' | 'Sell' = side === 'Buy' ? 'Sell' : 'Buy';

      return await this.placeOrder({
        category,
        symbol,
        side: oppositeSide,
        orderType: 'Market',
        qty: position.size,
        reduceOnly: true
      });
    } catch (error) {
      console.error('Error closing position:', error);
      throw error;
    }
  }

  // Trading Methods
  async placeOrder(orderData: OrderRequest) {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for trading operations');
      }

      const response = await this.restClient.submitOrder(orderData);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Set leverage for a trading symbol
   * Endpoint: POST /v5/position/set-leverage
   *
   * IMPORTANT: For Bybit V5 API:
   * - Leverage must be set BEFORE opening positions
   * - Both buyLeverage and sellLeverage must be set
   * - In one-way mode, both leverages must be equal
   * - In hedge mode, they can be different
   *
   * @param category Product type: "linear", "inverse"
   * @param symbol Trading pair symbol (e.g., "BTCUSDT")
   * @param buyLeverage Leverage for long positions (1-100x typically)
   * @param sellLeverage Leverage for short positions (1-100x typically)
   */
  async setLeverage(
    category: 'linear' | 'inverse',
    symbol: string,
    buyLeverage: number,
    sellLeverage: number
  ): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for leverage operations');
      }

      console.log('[BybitService] Setting leverage:', {
        category,
        symbol,
        buyLeverage,
        sellLeverage,
      });

      // Validate leverage range (typically 1-100x, but can vary by symbol)
      if (buyLeverage < 1 || buyLeverage > 100) {
        throw new Error(`Invalid buy leverage: ${buyLeverage}. Must be between 1 and 100.`);
      }
      if (sellLeverage < 1 || sellLeverage > 100) {
        throw new Error(`Invalid sell leverage: ${sellLeverage}. Must be between 1 and 100.`);
      }

      const response = await this.restClient.setLeverage({
        category,
        symbol,
        buyLeverage: buyLeverage.toString(),
        sellLeverage: sellLeverage.toString(),
      });

      if (response.retCode !== 0) {
        console.error('[BybitService] Set leverage failed:', {
          retCode: response.retCode,
          retMsg: response.retMsg,
          symbol,
          buyLeverage,
          sellLeverage,
        });
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      console.log('[BybitService] Leverage set successfully:', response.result);
      return response.result;
    } catch (error: any) {
      console.error('[BybitService] Error setting leverage:', error.message);
      throw error;
    }
  }

  /**
   * Set trading stop (take-profit and stop-loss) for an existing position
   * Endpoint: POST /v5/position/trading-stop
   *
   * IMPORTANT: This method sets TP/SL on an existing position
   * - Position must be open before calling this method
   * - TP/SL prices are absolute prices, not percentages
   * - At least one of takeProfit or stopLoss must be provided
   *
   * @param params.category Product type: "linear", "inverse"
   * @param params.symbol Trading pair symbol (e.g., "BTCUSDT")
   * @param params.positionIdx Position index (0 for one-way mode, 1 for long hedge, 2 for short hedge)
   * @param params.takeProfit Take profit price (optional)
   * @param params.stopLoss Stop loss price (optional)
   * @param params.tpslMode TP/SL mode: "Full" (default) or "Partial"
   * @param params.tpTriggerBy TP trigger price type: "LastPrice", "IndexPrice", "MarkPrice" (default)
   * @param params.slTriggerBy SL trigger price type: "LastPrice", "IndexPrice", "MarkPrice" (default)
   */
  async setTradingStop(params: {
    category?: 'linear' | 'inverse';
    symbol: string;
    positionIdx?: number;
    takeProfit?: string;
    stopLoss?: string;
    tpslMode?: 'Full' | 'Partial';
    tpTriggerBy?: 'LastPrice' | 'IndexPrice' | 'MarkPrice';
    slTriggerBy?: 'LastPrice' | 'IndexPrice' | 'MarkPrice';
  }): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for trading stop operations');
      }

      // Validate at least one TP/SL is provided
      if (!params.takeProfit && !params.stopLoss) {
        throw new Error('At least one of takeProfit or stopLoss must be provided');
      }

      console.log('[BybitService] Setting trading stop:', {
        category: params.category || 'linear',
        symbol: params.symbol,
        takeProfit: params.takeProfit,
        stopLoss: params.stopLoss,
        positionIdx: params.positionIdx || 0,
      });

      // Build request parameters
      const requestParams: any = {
        category: params.category || 'linear',
        symbol: params.symbol,
        positionIdx: params.positionIdx ?? 0, // Default to 0 (one-way mode)
      };

      // Add optional parameters
      if (params.takeProfit) requestParams.takeProfit = params.takeProfit;
      if (params.stopLoss) requestParams.stopLoss = params.stopLoss;
      if (params.tpslMode) requestParams.tpslMode = params.tpslMode;
      if (params.tpTriggerBy) requestParams.tpTriggerBy = params.tpTriggerBy;
      if (params.slTriggerBy) requestParams.slTriggerBy = params.slTriggerBy;

      const response = await this.restClient.setTradingStop(requestParams);

      if (response.retCode !== 0) {
        console.error('[BybitService] Set trading stop failed:', {
          retCode: response.retCode,
          retMsg: response.retMsg,
          symbol: params.symbol,
          takeProfit: params.takeProfit,
          stopLoss: params.stopLoss,
        });
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      console.log('[BybitService] Trading stop set successfully:', response.result);
      return response.result;
    } catch (error: any) {
      console.error('[BybitService] Error setting trading stop:', error.message);
      throw error;
    }
  }

  async cancelOrder(category: 'linear' | 'spot' | 'option', symbol: string, orderId?: string, orderLinkId?: string) {
    try {
      if (!orderId && !orderLinkId) {
        throw new Error('Either orderId or orderLinkId must be provided');
      }

      const params: any = { category, symbol };
      if (orderId) params.orderId = orderId;
      if (orderLinkId) params.orderLinkId = orderLinkId;

      const response = await this.restClient.cancelOrder(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  async cancelAllOrders(category: 'linear' | 'spot' | 'option', symbol?: string) {
    try {
      const params: any = { category };
      if (symbol) params.symbol = symbol;

      const response = await this.restClient.cancelAllOrders(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error canceling all orders:', error);
      throw error;
    }
  }

  async getOrders(category: 'linear' | 'spot' | 'option', symbol?: string, orderStatus?: string): Promise<Order[]> {
    try {
      const params: any = { category };
      if (symbol) params.symbol = symbol;
      if (orderStatus) params.orderStatus = orderStatus;

      const response = await this.restClient.getActiveOrders(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrderHistory(category: 'linear' | 'spot' | 'option', symbol?: string, limit: number = 20): Promise<Order[]> {
    try {
      const params: any = { category, limit };
      if (symbol) params.symbol = symbol;

      const response = await this.restClient.getHistoricOrders(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list as Order[];
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  /**
   * Get transaction logs (including funding fee settlements)
   */
  async getTransactionLog(params: {
    accountType?: 'UNIFIED' | 'CONTRACT';
    category?: 'linear' | 'spot' | 'option';
    currency?: string;
    baseCoin?: string;
    type?: string; // SETTLEMENT for funding fees
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): Promise<TransactionLog[]> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('API credentials required for transaction log');
      }

      const requestParams: any = {
        accountType: params.accountType || 'UNIFIED',
        limit: params.limit || 50,
      };

      if (params.category) requestParams.category = params.category;
      if (params.currency) requestParams.currency = params.currency;
      if (params.baseCoin) requestParams.baseCoin = params.baseCoin;
      if (params.type) requestParams.type = params.type;
      if (params.startTime) requestParams.startTime = params.startTime;
      if (params.endTime) requestParams.endTime = params.endTime;

      console.log('[BybitService] Fetching transaction log with params:', requestParams);

      const response = await this.restClient.getTransactionLog(requestParams);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list as TransactionLog[];
    } catch (error) {
      console.error('Error fetching transaction log:', error);
      throw error;
    }
  }

  // Market Data Methods
  async getTicker(category: 'linear' | 'spot' | 'option', symbol?: string): Promise<TickerInfo[]> {
    try {
      const params: any = { category };
      if (symbol) params.symbol = symbol;

      const response = await this.restClient.getTickers(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result.list as TickerInfo[];
    } catch (error) {
      console.error('Error fetching ticker:', error);
      throw error;
    }
  }

  async getKline(category: 'linear' | 'spot' | 'option', symbol: string, interval: string, start?: number, end?: number, limit: number = 200) {
    try {
      const params: any = { category, symbol, interval, limit };
      if (start) params.start = start;
      if (end) params.end = end;

      const response = await this.restClient.getKline(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error fetching kline data:', error);
      throw error;
    }
  }

  async getInstrumentsInfo(category: 'linear' | 'spot' | 'option', symbol?: string) {
    try {
      const params: any = { category };
      if (symbol) params.symbol = symbol;

      const response = await this.restClient.getInstrumentsInfo(params);

      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }

      return response.result;
    } catch (error) {
      console.error('Error fetching instruments info:', error);
      throw error;
    }
  }

  // WebSocket Methods
  subscribeToTicker(symbol: string, callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized. API credentials required.');
    }

    this.wsClient.subscribeV5(`tickers.${symbol}`, 'linear');
    this.wsClient.on('update', callback);
  }

  subscribeToKline(symbol: string, interval: string, callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized. API credentials required.');
    }

    this.wsClient.subscribeV5(`kline.${interval}.${symbol}`, 'linear');
    this.wsClient.on('update', callback);
  }

  subscribeToOrderbook(symbol: string, depth: number = 1, callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized. API credentials required.');
    }

    this.wsClient.subscribeV5(`orderbook.${depth}.${symbol}`, 'linear');
    this.wsClient.on('update', callback);
  }

  subscribeToPositions(callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized. API credentials required.');
    }

    this.wsClient.subscribeV5('position', 'linear');
    this.wsClient.on('update', callback);
  }

  subscribeToOrders(callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized. API credentials required.');
    }

    this.wsClient.subscribeV5('order', 'linear');
    this.wsClient.on('update', callback);
  }

  /**
   * Subscribe to wallet balance updates via WebSocket
   * This is used to monitor funding fee credits in real-time
   *
   * Topic: 'wallet'
   * Updates include: balance changes, funding fee settlements, transfers, etc.
   *
   * Example response data:
   * {
   *   id: "592324803bd2e63c-26bb-46f9-9bdd-...",
   *   topic: "wallet",
   *   creationTime: 1672364262474,
   *   data: [{
   *     accountType: "UNIFIED",
   *     accountIMRate: "0.0162",
   *     totalEquity: "3.81634",
   *     totalWalletBalance: "3.01516",
   *     coin: [{
   *       coin: "USDT",
   *       equity: "3.01516",
   *       walletBalance: "3.01516",
   *       ...
   *     }]
   *   }]
   * }
   */
  subscribeToWallet(callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized. API credentials required.');
    }

    console.log('[BybitService] Subscribing to wallet updates via WebSocket...');
    this.wsClient.subscribeV5('wallet', 'linear');
    this.wsClient.on('update', callback);
    console.log('[BybitService] Wallet subscription active');
  }

  unsubscribeAll() {
    if (this.wsClient) {
      this.wsClient.closeAll();
    }
  }

  // Utility Methods
  isTestnet(): boolean {
    return this.config.testnet ?? true;
  }

  hasCredentials(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }

  updateCredentials(apiKey: string, apiSecret: string, testnet?: boolean) {
    this.config.apiKey = apiKey;
    this.config.apiSecret = apiSecret;
    if (testnet !== undefined) {
      this.config.testnet = testnet;
    }

    // Reinitialize clients with new credentials
    this.restClient = new RestClientV5({
      key: this.config.apiKey,
      secret: this.config.apiSecret,
      testnet: this.config.testnet,
      enableRateLimit: this.config.enableRateLimit,
      recv_window: 30000, // 30 seconds - increased from default 5000ms to handle time sync issues
    });

    this.wsClient = new WebsocketClient({
      key: this.config.apiKey,
      secret: this.config.apiSecret,
      testnet: this.config.testnet,
    });
  }
}

// Export a default instance for easy use
export const bybitService = new BybitService({
  apiKey: process.env.BYBIT_API_KEY,
  apiSecret: process.env.BYBIT_API_SECRET,
  testnet: process.env.NODE_ENV !== 'production',
});