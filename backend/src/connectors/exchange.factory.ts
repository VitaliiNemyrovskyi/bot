import { BaseExchangeConnector } from './base-exchange.connector';
import { CCXTExchangeConnector } from './ccxt-exchange.connector';
import { BingXConnector } from './bingx.connector';
import { BybitConnector } from './bybit.connector';
import { MEXCConnector } from './mexc.connector';

/**
 * Exchange Connector Factory
 *
 * Creates appropriate exchange connectors based on exchange type.
 * Supports both custom connectors (for exchanges with specific requirements)
 * and CCXT connectors (for standardized multi-exchange support).
 *
 * Strategy:
 * - Use custom connectors when exchange-specific features are needed
 * - Use CCXT connector for standard operations and new exchanges
 */
export class ExchangeConnectorFactory {
  /**
   * Exchanges with custom connector implementations
   * These have specific features or requirements that ccxt doesn't fully support
   */
  private static readonly CUSTOM_CONNECTORS = new Set([
    'BYBIT',    // Custom: Time sync, advanced TP/SL, precise timing
    'BINGX',    // Custom: Time sync, position mode handling
    'MEXC',     // Custom: Symbol format handling, auth token support
  ]);

  /**
   * Exchanges supported by CCXT (100+ exchanges)
   * Add any exchange here to enable support via CCXT
   */
  private static readonly CCXT_SUPPORTED = new Set([
    'BINANCE',
    'OKX',
    'BITGET',
    'GATE',
    'GATEIO',
    'KUCOIN',
    'HUOBI',
    'KRAKEN',
    'COINBASE',
    'BITFINEX',
    'BITSTAMP',
    'POLONIEX',
    'GEMINI',
    // ... add more as needed
  ]);

  /**
   * Create an exchange connector
   *
   * @param exchangeName - Exchange name (e.g., 'BYBIT', 'BINGX', 'BINANCE')
   * @param apiKey - API key for authentication
   * @param apiSecret - API secret for authentication
   * @param userId - Optional user ID for logging
   * @param credentialId - Optional credential ID for logging
   * @param authToken - Optional auth token (for exchanges like MEXC)
   * @returns BaseExchangeConnector instance
   */
  static create(
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string,
    authToken?: string
  ): BaseExchangeConnector {
    const exchange = exchangeName.toUpperCase();

    console.log(`[ExchangeFactory] Creating connector for ${exchange}`);

    // 1. Check if we have a custom connector for this exchange
    if (this.CUSTOM_CONNECTORS.has(exchange)) {
      console.log(`[ExchangeFactory] Using custom connector for ${exchange}`);
      return this.createCustomConnector(exchange, apiKey, apiSecret, userId, credentialId, authToken);
    }

    // 2. Check if exchange is supported by CCXT
    if (this.CCXT_SUPPORTED.has(exchange) || this.isCCXTSupported(exchangeName)) {
      console.log(`[ExchangeFactory] Using CCXT connector for ${exchange}`);
      return this.createCCXTConnector(exchangeName, apiKey, apiSecret, userId, credentialId);
    }

    // 3. Fallback: Try CCXT anyway (might work for unlisted exchanges)
    console.warn(`[ExchangeFactory] ${exchange} not explicitly listed, attempting CCXT connector`);
    try {
      return this.createCCXTConnector(exchangeName, apiKey, apiSecret, userId, credentialId);
    } catch (error: any) {
      throw new Error(
        `Exchange "${exchange}" is not supported. ` +
        `Please add support or check exchange name. ` +
        `Error: ${error.message}`
      );
    }
  }

  /**
   * Create a custom connector for exchanges with specific requirements
   */
  private static createCustomConnector(
    exchange: string,
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string,
    authToken?: string
  ): BaseExchangeConnector {
    switch (exchange) {
      case 'BYBIT':
        return new BybitConnector(apiKey, apiSecret, userId, credentialId);

      case 'BINGX':
        return new BingXConnector(apiKey, apiSecret, userId, credentialId);

      case 'MEXC':
        // MEXC requires auth token for some operations
        if (!authToken) {
          console.warn(`[ExchangeFactory] MEXC: No auth token provided, some operations may fail`);
        }
        return new MEXCConnector(apiKey, apiSecret, authToken);

      default:
        throw new Error(`Custom connector not implemented for ${exchange}`);
    }
  }

  /**
   * Create a CCXT connector for standardized exchange access
   */
  private static createCCXTConnector(
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string
  ): BaseExchangeConnector {
    // Convert to ccxt format (lowercase)
    const ccxtId = exchangeName.toLowerCase();

    return new CCXTExchangeConnector(
      ccxtId,
      apiKey,
      apiSecret,
      userId,
      credentialId
    );
  }

  /**
   * Check if an exchange is supported by CCXT
   * This checks ccxt's exchange list dynamically
   */
  private static isCCXTSupported(exchangeName: string): boolean {
    try {
      const ccxt = require('ccxt');
      const exchangeId = exchangeName.toLowerCase();
      return exchangeId in ccxt;
    } catch (error) {
      console.error('[ExchangeFactory] Error checking CCXT support:', error);
      return false;
    }
  }

  /**
   * Get list of all supported exchanges
   *
   * @returns Object with custom and CCXT supported exchanges
   */
  static getSupportedExchanges(): {
    custom: string[];
    ccxt: string[];
    all: string[];
  } {
    const custom = Array.from(this.CUSTOM_CONNECTORS);
    const ccxt = Array.from(this.CCXT_SUPPORTED);
    const all = [...new Set([...custom, ...ccxt])].sort();

    return { custom, ccxt, all };
  }

  /**
   * Check if an exchange is supported (either custom or via CCXT)
   *
   * @param exchangeName - Exchange name to check
   * @returns true if supported
   */
  static isSupported(exchangeName: string): boolean {
    const exchange = exchangeName.toUpperCase();
    return (
      this.CUSTOM_CONNECTORS.has(exchange) ||
      this.CCXT_SUPPORTED.has(exchange) ||
      this.isCCXTSupported(exchangeName)
    );
  }

  /**
   * Get connector type for an exchange
   *
   * @param exchangeName - Exchange name
   * @returns 'custom', 'ccxt', or 'unsupported'
   */
  static getConnectorType(exchangeName: string): 'custom' | 'ccxt' | 'unsupported' {
    const exchange = exchangeName.toUpperCase();

    if (this.CUSTOM_CONNECTORS.has(exchange)) {
      return 'custom';
    }

    if (this.CCXT_SUPPORTED.has(exchange) || this.isCCXTSupported(exchangeName)) {
      return 'ccxt';
    }

    return 'unsupported';
  }
}
