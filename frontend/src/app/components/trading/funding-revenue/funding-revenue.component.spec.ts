import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FundingRevenueComponent } from './funding-revenue.component';
import { FundingArbitrageService, FundingArbitrageRevenueResponse } from '../../../services/funding-arbitrage.service';
import { TranslationService } from '../../../services/translation.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FundingRevenueComponent', () => {
  let component: FundingRevenueComponent;
  let fixture: ComponentFixture<FundingRevenueComponent>;
  let fundingArbitrageService: jasmine.SpyObj<FundingArbitrageService>;
  let translationService: jasmine.SpyObj<TranslationService>;

  const mockRevenueResponse: FundingArbitrageRevenueResponse = {
    success: true,
    data: {
      summary: {
        totalDeals: 10,
        totalRevenue: 1250.50,
        totalFundingEarned: 800.25,
        totalTradingPnl: 450.25,
        avgRevenuePerDeal: 125.05,
        winRate: 80,
        profitableDeals: 8,
        losingDeals: 2,
        bestDeal: {
          symbol: 'BTCUSDT',
          revenue: 250.00,
          date: '2025-10-01T12:00:00Z'
        },
        worstDeal: {
          symbol: 'ETHUSDT',
          revenue: -50.00,
          date: '2025-10-02T14:00:00Z'
        }
      },
      bySymbol: [
        {
          symbol: 'BTCUSDT',
          deals: 5,
          revenue: 750.00,
          avgRevenue: 150.00,
          fundingEarned: 500.00
        },
        {
          symbol: 'ETHUSDT',
          deals: 5,
          revenue: 500.50,
          avgRevenue: 100.10,
          fundingEarned: 300.25
        }
      ],
      byExchange: [
        {
          exchange: 'BYBIT',
          deals: 7,
          revenue: 900.00,
          avgRevenue: 128.57
        },
        {
          exchange: 'BINGX',
          deals: 3,
          revenue: 350.50,
          avgRevenue: 116.83
        }
      ],
      deals: [
        {
          id: '1',
          symbol: 'BTCUSDT',
          primaryExchange: 'BYBIT',
          hedgeExchange: 'BINGX',
          fundingRate: 0.001,
          positionType: 'long',
          quantity: 0.5,
          entryPrice: 45000,
          hedgeEntryPrice: 45010,
          primaryExitPrice: 45100,
          hedgeExitPrice: 45090,
          fundingEarned: 22.50,
          realizedPnl: 50.00,
          primaryTradingFees: 12.50,
          hedgeTradingFees: 12.50,
          executedAt: '2025-10-01T10:00:00Z',
          closedAt: '2025-10-01T18:00:00Z',
          duration: 28800
        }
      ],
      timeline: [
        {
          date: '2025-10-01',
          deals: 5,
          revenue: 625.00,
          fundingEarned: 400.00
        },
        {
          date: '2025-10-02',
          deals: 5,
          revenue: 625.50,
          fundingEarned: 400.25
        }
      ]
    },
    filters: {
      startDate: '2025-09-08',
      endDate: '2025-10-08',
      exchange: null,
      symbol: null
    },
    timestamp: '2025-10-08T12:00:00Z'
  };

  beforeEach(async () => {
    const fundingArbitrageServiceSpy = jasmine.createSpyObj('FundingArbitrageService', [
      'getRevenue',
      'refreshRevenue'
    ]);
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['translate']);

    await TestBed.configureTestingModule({
      imports: [FundingRevenueComponent, HttpClientTestingModule],
      providers: [
        { provide: FundingArbitrageService, useValue: fundingArbitrageServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
    }).compileComponents();

    fundingArbitrageService = TestBed.inject(FundingArbitrageService) as jasmine.SpyObj<FundingArbitrageService>;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
    translationService.translate.and.returnValue('Translated');

    fixture = TestBed.createComponent(FundingRevenueComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load revenue data on init', () => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));

      fixture.detectChanges(); // triggers ngOnInit

      expect(fundingArbitrageService.getRevenue).toHaveBeenCalled();
      expect(component.revenueData()).toEqual(mockRevenueResponse);
      expect(component.isLoading()).toBe(false);
    });

    it('should set default date range (30 days)', () => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const expectedStartDate = thirtyDaysAgo.toISOString().split('T')[0];

      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));
      fixture.detectChanges();

      expect(component.startDate()).toBe(expectedStartDate);
      expect(component.endDate()).toBe(today);
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to true while fetching data', () => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse).pipe());

      component.loadRevenue();

      expect(component.isLoading()).toBe(true);
    });

    it('should set isLoading to false after successful fetch', (done) => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));

      component.loadRevenue();

      setTimeout(() => {
        expect(component.isLoading()).toBe(false);
        done();
      }, 0);
    });

    it('should set isLoading to false after error', (done) => {
      const errorMessage = 'Failed to fetch data';
      fundingArbitrageService.getRevenue.and.returnValue(throwError(() => new Error(errorMessage)));

      component.loadRevenue();

      setTimeout(() => {
        expect(component.isLoading()).toBe(false);
        expect(component.error()).toBe(errorMessage);
        done();
      }, 0);
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));
      fixture.detectChanges();
    });

    it('should compute summary from revenue data', () => {
      expect(component.summary()).toEqual(mockRevenueResponse.data.summary);
    });

    it('should compute bySymbol from revenue data', () => {
      expect(component.bySymbol()).toEqual(mockRevenueResponse.data.bySymbol);
    });

    it('should compute byExchange from revenue data', () => {
      expect(component.byExchange()).toEqual(mockRevenueResponse.data.byExchange);
    });

    it('should compute deals from revenue data', () => {
      expect(component.deals()).toEqual(mockRevenueResponse.data.deals);
    });

    it('should compute totalFees from deals', () => {
      const expectedFees = 25.00; // 12.50 + 12.50
      expect(component.totalFees()).toBe(expectedFees);
    });

    it('should compute netProfit correctly', () => {
      const expectedNetProfit = mockRevenueResponse.data.summary.totalRevenue - 25.00;
      expect(component.netProfit()).toBe(expectedNetProfit);
    });

    it('should compute available exchanges', () => {
      const exchanges = component.availableExchanges();
      expect(exchanges).toContain('BYBIT');
      expect(exchanges).toContain('BINGX');
      expect(exchanges.length).toBe(2);
    });

    it('should compute available symbols', () => {
      const symbols = component.availableSymbols();
      expect(symbols).toContain('BTCUSDT');
      expect(symbols).toContain('ETHUSDT');
      expect(symbols.length).toBe(2);
    });
  });

  describe('Filter Operations', () => {
    beforeEach(() => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));
      fixture.detectChanges();
    });

    it('should apply filters and reload data', () => {
      component.selectedExchange.set('BYBIT');
      component.selectedSymbol.set('BTCUSDT');
      component.applyFilters();

      expect(fundingArbitrageService.getRevenue).toHaveBeenCalledWith(
        component.startDate(),
        component.endDate(),
        'BYBIT',
        'BTCUSDT'
      );
    });

    it('should clear filters and reload with defaults', () => {
      component.selectedExchange.set('BYBIT');
      component.selectedSymbol.set('BTCUSDT');
      component.clearFilters();

      expect(component.selectedExchange()).toBe('');
      expect(component.selectedSymbol()).toBe('');
      expect(fundingArbitrageService.getRevenue).toHaveBeenCalled();
    });

    it('should toggle filters panel visibility', () => {
      const initialState = component.showFilters();
      component.toggleFilters();
      expect(component.showFilters()).toBe(!initialState);
    });
  });

  describe('Deal Expansion', () => {
    beforeEach(() => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));
      fixture.detectChanges();
    });

    it('should expand deal when toggled', () => {
      const dealId = '1';
      component.toggleDealExpansion(dealId);
      expect(component.expandedDealId()).toBe(dealId);
    });

    it('should collapse deal when toggled again', () => {
      const dealId = '1';
      component.toggleDealExpansion(dealId);
      expect(component.expandedDealId()).toBe(dealId);
      component.toggleDealExpansion(dealId);
      expect(component.expandedDealId()).toBeNull();
    });

    it('should check if deal is expanded', () => {
      const dealId = '1';
      component.toggleDealExpansion(dealId);
      expect(component.isDealExpanded(dealId)).toBe(true);
      expect(component.isDealExpanded('2')).toBe(false);
    });
  });

  describe('Formatting Functions', () => {
    it('should format currency correctly', () => {
      expect(component.formatCurrency(1234.5678)).toBe('$1,234.5678');
      expect(component.formatCurrency(0.12)).toBe('$0.12');
    });

    it('should format percentage correctly', () => {
      expect(component.formatPercent(85.5)).toBe('85.50%');
      expect(component.formatPercent(50)).toBe('50.00%');
    });

    it('should format date correctly', () => {
      const formattedDate = component.formatDate('2025-10-01T12:00:00Z');
      expect(formattedDate).toContain('Oct');
      expect(formattedDate).toContain('2025');
    });

    it('should handle null date', () => {
      expect(component.formatDate(null)).toBe('N/A');
    });

    it('should format duration correctly', () => {
      expect(component.formatDuration(3661)).toBe('1h 1m'); // 1 hour, 1 minute, 1 second
      expect(component.formatDuration(65)).toBe('1m 5s'); // 1 minute, 5 seconds
      expect(component.formatDuration(30)).toBe('30s'); // 30 seconds
      expect(component.formatDuration(null)).toBe('N/A');
    });

    it('should format numbers with thousands separator', () => {
      expect(component.formatNumber(1234567, 2)).toBe('1,234,567.00');
      expect(component.formatNumber(123, 0)).toBe('123');
    });
  });

  describe('CSS Class Helpers', () => {
    it('should return correct class for positive values', () => {
      expect(component.getValueClass(100)).toBe('positive');
    });

    it('should return correct class for negative values', () => {
      expect(component.getValueClass(-100)).toBe('negative');
    });

    it('should return correct class for zero values', () => {
      expect(component.getValueClass(0)).toBe('neutral');
    });

    it('should return correct win rate class', () => {
      expect(component.getWinRateClass(80)).toBe('excellent');
      expect(component.getWinRateClass(60)).toBe('good');
      expect(component.getWinRateClass(40)).toBe('average');
      expect(component.getWinRateClass(20)).toBe('poor');
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading revenue', (done) => {
      const errorMessage = 'Network error';
      fundingArbitrageService.getRevenue.and.returnValue(throwError(() => new Error(errorMessage)));

      component.loadRevenue();

      setTimeout(() => {
        expect(component.error()).toBe(errorMessage);
        expect(component.isLoading()).toBe(false);
        done();
      }, 0);
    });

    it('should clear error on successful reload', (done) => {
      // First, set an error
      fundingArbitrageService.getRevenue.and.returnValue(throwError(() => new Error('Error')));
      component.loadRevenue();

      setTimeout(() => {
        expect(component.error()).toBeTruthy();

        // Now load successfully
        fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));
        component.loadRevenue();

        setTimeout(() => {
          expect(component.error()).toBeNull();
          done();
        }, 0);
      }, 0);
    });
  });

  describe('Refresh Operation', () => {
    it('should refresh revenue data', () => {
      fundingArbitrageService.getRevenue.and.returnValue(of(mockRevenueResponse));
      fixture.detectChanges();

      component.refreshRevenue();

      expect(fundingArbitrageService.getRevenue).toHaveBeenCalledTimes(2); // once on init, once on refresh
    });
  });
});
