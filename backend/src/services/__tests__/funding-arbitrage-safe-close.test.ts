/**
 * Critical Safety Tests for Funding Arbitrage Service - Position Closing
 *
 * These tests verify that the funding arbitrage service NEVER opens new positions
 * when attempting to close existing ones.
 *
 * Bug History: The forceClosePosition method previously had a dangerous fallback
 * to regular placeMarketOrder without reduceOnly flag, which could open new positions
 * in the opposite direction when the original position was already closed.
 */

import { FundingArbitrageService } from '../funding-arbitrage.service';
import { BaseExchangeConnector, OrderSide } from '../../connectors/base-exchange.connector';

describe('Funding Arbitrage Service - Critical Position Close Safety', () => {
  let service: FundingArbitrageService;
  let mockConnector: any;

  beforeEach(() => {
    // Create fresh service instance
    service = new FundingArbitrageService();

    // Create mock connector
    mockConnector = {
      exchangeName: 'BYBIT',
      getPosition: jest.fn(),
      placeReduceOnlyOrder: jest.fn(),
      closePosition: jest.fn(),
      placeMarketOrder: jest.fn(), // This should NEVER be called during position close
    };
  });

  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('CRITICAL: Never open new positions when closing', () => {
    test('should NOT call placeMarketOrder when position is already closed (size=0)', async () => {
      // Position is already closed
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        positionAmt: '0',
        size: '0',
      });

      // Access private method for testing via any cast
      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      // Should recognize position is closed
      expect(result).toEqual({ success: true, message: 'Position already closed' });

      // CRITICAL: placeMarketOrder must NEVER be called
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();

      // Should not attempt to place any orders
      expect(mockConnector.placeReduceOnlyOrder).not.toHaveBeenCalled();
      expect(mockConnector.closePosition).not.toHaveBeenCalled();
    });

    test('should handle "position is zero" error from Bybit without opening new position', async () => {
      // Position exists initially
      mockConnector.getPosition.mockResolvedValue({
        positionAmt: '0.5',
      });

      // But reduceOnly fails because position closed between check and execution
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('Bybit API Error: current position is zero, cannot fix reduce-only order qty')
      );

      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        0.5,
        'BYBIT'
      );

      // Should recognize this as "already closed"
      expect(result.alreadyClosed).toBe(true);
      expect(result.success).toBe(true);

      // CRITICAL: placeMarketOrder must NEVER be called
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should throw error instead of using placeMarketOrder fallback', async () => {
      mockConnector.getPosition.mockResolvedValue({
        positionAmt: '1',
      });

      // Both safe methods fail
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('API Error'));
      mockConnector.closePosition.mockRejectedValue(new Error('API Error'));

      const serviceAny = service as any;

      // Should throw error asking for manual intervention
      await expect(
        serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT')
      ).rejects.toThrow(/PLEASE MANUALLY CLOSE THIS POSITION/);

      // CRITICAL: placeMarketOrder must NEVER be called
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Position size validation', () => {
    test('should use actual position size from positionAmt field', async () => {
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        positionAmt: '0.8', // Actual size
      });

      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      const serviceAny = service as any;
      await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1, // Requested size (different from actual)
        'BYBIT'
      );

      // Should use actual size (0.8) instead of requested (1)
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 0.8);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should use actual position size from size field', async () => {
      mockConnector.getPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: '0.3', // BingX format
      });

      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      const serviceAny = service as any;
      await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BINGX'
      );

      // Should use actual size (0.3)
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 0.3);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should handle negative position sizes (SHORT positions)', async () => {
      mockConnector.getPosition.mockResolvedValue({
        positionAmt: '-1.5', // SHORT position
      });

      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      const serviceAny = service as any;
      await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Buy', // Close SHORT with BUY
        1.5,
        'BYBIT'
      );

      // Should use absolute value
      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Buy', 1.5);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Safe method fallback chain', () => {
    test('should try placeReduceOnlyOrder as first choice', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      const serviceAny = service as any;
      await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT');

      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledTimes(1);
      expect(mockConnector.closePosition).not.toHaveBeenCalled();
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should fallback to closePosition API if reduceOnly fails', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('Rate limit'));
      mockConnector.closePosition.mockResolvedValue({ success: true });

      const serviceAny = service as any;
      await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT');

      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledTimes(1);
      expect(mockConnector.closePosition).toHaveBeenCalledTimes(1);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should skip unavailable methods', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder = undefined; // Not supported
      mockConnector.closePosition.mockResolvedValue({ success: true });

      const serviceAny = service as any;
      await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT');

      expect(mockConnector.closePosition).toHaveBeenCalledTimes(1);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Error message recognition', () => {
    test('should recognize "position is zero" as success', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('position is zero')
      );

      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.alreadyClosed).toBe(true);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should recognize "position not found" as success', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('position not found')
      );

      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
        mockConnector,
        'BTCUSDT',
        'Sell',
        1,
        'BYBIT'
      );

      expect(result.alreadyClosed).toBe(true);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should recognize "no position" as success', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('no position')
      );

      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
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

  describe('Regression test: The exact bug scenario', () => {
    test('BUG FIX: Real scenario from logs - FLOCKUSDT position', async () => {
      // This replicates the EXACT bug from production logs:
      // [Strategy] Attempting reduce-only order on BYBIT...
      // [BybitConnector] Placing reduce-only market Sell order: { symbol: 'FLOCKUSDT', quantity: 4751 }
      // Error: Bybit API Error: current position is zero, cannot fix reduce-only order qty
      // [Strategy] Attempting regular market order on BYBIT... <- OLD BUG!
      // [Strategy] ✓ BYBIT closed using regular market order <- OPENED NEW POSITION!

      mockConnector.getPosition.mockResolvedValue({
        symbol: 'FLOCKUSDT',
        positionAmt: '0', // Position already closed
        size: '0',
      });

      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
        mockConnector,
        'FLOCKUSDT',
        'Sell',
        4751.496721467262,
        'BYBIT'
      );

      // Should detect position is closed
      expect(result.message).toBe('Position already closed');

      // CRITICAL BUG FIX: Should NEVER call placeMarketOrder
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();

      // Should not attempt any orders since position is zero
      expect(mockConnector.placeReduceOnlyOrder).not.toHaveBeenCalled();
    });

    test('BUG FIX: Race condition where position closes during execution', async () => {
      // Position exists during getPosition check
      mockConnector.getPosition.mockResolvedValue({
        positionAmt: '9464',
      });

      // But by the time reduceOnly executes, position is closed (race condition)
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(
        new Error('Bybit API Error: current position is zero, cannot fix reduce-only order qty')
      );

      const serviceAny = service as any;
      const result = await serviceAny.forceClosePosition(
        mockConnector,
        'FLOCKUSDT',
        'Sell',
        9464,
        'BYBIT'
      );

      // Should handle gracefully as "already closed"
      expect(result.alreadyClosed).toBe(true);

      // CRITICAL: Should NOT fall back to placeMarketOrder
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('BUG FIX: Multiple rapid close attempts should not open new positions', async () => {
      // Simulate multiple close attempts in rapid succession (could happen in error recovery)
      const serviceAny = service as any;

      // First attempt - position exists and closes successfully
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '0.1' });
      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 0.1, 'BYBIT');

      // Reset mocks for second attempt
      jest.clearAllMocks();

      // Second attempt - position is already closed (size=0)
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '0' });

      const result2 = await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 0.1, 'BYBIT');
      expect(result2.message).toBe('Position already closed');

      // Reset mocks for third attempt
      jest.clearAllMocks();

      // Third attempt - position still closed, but detected differently (via error)
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '0' });

      const result3 = await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 0.1, 'BYBIT');
      expect(result3.message).toBe('Position already closed');

      // CRITICAL: placeMarketOrder should NEVER be called in any attempt
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Error handling and user messaging', () => {
    test('should provide actionable error message when manual intervention needed', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '1' });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('API Error 1'));
      mockConnector.closePosition.mockRejectedValue(new Error('API Error 2'));

      const serviceAny = service as any;

      await expect(
        serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT')
      ).rejects.toThrow(/PLEASE MANUALLY CLOSE THIS POSITION ON THE EXCHANGE IMMEDIATELY/);

      await expect(
        serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT')
      ).rejects.toThrow(/Do NOT attempt automated close/);

      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });

    test('should include position details in error message', async () => {
      mockConnector.getPosition.mockResolvedValue({ positionAmt: '2.5' });
      mockConnector.placeReduceOnlyOrder.mockRejectedValue(new Error('API Error'));
      mockConnector.closePosition.mockRejectedValue(new Error('API Error'));

      const serviceAny = service as any;

      await expect(
        serviceAny.forceClosePosition(mockConnector, 'ETHUSDT', 'Buy', 2.5, 'BYBIT')
      ).rejects.toThrow(/Symbol=ETHUSDT/);

      await expect(
        serviceAny.forceClosePosition(mockConnector, 'ETHUSDT', 'Buy', 2.5, 'BYBIT')
      ).rejects.toThrow(/Side=Buy/);

      await expect(
        serviceAny.forceClosePosition(mockConnector, 'ETHUSDT', 'Buy', 2.5, 'BYBIT')
      ).rejects.toThrow(/Quantity=2.5/);
    });

    test('should handle getPosition errors gracefully', async () => {
      mockConnector.getPosition.mockRejectedValue(new Error('Network timeout'));
      mockConnector.placeReduceOnlyOrder.mockResolvedValue({ orderId: '123' });

      const serviceAny = service as any;

      // Should still attempt close with requested quantity
      await serviceAny.forceClosePosition(mockConnector, 'BTCUSDT', 'Sell', 1, 'BYBIT');

      expect(mockConnector.placeReduceOnlyOrder).toHaveBeenCalledWith('BTCUSDT', 'Sell', 1);
      expect(mockConnector.placeMarketOrder).not.toHaveBeenCalled();
    });
  });
});
