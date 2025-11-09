# ActivePositionsComponent Integration Guide

## Changes Required to Integrate ActivePositionsComponent into Arbitrage Chart

### 1. Add Import Statement

**File**: `frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.ts`

Add this import after line 22:

```typescript
import { ActivePositionsComponent, ActivePosition as ActivePositionInterface, PositionSide } from '../active-positions/active-positions.component';
```

### 2. Add Component to Imports Array

**File**: `frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.ts`

Add `ActivePositionsComponent` to the imports array in the @Component decorator (around line 151):

```typescript
@Component({
  selector: 'app-arbitrage-chart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    ArbitrageProfitCalculatorComponent,
    SignalConfigModalComponent,
    ActivePositionsComponent,  // <-- ADD THIS LINE
    RelativeTimePipe
  ],
  templateUrl: './arbitrage-chart.component.html',
  styleUrl: './arbitrage-chart.component.scss'
})
```

### 3. Add Data Transformation Method

**File**: `frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.ts`

Add this method to the ArbitrageChartComponent class (around line 240, after `filteredActivePositions`):

```typescript
/**
 * Transform ArbitragePosition to ActivePositionInterface for the new component
 */
transformedPositions = computed(() => {
  return this.filteredActivePositions().map(pos => {
    const transformed: ActivePositionInterface = {
      positionId: pos.positionId,
      symbol: pos.symbol,
      primary: {
        exchange: pos.primary.exchange,
        side: pos.primary.side as 'LONG' | 'SHORT' | 'long' | 'short',
        leverage: pos.primary.leverage,
        quantity: pos.primary.quantity,
        filledQuantity: pos.primary.filledQuantity,
        entryPrice: pos.primary.entryPrice,
        currentPrice: pos.primary.currentPrice,
        tradingFees: pos.primary.tradingFees || 0,
        lastFundingPaid: pos.primary.lastFundingPaid || 0,
        totalFundingEarned: pos.primary.totalFundingEarned || 0,
        liquidationPrice: pos.primary.liquidationPrice,
        proximityRatio: pos.primary.proximityRatio,
        inDanger: pos.primary.inDanger,
        stopLoss: pos.primary.stopLoss,
        takeProfit: pos.primary.takeProfit,
        unrealizedProfit: pos.primary.unrealizedProfit,
      },
      hedge: {
        exchange: pos.hedge.exchange,
        side: pos.hedge.side as 'LONG' | 'SHORT' | 'long' | 'short',
        leverage: pos.hedge.leverage,
        quantity: pos.hedge.quantity,
        filledQuantity: pos.hedge.filledQuantity,
        entryPrice: pos.hedge.entryPrice,
        currentPrice: pos.hedge.currentPrice,
        tradingFees: pos.hedge.tradingFees || 0,
        lastFundingPaid: pos.hedge.lastFundingPaid || 0,
        totalFundingEarned: pos.hedge.totalFundingEarned || 0,
        liquidationPrice: pos.hedge.liquidationPrice,
        proximityRatio: pos.hedge.proximityRatio,
        inDanger: pos.hedge.inDanger,
        stopLoss: pos.hedge.stopLoss,
        takeProfit: pos.hedge.takeProfit,
        unrealizedProfit: pos.hedge.unrealizedProfit,
      },
      status: pos.status,
      startedAt: pos.startedAt,
      completedAt: pos.completedAt,
      grossProfit: pos.grossProfit || 0,
      netProfit: pos.netProfit || 0,
      monitoring: pos.monitoring,
      errorMessage: pos.errorMessage,
      fundingUpdateCount: pos.fundingUpdateCount,
    };
    return transformed;
  });
});
```

### 4. Replace HTML Section

**File**: `frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.html`

Replace the entire Active Positions section (lines 92-369) with:

```html
<!-- Active Positions Component -->
<div id="active-positions-section" class="active-positions-section">
  <div class="section-header">
    <h2>{{ t('arbitrageChart.activePositions') }}</h2>
    <span class="positions-count">{{ transformedPositions().length }} {{ t('arbitrageChart.positionCount') }}</span>
  </div>

  <app-active-positions
    [positions]="transformedPositions()"
    [primaryPrice]="primaryData().price"
    [hedgePrice]="hedgeData().price"
    (syncTpSlClick)="syncTpSl($event)"
    (toggleMonitoringClick)="toggleMonitoring($event)"
    (stopPositionClick)="stopPosition($event)">
  </app-active-positions>
</div>
```

## Summary of Changes

1. **Import the component** - Add import statement for ActivePositionsComponent
2. **Register in imports** - Add to @Component imports array
3. **Add data transformer** - Create `transformedPositions()` computed signal to convert data format
4. **Replace HTML** - Replace the old Active Positions table with the new component

## Benefits

- **Real-time P&L**: Uses WebSocket prices for live profit calculation
- **Correct funding display**: Shows "- " when `fundingUpdateCount === 0`
- **Clean separation**: Active Positions logic is now in a separate reusable component
- **Better maintainability**: Cleaner code structure

## Testing

After making these changes:
1. Run `npm run build` to check for compilation errors
2. Start the dev server with `npm run dev`
3. Navigate to `http://localhost:4200/arbitrage/chart/AIAUSDT/GATEIO/BINGX/combined`
4. Verify that active positions display correctly with real-time P&L updates

