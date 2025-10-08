import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { TradingPlatformInfoModalComponent } from './trading-platform-info-modal.component';
import { BybitUserService, BybitUserInfo } from '../../services/bybit-user.service';
import {
  ExchangeCredential,
  ExchangeType,
  EnvironmentType
} from '../../models/exchange-credentials.model';

describe('TradingPlatformInfoModalComponent', () => {
  let component: TradingPlatformInfoModalComponent;
  let fixture: ComponentFixture<TradingPlatformInfoModalComponent>;
  let mockBybitUserService: jasmine.SpyObj<BybitUserService>;
  let userInfoSubject: BehaviorSubject<BybitUserInfo | null>;
  let errorSubject: BehaviorSubject<string | null>;

  const mockCredential: ExchangeCredential = {
    id: 'test-cred-1',
    userId: 'user-123',
    exchange: ExchangeType.BYBIT,
    environment: EnvironmentType.TESTNET,
    apiKeyPreview: 'test***1234',
    label: 'Test Account',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockUserInfo: BybitUserInfo = {
    success: true,
    timestamp: '2024-01-01T00:00:00Z',
    testnet: true,
    data: {
      accountInfo: {
        totalEquity: '10000.00',
        totalWalletBalance: '9500.00',
        totalMarginBalance: '9000.00',
        totalAvailableBalance: '8500.00',
        totalPerpUPL: '500.00',
        totalInitialMargin: '1000.00',
        totalMaintenanceMargin: '500.00',
        coin: [
          {
            coin: 'USDT',
            equity: '10000.00',
            usdValue: '10000.00',
            walletBalance: '9500.00',
            availableToWithdraw: '8500.00',
            availableToBorrow: '0.00',
            borrowAmount: '0.00',
            accruedInterest: '0.00',
            totalOrderIM: '500.00',
            totalPositionIM: '500.00',
            totalPositionMM: '250.00',
            unrealisedPnl: '500.00',
            cumRealisedPnl: '1000.00'
          }
        ]
      },
      walletBalance: {
        list: [
          {
            accountType: 'UNIFIED',
            accountIMRate: '0.01',
            accountMMRate: '0.005',
            totalEquity: '10000.00',
            totalWalletBalance: '9500.00',
            totalMarginBalance: '9000.00',
            totalAvailableBalance: '8500.00',
            totalPerpUPL: '500.00',
            totalInitialMargin: '1000.00',
            totalMaintenanceMargin: '500.00',
            accountLTV: '0.1',
            coin: []
          }
        ]
      },
      positions: [
        {
          symbol: 'BTCUSDT',
          side: 'Buy',
          size: '0.1',
          positionValue: '5000.00',
          entryPrice: '50000.00',
          markPrice: '51000.00',
          liqPrice: '45000.00',
          bustPrice: '44000.00',
          positionMM: '250.00',
          positionIM: '500.00',
          tpslMode: 'Full',
          takeProfit: '55000.00',
          stopLoss: '48000.00',
          trailingStop: '0.00',
          unrealisedPnl: '100.00',
          cumRealisedPnl: '200.00',
          createdTime: '2024-01-01T00:00:00Z',
          updatedTime: '2024-01-01T00:00:00Z',
          leverage: '10'
        }
      ],
      positionsCount: 1,
      activeOrders: [
        {
          orderId: 'order-1',
          orderLinkId: 'link-1',
          symbol: 'ETHUSDT',
          side: 'Buy',
          orderType: 'Limit',
          qty: '1.0',
          price: '3000.00',
          orderStatus: 'New',
          timeInForce: 'GTC',
          createdTime: '2024-01-01T00:00:00Z',
          updatedTime: '2024-01-01T00:00:00Z',
          avgPrice: '0.00',
          cumExecQty: '0.00',
          cumExecValue: '0.00',
          cumExecFee: '0.00'
        }
      ],
      activeOrdersCount: 1,
      orderHistory: [],
      marketReference: null
    }
  };

  beforeEach(async () => {
    userInfoSubject = new BehaviorSubject<BybitUserInfo | null>(null);
    errorSubject = new BehaviorSubject<string | null>(null);

    mockBybitUserService = jasmine.createSpyObj('BybitUserService', [
      'getUserInfo',
      'calculateUnrealizedPnl',
      'getNonZeroBalances',
      'getActivePositions'
    ], {
      userInfo$: userInfoSubject.asObservable(),
      error$: errorSubject.asObservable()
    });

    mockBybitUserService.getUserInfo.and.returnValue(of(mockUserInfo));
    mockBybitUserService.calculateUnrealizedPnl.and.returnValue(500);
    mockBybitUserService.getNonZeroBalances.and.returnValue(
      'coin' in mockUserInfo.data.accountInfo ? mockUserInfo.data.accountInfo.coin : []
    );
    mockBybitUserService.getActivePositions.and.returnValue(mockUserInfo.data.positions);

    await TestBed.configureTestingModule({
      imports: [TradingPlatformInfoModalComponent],
      providers: [
        { provide: BybitUserService, useValue: mockBybitUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TradingPlatformInfoModalComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default state', () => {
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.userInfo()).toBeNull();
      expect(component.activeTab()).toBe('overview');
    });

    it('should load user info on init', (done) => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();

      component.ngOnInit();

      setTimeout(() => {
        expect(mockBybitUserService.getUserInfo).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should add keyboard event listener on init', () => {
      spyOn(document, 'addEventListener');
      fixture.componentRef.setInput('credential', mockCredential);

      component.ngOnInit();

      expect(document.addEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    });

    it('should remove keyboard event listener on destroy', () => {
      spyOn(document, 'removeEventListener');
      fixture.componentRef.setInput('credential', mockCredential);

      component.ngOnInit();
      component.ngOnDestroy();

      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    });
  });

  describe('Computed Values', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should compute exchange name correctly', () => {
      expect(component.exchangeName()).toBe('Bybit');
    });

    it('should compute environment correctly', () => {
      expect(component.isTestnet()).toBe(true);
      expect(component.environmentName()).toBe('Testnet');
    });

    it('should compute total equity from user info', () => {
      component.userInfo.set(mockUserInfo);
      expect(component.totalEquity()).toBe('10000.00');
    });

    it('should return 0.00 for total equity when no user info', () => {
      component.userInfo.set(null);
      expect(component.totalEquity()).toBe('0.00');
    });

    it('should compute available balance from user info', () => {
      component.userInfo.set(mockUserInfo);
      expect(component.availableBalance()).toBe('8500.00');
    });

    it('should compute wallet balance from user info', () => {
      component.userInfo.set(mockUserInfo);
      expect(component.walletBalance()).toBe('9500.00');
    });

    it('should compute unrealized PnL', () => {
      component.userInfo.set(mockUserInfo);
      expect(component.unrealizedPnl()).toBe(500);
      expect(mockBybitUserService.calculateUnrealizedPnl).toHaveBeenCalledWith(mockUserInfo);
    });

    it('should compute non-zero balances', () => {
      component.userInfo.set(mockUserInfo);
      const balances = component.nonZeroBalances();
      expect(balances.length).toBe(1);
      expect(balances[0].coin).toBe('USDT');
    });

    it('should compute active positions', () => {
      component.userInfo.set(mockUserInfo);
      const positions = component.activePositions();
      expect(positions.length).toBe(1);
      expect(positions[0].symbol).toBe('BTCUSDT');
    });

    it('should compute active orders', () => {
      component.userInfo.set(mockUserInfo);
      const orders = component.activeOrders();
      expect(orders.length).toBe(1);
      expect(orders[0].symbol).toBe('ETHUSDT');
    });

    it('should detect error in account info', () => {
      const errorInfo = {
        ...mockUserInfo,
        data: {
          ...mockUserInfo.data,
          accountInfo: { error: 'Test error' }
        }
      };
      component.userInfo.set(errorInfo as any);
      expect(component.hasError()).toBe(true);
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should set loading state when loading user info', (done) => {
      component.loadUserInfo();
      expect(component.loading()).toBe(true);

      setTimeout(() => {
        userInfoSubject.next(mockUserInfo);
        setTimeout(() => {
          expect(component.loading()).toBe(false);
          done();
        }, 10);
      }, 10);
    });

    it('should handle successful data fetch', (done) => {
      component.loadUserInfo();

      setTimeout(() => {
        userInfoSubject.next(mockUserInfo);
        setTimeout(() => {
          expect(component.userInfo()).toEqual(mockUserInfo);
          expect(component.error()).toBeNull();
          done();
        }, 10);
      }, 10);
    });

    it('should handle error during data fetch', (done) => {
      mockBybitUserService.getUserInfo.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      component.loadUserInfo();

      setTimeout(() => {
        expect(component.loading()).toBe(false);
        expect(component.error()).toBeTruthy();
        done();
      }, 100);
    });

    it('should show error for unsupported exchange', () => {
      const binanceCredential = { ...mockCredential, exchange: ExchangeType.BINANCE };
      fixture.componentRef.setInput('credential', binanceCredential);

      component.loadUserInfo();

      expect(component.error()).toBe('Only Bybit exchange is currently supported');
      expect(mockBybitUserService.getUserInfo).not.toHaveBeenCalled();
    });

    it('should refresh user info when requested', () => {
      component.refreshUserInfo();
      expect(mockBybitUserService.getUserInfo).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should change active tab', () => {
      component.setActiveTab('balances');
      expect(component.activeTab()).toBe('balances');

      component.setActiveTab('positions');
      expect(component.activeTab()).toBe('positions');
    });

    it('should have correct tab configuration', () => {
      expect(component.tabs.length).toBe(4);
      expect(component.tabs[0].id).toBe('overview');
      expect(component.tabs[1].id).toBe('balances');
      expect(component.tabs[2].id).toBe('positions');
      expect(component.tabs[3].id).toBe('orders');
    });
  });

  describe('Modal Interactions', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should emit close event when close is called', () => {
      spyOn(component.closeModal, 'emit');
      component.close();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should close modal on overlay click', () => {
      spyOn(component.closeModal, 'emit');
      component.handleOverlayClick();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should stop propagation on content click', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      component.handleContentClick(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should close modal on ESC key press', () => {
      spyOn(component, 'close');
      fixture.componentRef.setInput('credential', mockCredential);
      component.ngOnInit();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(component.close).toHaveBeenCalled();
    });

    it('should not close on other key presses', () => {
      spyOn(component, 'close');
      fixture.componentRef.setInput('credential', mockCredential);
      component.ngOnInit();

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(component.close).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should clear error when clearError is called', () => {
      component.error.set('Test error');
      component.clearError();
      expect(component.error()).toBeNull();
    });

    it('should retry loading and clear error', () => {
      component.error.set('Test error');
      spyOn(component, 'loadUserInfo');

      component.retryLoad();

      expect(component.error()).toBeNull();
      expect(component.loadUserInfo).toHaveBeenCalled();
    });
  });

  describe('Formatting Utilities', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should parse float values', () => {
      expect(component.parseFloat('123.45')).toBe(123.45);
      expect(component.parseFloat('0')).toBe(0);
    });

    it('should format large numbers with units', () => {
      expect(component.formatNumber(1234)).toBe('1.23K');
      expect(component.formatNumber(1234567)).toBe('1.23M');
      expect(component.formatNumber(1234567890)).toBe('1.23B');
      expect(component.formatNumber(123)).toBe('123.00');
    });

    it('should format currency with decimals', () => {
      expect(component.formatCurrency(123.456)).toBe('123.46');
      expect(component.formatCurrency('789.123', 4)).toBe('789.1230');
      expect(component.formatCurrency('invalid')).toBe('0.00');
    });

    it('should format percentage', () => {
      expect(component.formatPercentage(0.1234)).toBe('12.34%');
      expect(component.formatPercentage('0.05')).toBe('5.00%');
    });

    it('should get correct PnL color class', () => {
      expect(component.getPnlColorClass(100)).toBe('text-success');
      expect(component.getPnlColorClass(-100)).toBe('text-danger');
      expect(component.getPnlColorClass(0)).toBe('text-muted');
      expect(component.getPnlColorClass('invalid')).toBe('text-muted');
    });

    it('should get correct order status class', () => {
      expect(component.getOrderStatusClass('Filled')).toBe('badge-success');
      expect(component.getOrderStatusClass('Cancelled')).toBe('badge-secondary');
      expect(component.getOrderStatusClass('New')).toBe('badge-primary');
      expect(component.getOrderStatusClass('Unknown')).toBe('badge-secondary');
    });

    it('should get correct side class', () => {
      expect(component.getSideClass('Buy')).toBe('badge-success');
      expect(component.getSideClass('Sell')).toBe('badge-danger');
    });

    it('should calculate position profit percentage', () => {
      const position = mockUserInfo.data.positions[0];
      const pct = component.calculatePositionProfitPct(position);
      expect(pct).toBeCloseTo(2.0, 1); // (51000 - 50000) / 50000 * 100 = 2%
    });

    it('should calculate negative profit for sell positions', () => {
      const sellPosition = {
        ...mockUserInfo.data.positions[0],
        side: 'Sell' as const,
        entryPrice: '50000.00',
        markPrice: '51000.00'
      };
      const pct = component.calculatePositionProfitPct(sellPosition);
      expect(pct).toBeCloseTo(-2.0, 1);
    });

    it('should handle invalid position prices', () => {
      const invalidPosition = {
        ...mockUserInfo.data.positions[0],
        entryPrice: '0.00',
        markPrice: '51000.00'
      };
      expect(component.calculatePositionProfitPct(invalidPosition)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('credential', mockCredential);
      fixture.detectChanges();
    });

    it('should handle empty positions array', () => {
      const emptyInfo = {
        ...mockUserInfo,
        data: { ...mockUserInfo.data, positions: [] }
      };
      mockBybitUserService.getActivePositions.and.returnValue([]);
      component.userInfo.set(emptyInfo);
      expect(component.activePositions()).toEqual([]);
    });

    it('should handle empty orders array', () => {
      const emptyInfo = {
        ...mockUserInfo,
        data: { ...mockUserInfo.data, activeOrders: [] }
      };
      component.userInfo.set(emptyInfo);
      expect(component.activeOrders()).toEqual([]);
    });

    it('should handle missing account info', () => {
      component.userInfo.set(null);
      expect(component.accountInfo()).toBeNull();
    });

    it('should handle account info with error', () => {
      const errorInfo = {
        ...mockUserInfo,
        data: {
          ...mockUserInfo.data,
          accountInfo: { error: 'API Error' }
        }
      };
      component.userInfo.set(errorInfo as any);
      expect(component.accountInfo()).toBeNull();
    });
  });
});
