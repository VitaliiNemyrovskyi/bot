/**
 * Exchange Fee Rate Synchronization Service
 *
 * Fetches and syncs trading fee rates from exchanges for each user's API credentials.
 * Fee rates are user-specific (depend on VIP tier, trading volume, etc.)
 */

import crypto from 'crypto';
import { BybitService } from '@/lib/bybit';
import { BingXService } from '@/lib/bingx';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import prisma from '@/lib/prisma';

export interface FeeRateData {
  makerFeeRate: number; // e.g., 0.0002 = 0.02%
  takerFeeRate: number; // e.g., 0.0005 = 0.05%
  tier?: string;        // VIP tier or fee level
}

export class ExchangeFeeSyncService {
  /**
   * Sync fee rates for a specific credential
   */
  static async syncFeeRates(credentialId: string): Promise<FeeRateData | null> {
    try {
      // Get credential from database
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        console.error(`[FeeSync] Credential not found: ${credentialId}`);
        return null;
      }

      console.log(`[FeeSync] Syncing fee rates for ${credential.exchange} (credential: ${credentialId})`);

      // Decrypt API keys
      const decrypted = await ExchangeCredentialsService.decryptCredentials(credential);

      // Fetch fee rates based on exchange
      let feeData: FeeRateData | null = null;

      switch (credential.exchange) {
        case 'BYBIT':
          feeData = await this.fetchBybitFeeRates(decrypted.apiKey, decrypted.apiSecret);
          break;
        case 'BINGX':
          feeData = await this.fetchBingXFeeRates(decrypted.apiKey, decrypted.apiSecret);
          break;
        case 'MEXC':
          feeData = await this.fetchMEXCFeeRates(decrypted.apiKey, decrypted.apiSecret);
          break;
        case 'GATEIO':
          feeData = await this.fetchGateIOFeeRates(decrypted.apiKey, decrypted.apiSecret);
          break;
        case 'BITGET':
          feeData = await this.fetchBitgetFeeRates(decrypted.apiKey, decrypted.apiSecret);
          break;
        default:
          console.warn(`[FeeSync] Unsupported exchange: ${credential.exchange}`);
          return null;
      }

      if (!feeData) {
        console.error(`[FeeSync] Failed to fetch fee rates for ${credential.exchange}`);
        return null;
      }

      // Update credential with fee rates
      await prisma.exchangeCredentials.update({
        where: { id: credentialId },
        data: {
          makerFeeRate: feeData.makerFeeRate,
          takerFeeRate: feeData.takerFeeRate,
          feeRateTier: feeData.tier || null,
          feeRateLastSync: new Date(),
        },
      });

      console.log(`[FeeSync] Successfully synced fee rates for ${credential.exchange}:`, {
        maker: `${(feeData.makerFeeRate * 100).toFixed(4)}%`,
        taker: `${(feeData.takerFeeRate * 100).toFixed(4)}%`,
        tier: feeData.tier || 'N/A',
      });

      return feeData;
    } catch (error: any) {
      console.error('[FeeSync] Error syncing fee rates:', error.message);
      throw error;
    }
  }

  /**
   * Fetch Bybit fee rates
   */
  private static async fetchBybitFeeRates(apiKey: string, apiSecret: string): Promise<FeeRateData | null> {
    try {
      const bybit = new BybitService({
        apiKey,
        apiSecret,
        enableRateLimit: false,
      });

      await bybit.syncTime();

      // Get fee rate from Bybit API
      // Bybit uses GET /v5/account/fee-rate
      const response = await bybit.getFeeRate('linear');

      if (!response || !response.list || response.list.length === 0) {
        console.error('[FeeSync] Bybit: No fee rate data returned');
        return null;
      }

      const feeInfo = response.list[0];

      return {
        makerFeeRate: parseFloat(feeInfo.makerFeeRate || '0'),
        takerFeeRate: parseFloat(feeInfo.takerFeeRate || '0'),
        tier: feeInfo.vipLevel || undefined,
      };
    } catch (error: any) {
      console.error('[FeeSync] Bybit error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch BingX fee rates
   */
  private static async fetchBingXFeeRates(apiKey: string, apiSecret: string): Promise<FeeRateData | null> {
    try {
      const bingx = new BingXService({
        apiKey,
        apiSecret,
        enableRateLimit: false,
      });

      await bingx.syncTime();

      // Get trading fee from BingX API
      // BingX uses GET /openApi/swap/v2/user/commissionRate
      const response = await bingx.getCommissionRate();

      if (!response || !response.data) {
        console.error('[FeeSync] BingX: No commission rate data returned');
        return null;
      }

      // BingX returns maker/taker fees as percentages (e.g., "0.02" = 0.02%)
      // We need to convert to decimal (0.02% = 0.0002)
      const makerRate = parseFloat(response.data.makerCommission || '0') / 100;
      const takerRate = parseFloat(response.data.takerCommission || '0') / 100;

      return {
        makerFeeRate: makerRate,
        takerFeeRate: takerRate,
        tier: response.data.userLevel || undefined,
      };
    } catch (error: any) {
      console.error('[FeeSync] BingX error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch MEXC fee rates
   */
  private static async fetchMEXCFeeRates(apiKey: string, apiSecret: string): Promise<FeeRateData | null> {
    try {
      // MEXC API endpoint: GET /api/v3/account (Spot) or /fapi/v1/account (Futures)
      // For futures trading, we use the futures endpoint
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;

      // Create signature
      const crypto = require('crypto');
      const signature = crypto.createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const url = `https://contract.mexc.com/api/v1/private/account/detail?${queryString}&signature=${signature}`;

      const response = await fetch(url, {
        headers: {
          'X-MEXC-APIKEY': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`MEXC API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.data) {
        console.error('[FeeSync] MEXC: No account data returned');
        return null;
      }

      // MEXC returns fee rates as percentages (need to convert to decimal)
      // Typical MEXC rates: maker 0.02%, taker 0.06%
      const makerRate = parseFloat(data.data.makerFeeRate || '0.0002');
      const takerRate = parseFloat(data.data.takerFeeRate || '0.0006');

      return {
        makerFeeRate: makerRate,
        takerFeeRate: takerRate,
        tier: data.data.vipLevel?.toString() || undefined,
      };
    } catch (error: any) {
      console.error('[FeeSync] MEXC error:', error.message);
      // Return default MEXC rates on error
      return {
        makerFeeRate: 0.0002, // 0.02%
        takerFeeRate: 0.0006, // 0.06%
        tier: undefined,
      };
    }
  }

  /**
   * Fetch Gate.io fee rates
   */
  private static async fetchGateIOFeeRates(apiKey: string, apiSecret: string): Promise<FeeRateData | null> {
    try {
      // Gate.io API: GET /api/v4/futures/usdt/accounts
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = 'GET';
      const url = '/api/v4/futures/usdt/accounts';
      const queryString = '';
      const bodyHash = crypto.createHash('sha512').update('').digest('hex');

      const signString = `${method}\n${url}\n${queryString}\n${bodyHash}\n${timestamp}`;
      const signature = crypto.createHmac('sha512', apiSecret)
        .update(signString)
        .digest('hex');

      const response = await fetch(`https://api.gateio.ws${url}`, {
        headers: {
          'KEY': apiKey,
          'SIGN': signature,
          'Timestamp': timestamp,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gate.io API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Gate.io typical rates: maker 0.015%, taker 0.05%
      // These are returned in the account info
      const makerRate = data.maker_fee_rate ? parseFloat(data.maker_fee_rate) : 0.00015;
      const takerRate = data.taker_fee_rate ? parseFloat(data.taker_fee_rate) : 0.0005;

      return {
        makerFeeRate: makerRate,
        takerFeeRate: takerRate,
        tier: data.user_id?.toString() || undefined,
      };
    } catch (error: any) {
      console.error('[FeeSync] Gate.io error:', error.message);
      // Return default Gate.io rates on error
      return {
        makerFeeRate: 0.00015, // 0.015%
        takerFeeRate: 0.0005,  // 0.05%
        tier: undefined,
      };
    }
  }

  /**
   * Fetch Bitget fee rates
   */
  private static async fetchBitgetFeeRates(apiKey: string, apiSecret: string): Promise<FeeRateData | null> {
    try {
      // Bitget API: GET /api/mix/v1/account/account
      const timestamp = Date.now().toString();
      const method = 'GET';
      const requestPath = '/api/mix/v1/account/account';
      const queryString = 'productType=umcbl'; // USDT-M perpetual futures

      const signString = timestamp + method + requestPath + '?' + queryString;
      const signature = crypto.createHmac('sha256', apiSecret)
        .update(signString)
        .digest('base64');

      const response = await fetch(`https://api.bitget.com${requestPath}?${queryString}`, {
        headers: {
          'ACCESS-KEY': apiKey,
          'ACCESS-SIGN': signature,
          'ACCESS-TIMESTAMP': timestamp,
          'ACCESS-PASSPHRASE': '', // Bitget requires passphrase for some endpoints
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Bitget API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Bitget typical rates: maker 0.02%, taker 0.06%
      const makerRate = data.data?.makerFeeRate ? parseFloat(data.data.makerFeeRate) : 0.0002;
      const takerRate = data.data?.takerFeeRate ? parseFloat(data.data.takerFeeRate) : 0.0006;

      return {
        makerFeeRate: makerRate,
        takerFeeRate: takerRate,
        tier: data.data?.vipLevel?.toString() || undefined,
      };
    } catch (error: any) {
      console.error('[FeeSync] Bitget error:', error.message);
      // Return default Bitget rates on error
      return {
        makerFeeRate: 0.0002, // 0.02%
        takerFeeRate: 0.0006, // 0.06%
        tier: undefined,
      };
    }
  }

  /**
   * Sync fee rates for all active credentials of a user
   */
  static async syncAllUserFeeRates(userId: string): Promise<void> {
    try {
      console.log(`[FeeSync] Syncing fee rates for all credentials of user: ${userId}`);

      const credentials = await prisma.exchangeCredentials.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      console.log(`[FeeSync] Found ${credentials.length} active credentials for user ${userId}`);

      for (const credential of credentials) {
        try {
          await this.syncFeeRates(credential.id);
        } catch (error: any) {
          console.error(`[FeeSync] Failed to sync fees for credential ${credential.id}:`, error.message);
          // Continue with next credential
        }
      }

      console.log(`[FeeSync] Completed fee sync for user ${userId}`);
    } catch (error: any) {
      console.error('[FeeSync] Error syncing user fee rates:', error.message);
      throw error;
    }
  }

  /**
   * Get fee rates for a credential (from cache or fetch if needed)
   * Returns cached rates if synced within last 24 hours, otherwise fetches fresh data
   */
  static async getFeeRates(credentialId: string, forceRefresh = false): Promise<FeeRateData | null> {
    try {
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        console.error(`[FeeSync] Credential not found: ${credentialId}`);
        return null;
      }

      // Check if we have cached fee rates (synced within last 24 hours)
      const needsSync = forceRefresh ||
        !credential.feeRateLastSync ||
        (Date.now() - credential.feeRateLastSync.getTime()) > 24 * 60 * 60 * 1000;

      if (needsSync) {
        console.log(`[FeeSync] Fee rates need refresh for credential ${credentialId}`);
        return await this.syncFeeRates(credentialId);
      }

      // Return cached rates
      if (credential.makerFeeRate !== null && credential.takerFeeRate !== null) {
        return {
          makerFeeRate: credential.makerFeeRate,
          takerFeeRate: credential.takerFeeRate,
          tier: credential.feeRateTier || undefined,
        };
      }

      return null;
    } catch (error: any) {
      console.error('[FeeSync] Error getting fee rates:', error.message);
      throw error;
    }
  }
}
