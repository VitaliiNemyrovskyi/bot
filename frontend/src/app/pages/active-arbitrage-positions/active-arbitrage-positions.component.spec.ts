import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ActiveArbitragePositionsComponent } from './active-arbitrage-positions.component';
import { PriceArbitrageService } from '../../services/price-arbitrage.service';
import { TranslationService } from '../../services/translation.service';
import {
  PriceArbitragePositionDTO,
  PriceArbitrageStatus
} from '../../models/price-arbitrage.model';

describe('ActiveArbitragePositionsComponent', () => {
  let component: ActiveArbitragePositionsComponent;
  let fixture: ComponentFixture<ActiveArbitragePositionsComponent>;
  let mockPriceArbitrageService: jasmine.SpyObj<PriceArbitrageService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  const mockPositions: PriceArbitragePositionDTO[] = [
    {
      id: '1',
      userId: 'user1',
      symbol: 'BTCUSDT',
      primaryExchange: 'BYBIT',
      hedgeExchange: 'BINGX',
      primaryLeverage: 10,
      primaryMargin: 1000,
      hedgeLeverage: 10,
      hedgeMargin: 1000,
      entryPrimaryPrice: 50000,
      entryHedgePrice: 49925,
      entrySpread: 75,
      entrySpreadPercent: 0.15,
      currentPrimaryPrice: 50050,
      currentHedgePrice: 49990,
      currentSpread: 60,
      currentSpreadPercent: 0.12,
      primaryFees: 10,
      hedgeFees: 10,
      status: PriceArbitrageStatus.ACTIVE,
      createdAt: new Date('2023-01-01T09:30:00Z').toISOString(),
      openedAt: new Date('2023-01-01T10:00:00Z').toISOString(),
      totalPnl: 150.50
    },
    {
      id: '2',
      userId: 'user1',
      symbol: 'ETHUSDT',
      primaryExchange: 'BINGX',
      hedgeExchange: 'BYBIT',
      primaryLeverage: 5,
      primaryMargin: 500,
      hedgeLeverage: 5,
      hedgeMargin: 500,
      entryPrimaryPrice: 3000,
      entryHedgePrice: 2994,
      entrySpread: 6,
      entrySpreadPercent: 0.20,
      exitPrimaryPrice: 2998,
      exitHedgePrice: 2992,
      exitSpread: 6,
      exitSpreadPercent: 0.20,
      primaryPnl: 40,
      hedgePnl: 35.25,
      totalPnl: 75.25,
      primaryFees: 5,
      hedgeFees: 5,
      status: PriceArbitrageStatus.COMPLETED,
      createdAt: new Date('2023-01-01T08:30:00Z').toISOString(),
      openedAt: new Date('2023-01-01T09:00:00Z').toISOString(),
      closedAt: new Date('2023-01-01T11:00:00Z').toISOString(),
      holdingTimeSeconds: 7200
    }
  ];

  beforeEach(async () => {
    const priceArbitrageServiceSpy = jasmine.createSpyObj('PriceArbitrageService', [
      'getPositions',
      'closePosition',
      'calculateUnrealizedPnl'
    ]);
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', [
      'translate'
    ]);

    await TestBed.configureTestingModule({
      imports: [ActiveArbitragePositionsComponent],
      providers: [
        { provide: PriceArbitrageService, useValue: priceArbitrageServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveArbitragePositionsComponent);
    component = fixture.componentInstance;
    mockPriceArbitrageService = TestBed.inject(PriceArbitrageService) as jasmine.SpyObj<PriceArbitrageService>;
    mockTranslationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;

    // Setup default mocks
    mockPriceArbitrageService.getPositions.and.returnValue(of(mockPositions));
    mockPriceArbitrageService.calculateUnrealizedPnl.and.returnValue(150.50);
    mockTranslationService.translate.and.returnValue('Mock Translation');
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load positions on init', () => {
      component.ngOnInit();
      
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledWith(PriceArbitrageStatus.ACTIVE);
      expect(component.positions()).toEqual(mockPositions);
      expect(component.isLoading()).toBe(false);
    });

    it('should start auto-refresh on init', fakeAsync(() => {
      component.ngOnInit();
      tick(5000);
      
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledTimes(2);
    }));

    it('should stop auto-refresh on destroy', () => {
      component.ngOnInit();
      spyOn(component['refreshSubscription']!, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(component['refreshSubscription']!.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Position Loading', () => {
    it('should set loading state while fetching positions', () => {
      component.loadPositions();
      
      expect(component.isLoading()).toBe(true);
      expect(component.error()).toBe(null);
    });

    it('should handle loading error', () => {
      const errorMessage = 'Failed to load positions';
      mockPriceArbitrageService.getPositions.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.loadPositions();
      
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBe(errorMessage);
      expect(component.positions()).toEqual([]);
    });

    it('should pass correct status filter to service', () => {
      component.selectedStatus.set(PriceArbitrageStatus.COMPLETED);
      
      component.loadPositions();
      
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledWith(PriceArbitrageStatus.COMPLETED);
    });

    it('should pass undefined when ALL filter is selected', () => {
      component.selectedStatus.set('ALL');
      
      component.loadPositions();
      
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Status Filtering', () => {
    beforeEach(() => {
      component.positions.set(mockPositions);
    });

    it('should filter positions by status', () => {
      component.selectedStatus.set(PriceArbitrageStatus.ACTIVE);
      
      const filtered = component.filteredPositions();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe(PriceArbitrageStatus.ACTIVE);
    });

    it('should show all positions when ALL filter is selected', () => {
      component.selectedStatus.set('ALL');
      
      const filtered = component.filteredPositions();
      
      expect(filtered.length).toBe(2);
    });

    it('should reload positions when filter changes', () => {
      spyOn(component, 'loadPositions');
      
      component.changeStatusFilter(PriceArbitrageStatus.COMPLETED);
      
      expect(component.selectedStatus()).toBe(PriceArbitrageStatus.COMPLETED);
      expect(component.loadPositions).toHaveBeenCalled();
    });
  });

  describe('Position Statistics', () => {
    beforeEach(() => {
      component.positions.set(mockPositions);
    });

    it('should calculate active count correctly', () => {
      expect(component.activeCount()).toBe(1);
    });

    it('should calculate completed count correctly', () => {
      expect(component.completedCount()).toBe(1);
    });

    it('should calculate error count correctly', () => {
      expect(component.errorCount()).toBe(0);
    });
  });

  describe('Position Closing', () => {
    const mockPosition = mockPositions[0];
    const mockCloseResult = {
      position: { ...mockPosition, status: PriceArbitrageStatus.COMPLETED },
      totalPnl: 150.50,
      primaryPnl: 75.25,
      hedgePnl: 75.25
    };

    beforeEach(() => {
      component.positions.set(mockPositions);
    });

    it('should open close dialog', () => {
      component.openCloseDialog(mockPosition);
      
      expect(component.showCloseDialog()).toBe(true);
      expect(component.positionToClose()).toBe(mockPosition);
    });

    it('should cancel close dialog', () => {
      component.positionToClose.set(mockPosition);
      component.showCloseDialog.set(true);
      
      component.cancelClose();
      
      expect(component.showCloseDialog()).toBe(false);
      expect(component.positionToClose()).toBe(null);
    });

    it('should close position successfully', () => {
      mockPriceArbitrageService.closePosition.and.returnValue(of(mockCloseResult));
      spyOn(window, 'alert');
      component.positionToClose.set(mockPosition);
      
      component.confirmClose();
      
      expect(mockPriceArbitrageService.closePosition).toHaveBeenCalledWith(mockPosition.id);
      expect(component.showCloseDialog()).toBe(false);
      expect(component.positionToClose()).toBe(null);
      expect(component.isClosing()).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });

    it('should handle close position error', () => {
      const errorMessage = 'Failed to close position';
      mockPriceArbitrageService.closePosition.and.returnValue(throwError(() => new Error(errorMessage)));
      spyOn(window, 'alert');
      component.positionToClose.set(mockPosition);
      
      component.confirmClose();
      
      expect(component.isClosing()).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });

    it('should update position in list after successful close', () => {
      mockPriceArbitrageService.closePosition.and.returnValue(of(mockCloseResult));
      spyOn(window, 'alert');
      component.positionToClose.set(mockPosition);
      
      component.confirmClose();
      
      const updatedPositions = component.positions();
      const closedPosition = updatedPositions.find(p => p.id === mockPosition.id);
      expect(closedPosition?.status).toBe(PriceArbitrageStatus.COMPLETED);
    });

    it('should do nothing if no position to close', () => {
      component.positionToClose.set(null);
      
      component.confirmClose();
      
      expect(mockPriceArbitrageService.closePosition).not.toHaveBeenCalled();
    });
  });

  describe('Display Methods', () => {
    const mockPosition = mockPositions[0];

    it('should get unrealized PnL', () => {
      const result = component.getUnrealizedPnl(mockPosition);
      
      expect(mockPriceArbitrageService.calculateUnrealizedPnl).toHaveBeenCalledWith(mockPosition);
      expect(result).toBe(150.50);
    });

    it('should format entry spread display', () => {
      const result = component.getEntrySpreadDisplay(mockPosition);
      
      expect(result).toBe('0.1500%');
    });

    it('should format current spread display', () => {
      const result = component.getCurrentSpreadDisplay(mockPosition);
      
      expect(result).toBe('0.1200%');
    });

    it('should return N/A for undefined current spread', () => {
      const positionWithoutSpread = { ...mockPosition, currentSpreadPercent: undefined };
      mockTranslationService.translate.and.returnValue('N/A');
      
      const result = component.getCurrentSpreadDisplay(positionWithoutSpread);
      
      expect(result).toBe('N/A');
    });

    it('should format price correctly', () => {
      const result = component.formatPrice(50000.123);
      
      expect(result).toBe('$50000.12');
    });

    it('should format positive PnL correctly', () => {
      const result = component.formatPnl(150.50);
      
      expect(result).toBe('+$150.50');
    });

    it('should format negative PnL correctly', () => {
      const result = component.formatPnl(-75.25);
      
      expect(result).toBe('-$75.25');
    });

    it('should return N/A for undefined PnL', () => {
      mockTranslationService.translate.and.returnValue('N/A');
      
      const result = component.formatPnl(undefined);
      
      expect(result).toBe('N/A');
    });

    it('should get correct status class', () => {
      expect(component.getStatusClass(PriceArbitrageStatus.ACTIVE)).toBe('status-active');
      expect(component.getStatusClass(PriceArbitrageStatus.COMPLETED)).toBe('status-completed');
      expect(component.getStatusClass(PriceArbitrageStatus.ERROR)).toBe('status-error');
      expect(component.getStatusClass(PriceArbitrageStatus.PENDING)).toBe('status-pending');
      expect(component.getStatusClass(PriceArbitrageStatus.CANCELLED)).toBe('status-cancelled');
    });

    it('should call translation service', () => {
      const key = 'test.key';
      
      component.translate(key);
      
      expect(mockTranslationService.translate).toHaveBeenCalledWith(key);
    });
  });

  describe('Auto Refresh', () => {
    it('should refresh positions automatically', fakeAsync(() => {
      component.ngOnInit();
      
      // Initial load
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledTimes(1);
      
      // After 5 seconds
      tick(5000);
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledTimes(2);
      
      // After another 5 seconds
      tick(5000);
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledTimes(3);
    }));

    it('should handle refresh errors silently', fakeAsync(() => {
      component.ngOnInit();
      
      // Make subsequent calls fail
      mockPriceArbitrageService.getPositions.and.returnValue(throwError(() => new Error('Refresh error')));
      
      tick(5000);
      
      // Should not affect component state
      expect(component.positions()).toEqual(mockPositions);
      expect(component.isLoading()).toBe(false);
    }));

    it('should use current filter status in auto refresh', fakeAsync(() => {
      component.selectedStatus.set(PriceArbitrageStatus.COMPLETED);
      component.ngOnInit();
      
      tick(5000);
      
      expect(mockPriceArbitrageService.getPositions).toHaveBeenCalledWith(PriceArbitrageStatus.COMPLETED);
    }));
  });
});