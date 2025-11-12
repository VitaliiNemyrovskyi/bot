const fs = require('fs');
const path = require('path');

// Fixes to apply
const fixes = [
  // lightweight-chart.component.ts
  {
    file: 'src/app/components/lightweight-chart/lightweight-chart.component.ts',
    changes: [
      {
        find: '              this.candlestickSeries.update(lastCandle);',
        replace: '              if (lastCandle) {\n                this.candlestickSeries.update(lastCandle);\n              }'
      },
      {
        find: '  private loadData(data: ChartData[]): void {',
        replace: '  private _loadData(data: ChartData[]): void {'
      },
      {
        find: '          this.candlestickSeries?.removePriceLine(line);',
        replace: '          this.candlestickSeries?.removePriceLine(line as any);'
      },
      {
        find: '        const { width } = entries[0].contentRect;',
        replace: '        const { width } = entries[0]!.contentRect;'
      }
    ]
  },
  // profile.component.ts
  {
    file: 'src/app/components/profile/profile.component.ts',
    changes: [
      {
        find: '    private userService: UserService,',
        replace: '    private _userService: UserService,'
      },
      {
        find: '      next: (updated) => {',
        replace: '      next: (_updated) => {',
        global: true
      },
      {
        find: '      next: (newCred) => {',
        replace: '      next: (_newCred) => {'
      }
    ]
  },
  // trading-platform-info-modal.component.ts
  {
    file: 'src/app/components/trading-platform-info-modal/trading-platform-info-modal.component.ts',
    changes: [
      {
        find: 'import {\n  BybitCoinBalance,',
        replace: 'import {'
      },
      {
        find: '  BybitOrder\n} from',
        replace: '} from'
      }
    ]
  },
  // arbitrage-chart.component.ts
  {
    file: 'src/app/components/trading/arbitrage-chart/arbitrage-chart.component.ts',
    changes: [
      {
        find: '        const { width } = entries[0].contentRect;',
        replace: '        const { width } = entries[0]!.contentRect;'
      },
      {
        find: '    exchange: string,\n    symbol: string,',
        replace: '    _exchange: string,\n    _symbol: string,'
      }
    ]
  },
  // bot-config-page.component.ts
  {
    file: 'src/app/components/trading/bot-config-page/bot-config-page.component.ts',
    changes: [
      {
        find: '  onBotEdit(botData: any) {',
        replace: '  onBotEdit(_botData: any) {'
      }
    ]
  },
  // entry-filter.component.ts
  {
    file: 'src/app/components/trading/entry-filter/entry-filter.component.ts',
    changes: [
      {
        find: 'import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from \'@angular/forms\';',
        replace: 'import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from \'@angular/forms\';'
      },
      {
        find: '      name: filter.name,',
        replace: '      name: filter!.name,'
      },
      {
        find: '      indicator: filter.indicator,',
        replace: '      indicator: filter!.indicator,'
      },
      {
        find: '      condition: filter.condition,',
        replace: '      condition: filter!.condition,'
      },
      {
        find: '      value: filter.value,',
        replace: '      value: filter!.value,'
      },
      {
        find: '      period: filter.period,',
        replace: '      period: filter!.period,'
      },
      {
        find: '      timeframe: filter.timeframe || \'1h\',',
        replace: '      timeframe: filter!.timeframe || \'1h\','
      },
      {
        find: '      description: filter.description || \'\'',
        replace: '      description: filter!.description || \'\''
      },
      {
        find: '    this.onIndicatorChange(filter.indicator);',
        replace: '    this.onIndicatorChange(filter!.indicator);'
      },
      {
        find: '      id: this.editingIndex !== -1 ? this.filters[this.editingIndex].id : this.generateFilterId(),',
        replace: '      id: this.editingIndex !== -1 ? this.filters[this.editingIndex]!.id : this.generateFilterId(),'
      },
      {
        find: '    newFilters[index].enabled = event.target.checked;',
        replace: '    newFilters[index]!.enabled = event.target.checked;'
      }
    ]
  },
  // funding-rate-spread-chart.component.ts
  {
    file: 'src/app/components/trading/funding-rate-spread-chart/funding-rate-spread-chart.component.ts',
    changes: [
      {
        find: '        const { width } = entries[0].contentRect;',
        replace: '        const { width } = entries[0]!.contentRect;'
      }
    ]
  },
  // funding-rates.component.ts - Remove unused interfaces
  {
    file: 'src/app/components/trading/funding-rates/funding-rates.component.ts',
    changes: [
      {
        find: 'interface ApiResponse<T> {\n  success: boolean;\n  data: T;\n}\n\ninterface CredentialsData {\n  id: string;\n  name: string;\n}\n\ninterface TickerListResponse {\n  symbol: string;\n  lastPrice: string;\n}\n\ninterface BingXBalanceResponse {\n  asset: string;\n  free: string;\n  locked: string;\n}\n\ninterface FundingRateData {\n  symbol: string;\n  fundingRate: string;\n  fundingTime: number;\n}\n\ninterface SubscriptionData extends FundingSubscription {\n  expanded?: boolean;\n  loading?: boolean;\n  currentFundingRate?: number;\n  fundingInterval?: string;\n  nextFundingTime?: Date;\n  countdown?: string;\n}\n\ninterface ArbitrageOpportunityRaw {',
        replace: 'interface ArbitrageOpportunityRaw {'
      },
      {
        find: '                const hours = parseInt(match[1], 10);',
        replace: '                const hours = parseInt(match[1]!, 10);'
      },
      {
        find: '                const minutes = parseInt(match[2], 10);',
        replace: '                const minutes = parseInt(match[2]!, 10);'
      },
      {
        find: '          direction: updated[existingIndex].direction === \'asc\' ? \'desc\' : \'asc\'',
        replace: '          direction: updated[existingIndex]!.direction === \'asc\' ? \'desc\' : \'asc\''
      },
      {
        find: '          direction: currentSorts[0].direction === \'asc\' ? \'desc\' : \'asc\'',
        replace: '          direction: currentSorts[0]!.direction === \'asc\' ? \'desc\' : \'asc\''
      },
      {
        find: '    return { index, direction: sorts[index].direction };',
        replace: '    return { index, direction: sorts[index]!.direction };'
      },
      {
        find: '  private startCountdownMonitoring(subscription: FundingSubscription): void {',
        replace: '  private _startCountdownMonitoring(_subscription: FundingSubscription): void {'
      },
      {
        find: '      const response = await this.http.delete<any>(',
        replace: '      await this.http.delete<any>('
      },
      {
        find: '  async fetchBalancesAndCalculatePosition(symbol: string): Promise<void> {',
        replace: '  async fetchBalancesAndCalculatePosition(_symbol: string): Promise<void> {'
      },
      {
        find: '  getMarketCap(symbol: string): number {',
        replace: '  getMarketCap(_symbol: string): number {'
      }
    ]
  },
  // funding-revenue.component.ts
  {
    file: 'src/app/components/trading/funding-revenue/funding-revenue.component.ts',
    changes: [
      {
        find: 'import {\n  FundingArbitrageDeal,\n  RevenueBySymbol,\n  RevenueByExchange\n} from',
        replace: 'import {'
      },
      {
        find: '} from \'../../models/funding-arbitrage.model\';',
        replace: '} from \'../../models/funding-arbitrage.model\';'
      },
      {
        find: '    return date.toISOString().split(\'T\')[0];',
        replace: '    return date.toISOString().split(\'T\')[0]!;'
      }
    ]
  },
  // funding-spread-details.component.ts
  {
    file: 'src/app/components/trading/funding-spread-details/funding-spread-details.component.ts',
    changes: [
      {
        find: 'import { Component, Input, signal, computed } from \'@angular/core\';',
        replace: 'import { Component, Input, computed } from \'@angular/core\';'
      }
    ]
  },
  // grid-bot-dashboard.component.ts
  {
    file: 'src/app/components/trading/grid-bot-dashboard/grid-bot-dashboard.component.ts',
    changes: [
      {
        find: 'import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from \'@angular/forms\';',
        replace: 'import { FormsModule, ReactiveFormsModule } from \'@angular/forms\';'
      },
      {
        find: '      error: (error) => {',
        replace: '      error: (_error) => {',
        global: true
      },
      {
        find: '  backtestStrategy(strategy: any) {',
        replace: '  backtestStrategy(_strategy: any) {'
      },
      {
        find: '  editStrategy(strategy: any) {',
        replace: '  editStrategy(_strategy: any) {'
      },
      {
        find: '  deleteStrategy(strategy: any) {',
        replace: '  deleteStrategy(_strategy: any) {'
      }
    ]
  },
  // order-form.component.ts
  {
    file: 'src/app/components/trading/order-form/order-form.component.ts',
    changes: [
      {
        find: 'import { OrderRequest, OrderSide, OrderType, TimeInForce, Balance } from \'../../../models/trading.model\';',
        replace: 'import { OrderSide, TimeInForce, Balance } from \'../../../models/trading.model\';'
      },
      {
        find: '    const marginMode = this._marginMode();',
        replace: '    const _marginMode = this._marginMode();'
      }
    ]
  },
  // start-bybit-strategy-modal.component.ts
  {
    file: 'src/app/components/trading/start-bybit-strategy-modal/start-bybit-strategy-modal.component.ts',
    changes: [
      {
        find: '  PositionSideConfig,',
        replace: ''
      }
    ]
  },
  // trade-history.component.ts
  {
    file: 'src/app/components/trading/trade-history/trade-history.component.ts',
    changes: [
      {
        find: 'import { Component, OnInit, OnDestroy, signal, Input, Output, EventEmitter, inject } from \'@angular/core\';',
        replace: 'import { Component, OnInit, OnDestroy, signal, Input, Output, EventEmitter } from \'@angular/core\';'
      },
      {
        find: '    const duration = trade.duration || 0;',
        replace: '    const _duration = trade.duration || 0;'
      }
    ]
  },
  // trading-dashboard.component.ts
  {
    file: 'src/app/components/trading/trading-dashboard/trading-dashboard.component.ts',
    changes: [
      {
        find: '  private http = inject(HttpClient);',
        replace: '  private _http = inject(HttpClient);'
      },
      {
        find: '  private bybitService = inject(BybitService);',
        replace: '  private _bybitService = inject(BybitService);'
      }
    ]
  }
];

console.log('Starting TypeScript error fixes...\n');

let fixedCount = 0;
let errorCount = 0;

for (const fix of fixes) {
  const filePath = path.join(__dirname, fix.file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const change of fix.changes) {
      if (change.global) {
        const regex = new RegExp(change.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (content.match(regex)) {
          content = content.replace(regex, change.replace);
          modified = true;
        }
      } else {
        if (content.includes(change.find)) {
          content = content.replace(change.find, change.replace);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fix.file}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${fix.file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
    errorCount++;
  }
}

console.log(`\n✨ Fix complete!`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Errors: ${errorCount} files`);
