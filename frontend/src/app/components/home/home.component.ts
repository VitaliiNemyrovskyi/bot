import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tradingviewWidget', { static: false }) tradingviewWidget!: ElementRef;
  private scriptElement: HTMLScriptElement | null = null;

  readonly currentTheme = this.themeService.currentTheme;
  readonly isDark = computed(() => this.currentTheme() === 'dark');
  readonly currentLanguage = this.translationService.currentLanguage;

  constructor(
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {
    // React to theme and language changes and reload widget
    effect(() => {
      const theme = this.currentTheme();
      const language = this.currentLanguage();
      if (this.tradingviewWidget?.nativeElement && this.scriptElement) {
        this.reloadWidget();
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadTradingViewWidget();
  }

  ngOnDestroy(): void {
    if (this.scriptElement) {
      this.scriptElement.remove();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  private loadTradingViewWidget(): void {
    if (!this.tradingviewWidget?.nativeElement) {
      console.error('TradingView container element not found');
      return;
    }

    this.createWidget();
  }

  private reloadWidget(): void {
    if (this.scriptElement) {
      this.scriptElement.remove();
    }

    // Clear the container
    this.tradingviewWidget.nativeElement.innerHTML = '';

    // Recreate the widget
    this.createWidget();
  }

  private createWidget(): void {
    const isDarkTheme = this.isDark();

    this.scriptElement = document.createElement('script');
    this.scriptElement.type = 'text/javascript';
    this.scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    this.scriptElement.async = true;

    this.scriptElement.innerHTML = JSON.stringify({
      "allow_symbol_change": true,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": true,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "hide_volume": false,
      "hotlist": false,
      "interval": "D",
      "locale": this.translationService.getTradingViewLocale(),
      "save_image": true,
      "style": "1",
      "symbol": "NASDAQ:AAPL",
      "theme": isDarkTheme ? "dark" : "light",
      "timezone": "Etc/UTC",
      "backgroundColor": isDarkTheme ? "#1E1E1E" : "#FFFFFF",
      "gridColor": isDarkTheme ? "rgba(242, 242, 242, 0.06)" : "rgba(42, 46, 57, 0.06)",
      "watchlist": [],
      "withdateranges": false,
      "compareSymbols": [],
      "studies": [],
      "autosize": true
    });

    this.tradingviewWidget.nativeElement.appendChild(this.scriptElement);
  }
}