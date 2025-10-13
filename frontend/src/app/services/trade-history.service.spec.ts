import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TradeHistoryService } from './trade-history.service';
import {
  TradeHistoryRecord,
  TradeHistoryResponse,
  TradeHistoryQueryParams
} from '../models/trade-history.model';
import { buildApiUrl } from '../config/app.config';

describe('TradeHistoryService', () => {
  let service: TradeHistoryService;
  let httpMock: HttpTestingController;

  const mockTradeRecord: TradeHistoryRecord = {
    id: 'trade-1',
    symbol: 'BTCUSDT',
    exchange: 'bybit',
    executedAt: '2025-10-01T10:00:00Z',
    closedAt: '2025-10-01T12:00:00Z',
    positionSizeUsdt: 1000,
    fundingEarned: 5.5,
    realizedPnl: 25.75,
    entryPrice: 50000,
    exitPrice: 50500,
    leverage: 5,
    quantity: 0.1,
    status: 'CLOSED',
    positionType: 'long',
    entryFee: 0.5,
    exitFee: 0.5,
    duration: 7200,
    roi: 2.5
  };

  const mockTradeResponse: TradeHistoryResponse = {
    success: true,
    data: [mockTradeRecord],
    count: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TradeHistoryService]
    });
    service = TestBed.inject(TradeHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTradeHistory', () => {
    it('should fetch trade history successfully', (done) => {
      service.getTradeHistory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
        expect(response.data[0].symbol).toBe('BTCUSDT');
        expect(service.trades().length).toBe(1);
        expect(service.totalCount()).toBe(1);
        expect(service.isLoading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      expect(req.request.method).toBe('GET');
      req.flush(mockTradeResponse);
    });

    it('should set loading state correctly during request', () => {
      expect(service.isLoading()).toBe(false);

      service.getTradeHistory().subscribe();

      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush(mockTradeResponse);

      // After response, loading should be false
      expect(service.isLoading()).toBe(false);
    });

    it('should build URL with query parameters correctly', (done) => {
      const params: TradeHistoryQueryParams = {
        symbol: 'BTCUSDT',
        exchange: 'bybit',
        limit: 50,
        status: 'CLOSED'
      };

      service.getTradeHistory(params).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('/trading/history') &&
        req.url.includes('symbol=BTCUSDT') &&
        req.url.includes('exchange=bybit') &&
        req.url.includes('limit=50') &&
        req.url.includes('status=CLOSED')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTradeResponse);
    });

    it('should handle HTTP errors gracefully', (done) => {
      service.getTradeHistory().subscribe({
        error: (error) => {
          expect(error.message).toContain('Server error');
          expect(service.error()).toContain('Server error');
          expect(service.isLoading()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should handle 401 unauthorized error', (done) => {
      service.getTradeHistory().subscribe({
        error: (error) => {
          expect(error.message).toContain('Unauthorized');
          done();
        }
      });

      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 forbidden error', (done) => {
      service.getTradeHistory().subscribe({
        error: (error) => {
          expect(error.message).toContain('forbidden');
          done();
        }
      });

      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle network errors', (done) => {
      service.getTradeHistory().subscribe({
        error: (error) => {
          expect(error.message).toContain('Unable to connect');
          done();
        }
      });

      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.error(new ProgressEvent('error'), { status: 0 });
    });
  });

  describe('getTradeHistoryBySymbol', () => {
    it('should fetch trades for specific symbol and exchange', (done) => {
      service.getTradeHistoryBySymbol('BTCUSDT', 'bybit', 100).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('symbol=BTCUSDT') &&
        req.url.includes('exchange=bybit') &&
        req.url.includes('limit=100')
      );
      req.flush(mockTradeResponse);
    });
  });

  describe('getTradeHistoryByExchange', () => {
    it('should fetch trades for specific exchange', (done) => {
      service.getTradeHistoryByExchange('bybit', 50).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('exchange=bybit') &&
        req.url.includes('limit=50')
      );
      req.flush(mockTradeResponse);
    });
  });

  describe('getClosedTrades', () => {
    it('should fetch only closed trades', (done) => {
      service.getClosedTrades(25).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('status=CLOSED') &&
        req.url.includes('limit=25')
      );
      req.flush(mockTradeResponse);
    });
  });

  describe('getOpenTrades', () => {
    it('should fetch only open trades', (done) => {
      service.getOpenTrades(10).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('status=OPEN') &&
        req.url.includes('limit=10')
      );
      req.flush(mockTradeResponse);
    });
  });

  describe('getTradeHistoryByDateRange', () => {
    it('should fetch trades within date range', (done) => {
      const startDate = '2025-10-01T00:00:00Z';
      const endDate = '2025-10-31T23:59:59Z';

      service.getTradeHistoryByDateRange(startDate, endDate, 100).subscribe(() => done());

      const req = httpMock.expectOne(req =>
        req.url.includes('startDate=' + encodeURIComponent(startDate)) &&
        req.url.includes('endDate=' + encodeURIComponent(endDate))
      );
      req.flush(mockTradeResponse);
    });
  });

  describe('State Management', () => {
    it('should clear trade history', () => {
      // First load some data
      service.getTradeHistory().subscribe();
      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush(mockTradeResponse);

      expect(service.trades().length).toBe(1);

      // Clear data
      service.clearTradeHistory();

      expect(service.trades().length).toBe(0);
      expect(service.totalCount()).toBe(0);
      expect(service.error()).toBeNull();
    });

    it('should clear error state', () => {
      // Trigger an error
      service.getTradeHistory().subscribe({ error: () => {} });
      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Error' });

      expect(service.error()).not.toBeNull();

      // Clear error
      service.clearError();

      expect(service.error()).toBeNull();
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      const response: TradeHistoryResponse = {
        success: true,
        data: [
          { ...mockTradeRecord, status: 'OPEN', id: 'trade-1' },
          { ...mockTradeRecord, status: 'CLOSED', id: 'trade-2' },
          { ...mockTradeRecord, status: 'CLOSED', id: 'trade-3' }
        ],
        count: 3
      };

      service.getTradeHistory().subscribe();
      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush(response);
    });

    it('should compute hasTrades correctly', () => {
      expect(service.hasTrades()).toBe(true);
    });

    it('should filter open trades', () => {
      expect(service.openTrades().length).toBe(1);
      expect(service.openTrades()[0].status).toBe('OPEN');
    });

    it('should filter closed trades', () => {
      expect(service.closedTrades().length).toBe(2);
      expect(service.closedTrades().every(t => t.status === 'CLOSED')).toBe(true);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate statistics correctly', () => {
      const trades: TradeHistoryRecord[] = [
        { ...mockTradeRecord, realizedPnl: 50, fundingEarned: 5, status: 'CLOSED', entryFee: 1, exitFee: 1 },
        { ...mockTradeRecord, realizedPnl: -20, fundingEarned: 3, status: 'CLOSED', entryFee: 1, exitFee: 1 },
        { ...mockTradeRecord, realizedPnl: 30, fundingEarned: 4, status: 'CLOSED', entryFee: 1, exitFee: 1 }
      ];

      const stats = service.calculateStatistics(trades);

      expect(stats.totalTrades).toBe(3);
      expect(stats.profitableTrades).toBe(2);
      expect(stats.losingTrades).toBe(1);
      expect(stats.winRate).toBeCloseTo(66.67, 1);
      expect(stats.totalPnl).toBe(60);
      expect(stats.totalFunding).toBe(12);
      expect(stats.largestWin).toBe(50);
      expect(stats.largestLoss).toBe(-20);
      expect(stats.totalFees).toBe(6);
      expect(stats.netProfit).toBe(54);
    });

    it('should return empty statistics for empty array', () => {
      const stats = service.calculateStatistics([]);

      expect(stats.totalTrades).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.totalPnl).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    it('should format duration correctly', () => {
      expect(service.formatDuration(7200)).toBe('2h 0m');
      expect(service.formatDuration(3665)).toBe('1h 1m');
      expect(service.formatDuration(90)).toBe('1m 30s');
      expect(service.formatDuration(45)).toBe('45s');
    });

    it('should format PnL correctly', () => {
      const positivePnl = service.formatPnl(25.5);
      expect(positivePnl.value).toBe('+25.50');
      expect(positivePnl.color).toBe('green');
      expect(positivePnl.isPositive).toBe(true);

      const negativePnl = service.formatPnl(-15.25);
      expect(negativePnl.value).toBe('-15.25');
      expect(negativePnl.color).toBe('red');
      expect(negativePnl.isPositive).toBe(false);

      const zeroPnl = service.formatPnl(0);
      expect(zeroPnl.value).toBe('+0.00');
      expect(zeroPnl.isPositive).toBe(true);
    });

    it('should get trade count', () => {
      service.getTradeHistory().subscribe();
      const req = httpMock.expectOne(buildApiUrl('/trading/history'));
      req.flush(mockTradeResponse);

      expect(service.getTradeCount()).toBe(1);
    });

    it('should check loading state', () => {
      expect(service.isCurrentlyLoading()).toBe(false);
    });
  });
});
