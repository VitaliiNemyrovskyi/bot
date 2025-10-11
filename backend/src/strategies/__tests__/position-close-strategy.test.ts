/**
 * Position Close Strategy Factory Tests
 *
 * Tests for verifying:
 * - Strategy selection logic (factory pattern)
 * - Exchange capability detection
 * - Base strategy helper methods
 * - Strategy interface compliance
 */

import {
  PositionCloseStrategy,
  PositionCloseStrategyFactory,
  CloseOptions,
  CloseResult,
  ExchangeCapabilities,
} from '../position-close-strategy';
import { BaseExchangeConnector, OrderSide } from '@/connectors/base-exchange.connector';

// Mock exchange connector
class MockExchangeConnector extends BaseExchangeConnector {
  public mockInitialize = jest.fn();
  public mockGetBalance = jest.fn();
  public mockGetPosition = jest.fn();
  public mockGetOrderStatus = jest.fn();
  public mockPlaceMarketOrder = jest.fn();
  public mockPlaceLimitOrder = jest.fn();
  public mockCancelOrder = jest.fn();
  public mockClosePosition = jest.fn();
  public mockPlaceReduceOnlyOrder = jest.fn();

  constructor(exchangeName: string) {
    super();
    this.exchangeName = exchangeName;
    this.isInitialized = true;
  }

  async initialize(): Promise<void> {
    return this.mockInitialize();
  }

  async placeMarketOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    return this.mockPlaceMarketOrder(symbol, side, quantity);
  }

  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number,
    options?: any
  ): Promise<any> {
    return this.mockPlaceLimitOrder(symbol, side, quantity, price, options);
  }

  async cancelOrder(orderId: string, symbol?: string): Promise<any> {
    return this.mockCancelOrder(orderId, symbol);
  }

  async getBalance(): Promise<any> {
    return this.mockGetBalance();
  }

  async getPosition(symbol: string): Promise<any> {
    return this.mockGetPosition(symbol);
  }

  async getOrderStatus(orderId: string): Promise<any> {
    return this.mockGetOrderStatus(orderId);
  }

  async closePosition(symbol: string): Promise<any> {
    return this.mockClosePosition(symbol);
  }

  async placeReduceOnlyOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    return this.mockPlaceReduceOnlyOrder(symbol, side, quantity);
  }
}

// Mock strategy for testing base class
class TestStrategy extends PositionCloseStrategy {
  readonly name = 'Test Strategy';
  readonly avgCloseTime = 5000;

  async closePositions(options: CloseOptions): Promise<CloseResult> {
    return {
      success: true,
      primaryClosed: true,
      hedgeClosed: true,
      primaryExitPrice: 50000,
      hedgeExitPrice: 50000,
      closeTime: 5000,
      strategy: this.name,
      primaryFeeType: 'maker',
      hedgeFeeType: 'maker',
    };
  }

  isSupported(): boolean {
    return true;
  }
}

describe('PositionCloseStrategyFactory', () => {
  describe('Exchange Capability Detection', () => {
    it('should detect Bybit full WebSocket capabilities', () => {
      const bybitConnector = new MockExchangeConnector('BYBIT');
      const capabilities = PositionCloseStrategyFactory.getExchangeCapabilities(bybitConnector);

      expect(capabilities).toEqual({
        supportsWebSocketOrders: true,
        supportsWebSocketPositions: true,
        supportsWebSocketPrices: true,
        supportsLimitOrders: true,
        supportsReduceOnly: true,
        supportsPostOnly: true,
      });
    });

    it('should detect Bybit testnet capabilities (case insensitive)', () => {
      const bybitTestnet = new MockExchangeConnector('bybit_testnet');
      const capabilities = PositionCloseStrategyFactory.getExchangeCapabilities(bybitTestnet);

      expect(capabilities.supportsWebSocketOrders).toBe(true);
      expect(capabilities.supportsWebSocketPrices).toBe(true);
    });

    it('should detect BingX partial WebSocket capabilities', () => {
      const bingxConnector = new MockExchangeConnector('BINGX');
      const capabilities = PositionCloseStrategyFactory.getExchangeCapabilities(bingxConnector);

      expect(capabilities).toEqual({
        supportsWebSocketOrders: false, // BingX doesn't support WS orders
        supportsWebSocketPositions: true,
        supportsWebSocketPrices: true,
        supportsLimitOrders: true,
        supportsReduceOnly: true,
        supportsPostOnly: false,
      });
    });

    it('should detect MEXC limited WebSocket capabilities', () => {
      const mexcConnector = new MockExchangeConnector('MEXC');
      const capabilities = PositionCloseStrategyFactory.getExchangeCapabilities(mexcConnector);

      expect(capabilities).toEqual({
        supportsWebSocketOrders: false,
        supportsWebSocketPositions: true,
        supportsWebSocketPrices: true,
        supportsLimitOrders: true,
        supportsReduceOnly: false, // MEXC doesn't support reduce-only
        supportsPostOnly: false,
      });
    });

    it('should return default minimal capabilities for unknown exchanges', () => {
      const unknownConnector = new MockExchangeConnector('UNKNOWN_EXCHANGE');
      const capabilities = PositionCloseStrategyFactory.getExchangeCapabilities(unknownConnector);

      expect(capabilities).toEqual({
        supportsWebSocketOrders: false,
        supportsWebSocketPositions: false,
        supportsWebSocketPrices: false,
        supportsLimitOrders: true,
        supportsReduceOnly: false,
        supportsPostOnly: false,
      });
    });
  });

  describe('Strategy Selection', () => {
    it('should select Ultra-Fast WS strategy for Bybit-to-Bybit', () => {
      const primaryBybit = new MockExchangeConnector('BYBIT');
      const hedgeBybit = new MockExchangeConnector('BYBIT');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const strategy = PositionCloseStrategyFactory.getStrategy(primaryBybit, hedgeBybit);

      expect(strategy.name).toBe('Ultra-Fast WebSocket');
      expect(strategy.avgCloseTime).toBe(3000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Ultra-Fast WebSocket strategy')
      );

      consoleSpy.mockRestore();
    });

    it('should select Hybrid strategy for BingX-to-BingX', () => {
      const primaryBingX = new MockExchangeConnector('BINGX');
      const hedgeBingX = new MockExchangeConnector('BINGX');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const strategy = PositionCloseStrategyFactory.getStrategy(primaryBingX, hedgeBingX);

      expect(strategy.name).toBe('Hybrid WebSocket + REST');
      expect(strategy.avgCloseTime).toBe(6000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Hybrid + WS Monitoring strategy')
      );

      consoleSpy.mockRestore();
    });

    it('should select Hybrid strategy for MEXC-to-MEXC', () => {
      const primaryMEXC = new MockExchangeConnector('MEXC');
      const hedgeMEXC = new MockExchangeConnector('MEXC');

      const strategy = PositionCloseStrategyFactory.getStrategy(primaryMEXC, hedgeMEXC);

      expect(strategy.name).toBe('Hybrid WebSocket + REST');
    });

    it('should select Hybrid strategy for mixed Bybit-to-BingX', () => {
      const bybit = new MockExchangeConnector('BYBIT');
      const bingx = new MockExchangeConnector('BINGX');

      const strategy = PositionCloseStrategyFactory.getStrategy(bybit, bingx);

      expect(strategy.name).toBe('Hybrid WebSocket + REST');
    });

    it('should select Hybrid strategy for mixed BingX-to-MEXC', () => {
      const bingx = new MockExchangeConnector('BINGX');
      const mexc = new MockExchangeConnector('MEXC');

      const strategy = PositionCloseStrategyFactory.getStrategy(bingx, mexc);

      expect(strategy.name).toBe('Hybrid WebSocket + REST');
    });

    it('should select Hybrid strategy for unknown exchange pairs', () => {
      const unknown1 = new MockExchangeConnector('UNKNOWN1');
      const unknown2 = new MockExchangeConnector('UNKNOWN2');

      const strategy = PositionCloseStrategyFactory.getStrategy(unknown1, unknown2);

      expect(strategy.name).toBe('Hybrid WebSocket + REST');
    });
  });
});

describe('PositionCloseStrategy Base Class', () => {
  let primaryExchange: MockExchangeConnector;
  let hedgeExchange: MockExchangeConnector;
  let strategy: TestStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    primaryExchange = new MockExchangeConnector('BYBIT');
    hedgeExchange = new MockExchangeConnector('BINGX');
    strategy = new TestStrategy(primaryExchange, hedgeExchange);
  });

  describe('getCurrentPrice', () => {
    it('should get price from position markPrice', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        markPrice: '50000.50',
        lastPrice: '49999.00',
        avgPrice: '50001.00',
      });

      const getCurrentPrice = (strategy as any).getCurrentPrice.bind(strategy);
      const price = await getCurrentPrice(primaryExchange, 'BTCUSDT');

      expect(price).toBe(50000.50);
      expect(primaryExchange.mockGetPosition).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should fallback to lastPrice if markPrice not available', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        markPrice: null,
        lastPrice: '49999.50',
        avgPrice: '50001.00',
      });

      const getCurrentPrice = (strategy as any).getCurrentPrice.bind(strategy);
      const price = await getCurrentPrice(primaryExchange, 'BTCUSDT');

      expect(price).toBe(49999.50);
    });

    it('should fallback to avgPrice if markPrice and lastPrice not available', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        markPrice: null,
        lastPrice: null,
        avgPrice: '50001.25',
      });

      const getCurrentPrice = (strategy as any).getCurrentPrice.bind(strategy);
      const price = await getCurrentPrice(primaryExchange, 'BTCUSDT');

      expect(price).toBe(50001.25);
    });

    it('should throw error if all prices are invalid', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        markPrice: '0',
        lastPrice: null,
        avgPrice: null,
      });

      const getCurrentPrice = (strategy as any).getCurrentPrice.bind(strategy);

      await expect(getCurrentPrice(primaryExchange, 'BTCUSDT')).rejects.toThrow(
        'Invalid price for BTCUSDT'
      );
    });

    it('should throw error if getPosition fails', async () => {
      primaryExchange.mockGetPosition.mockRejectedValue(new Error('API Error'));

      const getCurrentPrice = (strategy as any).getCurrentPrice.bind(strategy);

      await expect(getCurrentPrice(primaryExchange, 'BTCUSDT')).rejects.toThrow(
        'Failed to get price for BTCUSDT: API Error'
      );
    });
  });

  describe('calculateAggressivePrice', () => {
    it('should calculate aggressive sell price (below market)', () => {
      const calculateAggressivePrice = (strategy as any).calculateAggressivePrice.bind(strategy);
      const price = calculateAggressivePrice(50000, 'Sell', 0.0005);

      // Sell: 50000 * (1 - 0.0005) = 49975
      expect(price).toBe(49975);
    });

    it('should calculate aggressive buy price (above market)', () => {
      const calculateAggressivePrice = (strategy as any).calculateAggressivePrice.bind(strategy);
      const price = calculateAggressivePrice(50000, 'Buy', 0.0005);

      // Buy: 50000 * (1 + 0.0005) = 50025
      expect(price).toBe(50025);
    });

    it('should use default margin of 0.0005 (0.05%)', () => {
      const calculateAggressivePrice = (strategy as any).calculateAggressivePrice.bind(strategy);
      const sellPrice = calculateAggressivePrice(50000, 'Sell');
      const buyPrice = calculateAggressivePrice(50000, 'Buy');

      expect(sellPrice).toBe(49975);
      expect(buyPrice).toBe(50025);
    });

    it('should handle custom margin values', () => {
      const calculateAggressivePrice = (strategy as any).calculateAggressivePrice.bind(strategy);

      // 0.1% margin
      const sellPrice = calculateAggressivePrice(50000, 'Sell', 0.001);
      const buyPrice = calculateAggressivePrice(50000, 'Buy', 0.001);

      expect(sellPrice).toBeCloseTo(49950, 1);
      expect(buyPrice).toBeCloseTo(50050, 1);
    });
  });

  describe('forceClosePosition', () => {
    it('should try placeReduceOnlyOrder first', async () => {
      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: '123',
        status: 'FILLED',
      });

      const forceClose = (strategy as any).forceClosePosition.bind(strategy);
      const result = await forceClose(primaryExchange, 'BTCUSDT', 'Sell', 1.0, 'BYBIT');

      expect(primaryExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        'BTCUSDT',
        'Sell',
        1.0
      );
      expect(primaryExchange.mockClosePosition).not.toHaveBeenCalled();
      expect(primaryExchange.mockPlaceMarketOrder).not.toHaveBeenCalled();
      expect(result).toEqual({ orderId: '123', status: 'FILLED' });
    });

    it('should fallback to closePosition if placeReduceOnlyOrder fails', async () => {
      primaryExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Not supported')
      );
      primaryExchange.mockClosePosition.mockResolvedValue({
        success: true,
      });

      const forceClose = (strategy as any).forceClosePosition.bind(strategy);
      const result = await forceClose(primaryExchange, 'BTCUSDT', 'Sell', 1.0, 'BYBIT');

      expect(primaryExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(primaryExchange.mockClosePosition).toHaveBeenCalledWith('BTCUSDT');
      expect(primaryExchange.mockPlaceMarketOrder).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should fallback to placeMarketOrder as last resort', async () => {
      primaryExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Not supported')
      );
      primaryExchange.mockClosePosition.mockRejectedValue(new Error('Failed'));
      primaryExchange.mockPlaceMarketOrder.mockResolvedValue({
        orderId: '789',
      });

      const forceClose = (strategy as any).forceClosePosition.bind(strategy);
      const result = await forceClose(primaryExchange, 'BTCUSDT', 'Sell', 1.0, 'BYBIT');

      expect(primaryExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(primaryExchange.mockClosePosition).toHaveBeenCalled();
      expect(primaryExchange.mockPlaceMarketOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 1.0);
      expect(result).toEqual({ orderId: '789' });
    });

    it('should throw error if all methods fail', async () => {
      primaryExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Failed 1'));
      primaryExchange.mockClosePosition.mockRejectedValue(new Error('Failed 2'));
      primaryExchange.mockPlaceMarketOrder.mockRejectedValue(new Error('Failed 3'));

      const forceClose = (strategy as any).forceClosePosition.bind(strategy);

      await expect(
        forceClose(primaryExchange, 'BTCUSDT', 'Sell', 1.0, 'BYBIT')
      ).rejects.toThrow(/Failed to close BYBIT position: Failed 3/);

      expect(primaryExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(primaryExchange.mockClosePosition).toHaveBeenCalled();
      expect(primaryExchange.mockPlaceMarketOrder).toHaveBeenCalled();
    });

    it('should skip method if connector does not support it', async () => {
      // Create connector without closePosition method
      const limitedConnector = new MockExchangeConnector('LIMITED');
      delete (limitedConnector as any).closePosition;
      delete (limitedConnector as any).mockClosePosition;

      limitedConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Failed'));
      limitedConnector.mockPlaceMarketOrder.mockResolvedValue({ orderId: '999' });

      const forceClose = (strategy as any).forceClosePosition.bind(strategy);
      const result = await forceClose(limitedConnector, 'BTCUSDT', 'Sell', 1.0, 'LIMITED');

      expect(limitedConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(limitedConnector.mockPlaceMarketOrder).toHaveBeenCalled();
      expect(result).toEqual({ orderId: '999' });
    });

    it('should log progress through fallback methods', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      primaryExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Failed 1'));
      primaryExchange.mockClosePosition.mockRejectedValue(new Error('Failed 2'));
      primaryExchange.mockPlaceMarketOrder.mockResolvedValue({ orderId: '789' });

      const forceClose = (strategy as any).forceClosePosition.bind(strategy);
      await forceClose(primaryExchange, 'BTCUSDT', 'Sell', 1.0, 'BYBIT');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attempting reduce-only order on BYBIT')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('reduce-only order failed')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('BYBIT closed using regular market order')
      );

      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Strategy Interface', () => {
    it('should have required properties', () => {
      expect(strategy.name).toBeDefined();
      expect(typeof strategy.name).toBe('string');
      expect(strategy.avgCloseTime).toBeDefined();
      expect(typeof strategy.avgCloseTime).toBe('number');
    });

    it('should have required methods', () => {
      expect(typeof strategy.closePositions).toBe('function');
      expect(typeof strategy.isSupported).toBe('function');
    });

    it('should return CloseResult from closePositions', async () => {
      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTC-USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const result = await strategy.closePositions(options);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('primaryClosed');
      expect(result).toHaveProperty('hedgeClosed');
      expect(result).toHaveProperty('primaryExitPrice');
      expect(result).toHaveProperty('hedgeExitPrice');
      expect(result).toHaveProperty('closeTime');
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('primaryFeeType');
      expect(result).toHaveProperty('hedgeFeeType');
    });

    it('should return boolean from isSupported', () => {
      const result = strategy.isSupported();
      expect(typeof result).toBe('boolean');
    });
  });
});
