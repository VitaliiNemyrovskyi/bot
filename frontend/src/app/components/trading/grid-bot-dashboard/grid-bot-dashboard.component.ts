import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardSubtitleComponent, CardContentComponent, CardActionsComponent } from '../../ui/card/card.component';
import { TableComponent } from '../../ui/table/table.component';
import { TabsComponent, TabContentComponent } from '../../ui/tabs/tabs.component';
import { TableColumn } from '../../ui/table/table.component';

import { GridBotService } from '../../../services/grid-bot.service';
import { TranslationService } from '../../../services/translation.service';

export interface GridBot {
  id: string;
  name: string;
  symbol: string;
  status: 'RUNNING' | 'STOPPED' | 'PAUSED' | 'ERROR';
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  createdAt: Date;
  config: any;
}


@Component({
  selector: 'app-grid-bot-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
    CardContentComponent,
    CardActionsComponent,
    TableComponent,
    TabsComponent,
    TabContentComponent
  ],
  templateUrl: './grid-bot-dashboard.component.html',
  styleUrls: ['./grid-bot-dashboard.component.css']
})
export class GridBotDashboardComponent implements OnInit {
  protected translationService = inject(TranslationService);
  activeBots: GridBot[] = [];
  strategies: any[] = [];
  backtests: any[] = [];
  backtestTableColumns: TableColumn[] = [];

  constructor(
    private gridBotService: GridBotService,
    private router: Router
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit() {
    this.backtestTableColumns = [
      { key: 'symbol', label: this.translate('dashboard.symbol'), sortable: true },
      { key: 'timeframe', label: this.translate('dashboard.timeframe'), sortable: true },
      { key: 'totalPnL', label: this.translate('dashboard.totalPnl'), sortable: true, type: 'currency' },
      { key: 'winRate', label: this.translate('dashboard.winRate'), sortable: true, type: 'percentage' },
      { key: 'maxDrawdown', label: this.translate('dashboard.maxDrawdown'), sortable: true, type: 'percentage' },
      { key: 'createdAt', label: this.translate('dashboard.date'), sortable: true, type: 'date' },
      { key: 'actions', label: this.translate('dashboard.actions'), sortable: false }
    ];
    this.loadActiveBots();
    this.loadBacktests();
  }

  loadActiveBots() {
    this.gridBotService.getBots().subscribe({
      next: (bots) => {
        this.activeBots = bots;
      },
      error: (_error) => {
        console.error('Failed to load bots');
      }
    });
  }


  loadBacktests() {
    this.gridBotService.getBacktests().subscribe({
      next: (backtests) => {
        this.backtests = backtests;
      },
      error: (_error) => {
        console.error('Failed to load backtests');
      }
    });
  }

  openBotConfig() {
    this.router.navigate(['/trading/bot/create']);
  }

  viewBot(bot: GridBot) {
    this.router.navigate(['/trading/bot/view', bot.id]);
  }

  editBot(bot: GridBot) {
    this.router.navigate(['/trading/bot/edit', bot.id]);
  }

  toggleBot(bot: GridBot) {
    const action = bot.status === 'RUNNING' ? 'stop' : 'start';

    this.gridBotService.updateBot(bot.id, action).subscribe({
      next: () => {
        console.log(`Bot ${action}ed successfully`);
        this.loadActiveBots();
      },
      error: (_error) => {
        console.error(`Failed to ${action} bot`);
      }
    });
  }

  deleteBot(bot: GridBot) {
    if (confirm(`Are you sure you want to delete bot ${bot.name || bot.symbol}?`)) {
      this.gridBotService.deleteBot(bot.id).subscribe({
        next: () => {
          console.log('Bot deleted successfully');
          this.loadActiveBots();
        },
        error: (_error) => {
          console.error('Failed to delete bot');
        }
      });
    }
  }

  createStrategy() {
    console.log('Create strategy - not implemented');
  }

  useStrategy(strategy: any) {
    // Navigate to create page with strategy data as query parameter
    this.router.navigate(['/trading/bot/create'], {
      queryParams: { strategy: JSON.stringify(strategy) }
    });
  }

  backtestStrategy(_strategy: any) {
    console.log('Backtest strategy - not implemented');
  }

  editStrategy(_strategy: any) {
    console.log('Edit strategy - not implemented');
  }

  deleteStrategy(_strategy: any) {
    console.log('Delete strategy - not implemented');
  }

  newBacktest() {
    // Open backtest configuration dialog
  }

  viewBacktest(backtest: any) {
    // TODO: Implement custom backtest results dialog
    console.log('View backtest:', backtest);
  }

  deleteBacktest(backtest: any) {
    if (confirm('Are you sure you want to delete this backtest?')) {
      this.gridBotService.deleteBacktest(backtest.id).subscribe({
        next: () => {
          console.log('Backtest deleted successfully');
          this.loadBacktests();
        },
        error: (_error) => {
          console.error('Failed to delete backtest');
        }
      });
    }
  }
}