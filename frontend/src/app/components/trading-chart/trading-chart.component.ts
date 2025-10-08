import { Component, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, Input, Output, EventEmitter, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { ButtonComponent } from '../ui/button/button.component';

export interface TradingViewConfig {
  allow_symbol_change: boolean;
  calendar: boolean;
  details: boolean;
  hide_side_toolbar: boolean;
  hide_top_toolbar: boolean;
  hide_legend: boolean;
  hide_volume: boolean;
  hotlist: boolean;
  interval: string;
  locale: string;
  save_image: boolean;
  style: string;
  symbol: string;
  theme: 'light' | 'dark';
  timezone: string;
  backgroundColor?: string;
  gridColor?: string;
  watchlist: string[];
  withdateranges: boolean;
  compareSymbols: string[];
  studies: string[];
  autosize: boolean;
}

export interface GridConfig {
  symbol: string;
  upperBound: number;
  lowerBound: number;
  gridCount: number;
  gridSpacing: number;
  strategyType: string;
}

@Component({
  selector: 'app-trading-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './trading-chart.component.html',
  styleUrl: './trading-chart.component.scss'
})
export class TradingChartComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('tradingviewWidget', { static: false }) tradingviewWidget!: ElementRef;
  @Input() symbol: string = 'BINANCE:BTCUSDT';
  @Input() initialSymbol: string = 'BINANCE:BTCUSDT';
  @Input() initialResolution: string = 'D';
  @Input() chartHeight: number = 600;
  @Output() symbolChange = new EventEmitter<string>();

  private scriptElement: HTMLScriptElement | null = null;

  // Component state
  loading = false;
  error: string | null = null;

  // Widget configuration
  currentSymbol = this.symbol;
  currentInterval = 'D';
  showVolume = false;
  showDetails = false;
  showCalendar = false;
  allowSymbolChange = true;

  // Theme integration
  readonly currentTheme = this.themeService.currentTheme;
  readonly isDark = computed(() => this.currentTheme() === 'dark');
  readonly currentLanguage = this.translationService.currentLanguage;

  constructor(
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {
    // React to theme and language changes
    effect(() => {
      this.currentTheme(); // Track theme changes
      this.currentLanguage(); // Track language changes
      if (this.tradingviewWidget?.nativeElement && this.scriptElement) {
        this.reloadWidget();
      }
    });
  }

  ngOnInit(): void {
    this.currentSymbol = this.initialSymbol || this.symbol;
    this.currentInterval = this.initialResolution || this.currentInterval;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect symbol changes from parent component
    if (changes['symbol'] && !changes['symbol'].firstChange) {
      const newSymbol = changes['symbol'].currentValue;
      if (newSymbol && newSymbol !== this.currentSymbol) {
        this.currentSymbol = newSymbol;
        // Only reload if widget is already initialized
        if (this.tradingviewWidget?.nativeElement && this.scriptElement) {
          this.reloadWidget();
        }
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadTradingViewWidget();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.scriptElement) {
      this.scriptElement.remove();
      this.scriptElement = null;
    }
  }

  updateSymbol(): void {
    if (this.currentSymbol && this.currentSymbol.trim()) {
      this.symbol = this.currentSymbol.trim();
      this.symbolChange.emit(this.symbol);
      this.reloadWidget();
    }
  }

  updateInterval(): void {
    this.reloadWidget();
  }

  updateConfig(): void {
    this.reloadWidget();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  retry(): void {
    this.error = null;
    this.loadTradingViewWidget();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  private loadTradingViewWidget(): void {
    if (!this.tradingviewWidget?.nativeElement) {
      this.error = this.translate('chart.containerNotFound');
      return;
    }

    this.loading = true;
    this.error = null;
    this.createWidget();
  }

  private reloadWidget(): void {
    if (this.scriptElement) {
      this.scriptElement.remove();
      this.scriptElement = null;
    }

    // Clear the container
    if (this.tradingviewWidget?.nativeElement) {
      this.tradingviewWidget.nativeElement.innerHTML = '';
    }

    // Recreate the widget
    this.createWidget();
  }

  private createWidget(): void {
    if (!this.tradingviewWidget?.nativeElement) {
      this.error = this.translate('chart.widgetNotAvailable');
      this.loading = false;
      return;
    }

    const isDarkTheme = this.isDark();
    const locale = this.translationService.getTradingViewLocale();

    const config: TradingViewConfig = {
      allow_symbol_change: this.allowSymbolChange,
      calendar: this.showCalendar,
      details: this.showDetails,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: !this.showVolume,
      hotlist: false,
      interval: this.currentInterval,
      locale: locale,
      save_image: true,
      style: "1", // Candle style
      symbol: this.currentSymbol,
      theme: isDarkTheme ? "dark" : "light",
      timezone: "Etc/UTC",
      backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
      gridColor: isDarkTheme ? "rgba(242, 242, 242, 0.06)" : "rgba(42, 46, 57, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      autosize: true
    };

    try {
      this.scriptElement = document.createElement('script');
      this.scriptElement.type = 'text/javascript';
      this.scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      this.scriptElement.async = true;

      this.scriptElement.innerHTML = JSON.stringify(config);

      this.scriptElement.onload = () => {
        this.loading = false;
        console.log('TradingView widget loaded successfully');
      };

      this.scriptElement.onerror = () => {
        this.loading = false;
        this.error = this.translate('chart.failedToLoadWidget');
      };

      this.tradingviewWidget.nativeElement.appendChild(this.scriptElement);

      // Set loading timeout
      setTimeout(() => {
        if (this.loading) {
          this.loading = false;
        }
      }, 1000);

    } catch (error) {
      this.loading = false;
      this.error = this.translate('chart.errorInitializing');
      console.error('TradingView widget error:', error);
    }
  }
}
