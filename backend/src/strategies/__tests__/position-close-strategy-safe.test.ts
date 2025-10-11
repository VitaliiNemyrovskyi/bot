/**
 * Critical Safety Tests for Position Close Strategy
 *
 * These tests verify that the position close strategy NEVER opens new positions
 * by accidentally using placeMarketOrder without reduceOnly flag.
 *
 * Bug History: Previously, forceClosePosition had a fallback to regular placeMarketOrder
 * which could open new positions in the opposite direction when the position was already closed.
 */

import { PositionCloseStrategy } from '../position-close-strategy';
import { BaseExchangeConnector, OrderSide } from '../../connectors/base-exchange.connector';

// Mock implementation of PositionCloseStrategy for testing
class TestCloseStrategy extends PositionCloseStrategy {
  readonly name = 'Test Strategy';
  readonly avgCloseTime = 1000;

  isSupported(): boolean {
    return true;
  }

  async closePositions(options: any): Promise<any> {
    return { success: true };
  }

  // Expose protected method for testing
  public async testForceClosePosition(
    connector: BaseExchangeConnector,
    symbol: string,
    side: OrderSide,
    quantity: number,
    exchangeName: string
  ): Promise<any> {
    return this.forceClosePosition(connector, symbol, side, quantity, exchangeName);
  }
}

describe('Position Close Strategy - Critical Safety Tests', () => {
  let strategy: TestCloseStrategy;
  let mockConnector: any;

  beforeEach(() => {
    // Create mock connector
    mockConnector = {
      exchangeName: 'BYBIT',
      getPosition: jest.fn(),
      placeReduceOnlyOrder: jest.fn(),
      closePosition: jest.fn(),
      placeMarketOrder: jest.fn(), // This should NEVER be called
    };

    // Create test strategy
    strategy = new TestCloseStrategy(mockConnector, mockConnector);
  });

  describe('CRITICAL: Never use placeMarketOrder fallback', () => {
    test('should NOT call placeMarketOrder when position is already closed', async () => {
      // Simulate position already closed (size = 0)
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: 0,
        positionAmt: 0,
      });

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      // Should detect position is already closed
      expect(result).toEqual({ success: true, message: 'Position already closed' });

      // CRITICAL: placeMarketOrder should NEVER be called
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();

      // Should not even attempt to place orders
      expect(mockConnector.placeReduceOnlyOrder).not.toHaveBeenCalled();
      expect(mockConnector.closePosition).not.toHaveBeenCalled();
    });

    test('should NOT call placeMarketOrder when reduceOnly fails with "position is zero"', async () => {
      // Position has some size initially
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: 1,
        positionAmt: 1,
      });

      // But reduceOnly fails because position was closed between check and execution
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('Bybit API Error: current position is zero, cannot fix reduce-only order qty')
      );

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      // Should recognize "position is zero" as success
      expect(result).toEqual({
        success: true,
        message: 'Position already closed',
        alreadyClosed: true,
      });

      // CRITICAL: placeMarketOrder should NEVER be called
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();

      // Should try reduceOnly first
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 1);
    });

    test('should NOT call placeMarketOrder even if both reduceOnly and closePosition fail', async () => {
      // Position exists
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: 1,
        positionAmt: 1,
      });

      // Both safe methods fail
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('Some API error'));
      mockConnector.closePosition.mockRejectedValue(new Error('Another API error'));

      // Should throw error instead of falling back to placeMarketOrder
      await expect(
        strategy.testForceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT')
      ).rejects.toThrow(/PLEASE MANUALLY CLOSE THIS POSITION/);

      // CRITICAL: placeMarketOrder should NEVER be called
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();

      // Should try both safe methods
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 1);
      expect(mockConnector.closePosition).toHaveBeenCalledWith('BTCUSDT');
    });
  });

  describe('Position size detection', () => {
    test('should detect zero position size from positionAmt field', async () => {
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        positionAmt: '0', // Bybit format
      });

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.message).toBe('Position already closed');
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should detect zero position size from size field', async () => {
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: '0', // BingX format
      });

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.message).toBe('Position already closed');
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should use actual position size instead of requested quantity', async () => {
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        positionAmt: '0.5', // Actual position is 0.5, not 1
      });

      mockConnector.placeReduceOnlyOrder.mockResolvedValue({
        orderId: '123',
      });

      await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1, // Request 1
        'BYBIT'
      );

      // Should use actual size (0.5) instead of requested (1)
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 0.5);
    });
  });

  describe('Error message detection', () => {
    test('should recognize "position is zero" error as success', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('current position is zero')
      );

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.alreadyClosed).toBe(true);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should recognize "position not found" error as success', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('position not found')
      );

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.alreadyClosed).toBe(true);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should recognize "no position" error as success', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('no position to close')
      );

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.alreadyClosed).toBe(true);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Safe methods priority', () => {
    test('should try placeReduceOnlyOrder first', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledTimes(1);
      expect(mockConnector.closePosition).not.toHaveBeenCalled();
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should fallback to closePosition if reduceOnly fails', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('Rate limit'));
      mockConnector.closePosition.mockResolvedValue({ success: true });

      await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledTimes(1);
      expect(mockConnector.closePosition).toHaveBeenCalledTimes(1);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should skip unsupported methods', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder = undefined; // Method not supported
      mockConnector.closePosition.mockResolvedValue({ success: true });

      await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(mockConnector.closePosition).toHaveBeenCalledTimes(1);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Regression tests for the original bug', () => {
    test('BUG FIX: Should NOT open new position when old position is already closed', async () => {
      // This is the EXACT scenario that caused the original bug:
      // 1. Position closes successfully
      // 2. Code tries to close it again
      // 3. reduceOnly fails with "position is zero"
      // 4. OLD BUG: Falls back to placeMarketOrder without reduceOnly
      // 5. Opens NEW position in opposite direction!

      mockConnector.getPosition.mockResolvedValue({
        positionAmt: '0', // Position already closed
      });

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'FLOCKUSDT',
        'Sell',
        9464,
        'BYBIT'
      );

      // Should recognize position is closed
      expect(result.message).toBe('Position already closed');

      // CRITICAL: Should NEVER call placeMarketOrder
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();

      // Should not attempt any orders at all
      expect(mockConnector.placeReduceOnlyOrder).not.toHaveBeenCalled();
      expect(mockConnector.closePosition).not.toHaveBeenCalled();
    });

    test('BUG FIX: Should handle race condition where position closes between check and execution', async () => {
      // Position exists during check
      mockConnector.getPosition.mockResolvedValue({
        positionAmt: '0.001', // Small position
      });

      // But closes before reduceOnly execution (race condition)
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('Bybit API Error: current position is zero, cannot fix reduce-only order qty')
      );

      const result = await strategy.testForceClosePosition(
        mockConnector,
        'FLOCKUSDT',
        'Sell',
        0.001,
        'BYBIT'
      );

      // Should handle gracefully
      expect(result.alreadyClosed).toBe(true);

      // CRITICAL: Should NEVER attempt placeMarketOrder
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    test('should provide clear error message when all safe methods fail', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: 1 });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('API Error 1'));
      mockConnector.closePosition.mockRejectedValue(new Error('API Error 2'));

      await expect(
        strategy.testForceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT')
      ).rejects.toThrow(/PLEASE MANUALLY CLOSE THIS POSITION/);

      await expect(
        strategy.testForceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT')
      ).rejects.toThrow(/Do NOT attempt automated close/);
    });

    test('should handle getPosition errors gracefully', async () => {
      // Can't fetch position size
      mockConnector.getPosition.mockRejectedValue(new Error('API timeout'));

      // Should still try to close using requested quantity
      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      await strategy.testForceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      // Should still work, using requested quantity as fallback
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 1);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });
});
