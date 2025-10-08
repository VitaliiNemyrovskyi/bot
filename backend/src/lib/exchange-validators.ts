import { Exchange, Environment } from '@prisma/client';
import { BybitService } from './bybit';
import { BingXService } from './bingx';
import { ValidationResult } from '../types/exchange-credentials';

/**
 * Exchange API Validators
 *
 * Validates API credentials for different cryptocurrency exchanges
 * by making test API calls to verify the keys are valid.
 */

export class ExchangeValidators {
  /**
   * Validates Bybit API credentials
   */
  static async validateBybit(
    apiKey: string,
    apiSecret: string,
    environment: Environment
  ): Promise<ValidationResult> {
    try {
      const testnet = environment === Environment.TESTNET;

      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      // Try to fetch API key info to validate credentials
      const apiKeyInfo = await bybitService.getApiKeyInfo();

      // Check if API key has necessary permissions
      if (apiKeyInfo.readOnly === 1) {
        return {
          valid: true,
          details: {
            readOnly: true,
            permissions: apiKeyInfo.permissions,
            warning: 'API key is read-only. Trading operations will not be available.',
          },
        };
      }

      return {
        valid: true,
        details: {
          readOnly: false,
          permissions: apiKeyInfo.permissions,
        },
      };
    } catch (error: any) {
      console.error('Bybit API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate Bybit API keys',
      };
    }
  }

  /**
   * Validates Binance API credentials
   * Note: Requires binance-api-node or similar library
   */
  static async validateBinance(
    apiKey: string,
    apiSecret: string,
    environment: Environment
  ): Promise<ValidationResult> {
    try {
      // TODO: Implement Binance validation when Binance integration is added
      // For now, return a placeholder response

      console.warn('Binance validation not yet implemented');

      return {
        valid: false,
        error: 'Binance API validation not yet implemented',
      };

      // Example implementation (uncomment when binance library is added):
      /*
      const Binance = require('binance-api-node').default;
      const client = Binance({
        apiKey,
        apiSecret,
        useServerTime: true,
        test: environment === Environment.TESTNET,
      });

      // Test the API key by fetching account info
      const accountInfo = await client.accountInfo();

      return {
        valid: true,
        details: {
          canTrade: accountInfo.canTrade,
          canWithdraw: accountInfo.canWithdraw,
          canDeposit: accountInfo.canDeposit,
        },
      };
      */
    } catch (error: any) {
      console.error('Binance API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate Binance API keys',
      };
    }
  }

  /**
   * Validates OKX API credentials
   */
  static async validateOKX(
    apiKey: string,
    apiSecret: string,
    environment: Environment
  ): Promise<ValidationResult> {
    try {
      // TODO: Implement OKX validation when OKX integration is added

      console.warn('OKX validation not yet implemented');

      return {
        valid: false,
        error: 'OKX API validation not yet implemented',
      };
    } catch (error: any) {
      console.error('OKX API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate OKX API keys',
      };
    }
  }

  /**
   * Validates Kraken API credentials
   */
  static async validateKraken(
    apiKey: string,
    apiSecret: string,
    environment: Environment
  ): Promise<ValidationResult> {
    try {
      // TODO: Implement Kraken validation when Kraken integration is added

      console.warn('Kraken validation not yet implemented');

      return {
        valid: false,
        error: 'Kraken API validation not yet implemented',
      };
    } catch (error: any) {
      console.error('Kraken API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate Kraken API keys',
      };
    }
  }

  /**
   * Validates Coinbase API credentials
   */
  static async validateCoinbase(
    apiKey: string,
    apiSecret: string,
    environment: Environment
  ): Promise<ValidationResult> {
    try {
      // TODO: Implement Coinbase validation when Coinbase integration is added

      console.warn('Coinbase validation not yet implemented');

      return {
        valid: false,
        error: 'Coinbase API validation not yet implemented',
      };
    } catch (error: any) {
      console.error('Coinbase API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate Coinbase API keys',
      };
    }
  }

  /**
   * Validates BingX API credentials
   */
  static async validateBingX(
    apiKey: string,
    apiSecret: string,
    environment: Environment
  ): Promise<ValidationResult> {
    try {
      const testnet = environment === Environment.TESTNET;

      const bingxService = new BingXService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      // Sync time with BingX server before making authenticated requests
      await bingxService.syncTime();

      // Try to fetch account balance to validate credentials
      const accountInfo = await bingxService.getAccountInfo();

      return {
        valid: true,
        details: {
          accountType: 'futures',
          balance: accountInfo.balance,
        },
      };
    } catch (error: any) {
      console.error('BingX API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate BingX API keys',
      };
    }
  }

  /**
   * Main validation dispatcher
   * Routes to the appropriate validator based on exchange
   */
  static async validateCredentials(
    exchange: Exchange,
    environment: Environment,
    apiKey: string,
    apiSecret: string
  ): Promise<ValidationResult> {
    switch (exchange) {
      case Exchange.BYBIT:
        return this.validateBybit(apiKey, apiSecret, environment);

      case Exchange.BINANCE:
        return this.validateBinance(apiKey, apiSecret, environment);

      case Exchange.OKX:
        return this.validateOKX(apiKey, apiSecret, environment);

      case Exchange.KRAKEN:
        return this.validateKraken(apiKey, apiSecret, environment);

      case Exchange.COINBASE:
        return this.validateCoinbase(apiKey, apiSecret, environment);

      case Exchange.BINGX:
        return this.validateBingX(apiKey, apiSecret, environment);

      default:
        return {
          valid: false,
          error: `Unsupported exchange: ${exchange}`,
        };
    }
  }
}
