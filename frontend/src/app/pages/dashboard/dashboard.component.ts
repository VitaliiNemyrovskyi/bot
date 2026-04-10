import { Component, OnInit, OnDestroy, ViewEncapsulation, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { PublicFundingRatesService } from '../../services/public-funding-rates.service';
import { FundingRateOpportunity } from '../../models/public-funding-rate.model';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../../components/ui/icon/icon.component';
import { ButtonComponent } from '../../components/ui/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  private fundingRatesService = inject(PublicFundingRatesService);
  private translationService = inject(TranslationService);

  opportunities = signal<FundingRateOpportunity[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);
  currentTime = signal<number>(Date.now());

  private refreshSubscription?: Subscription;
  private timeInterval?: ReturnType<typeof setInterval>;
  private readonly REFRESH_MS = 30_000;

  // Only profitable opportunities, sorted by Net APR descending
  profitableOpportunities = computed(() => {
    return this.opportunities()
      .filter(o => o.netAPR > 0)
      .sort((a, b) => b.netAPR - a.netAPR);
  });

  topOpportunities = computed(() => {
    return this.profitableOpportunities().slice(0, 20);
  });

  totalCount = computed(() => this.profitableOpportunities().length);

  timeSinceUpdate = computed(() => {
    const last = this.lastUpdated();
    if (!last) return '';
    const sec = Math.floor((this.currentTime() - last.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    return `${Math.floor(sec / 60)}m ago`;
  });

  ngOnInit(): void {
    this.refreshSubscription = interval(this.REFRESH_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.fundingRatesService.getFundingRatesOpportunities())
      )
      .subscribe({
        next: (data) => {
          this.opportunities.set(data);
          this.isLoading.set(false);
          this.error.set(null);
          setTimeout(() => this.lastUpdated.set(new Date()), 0);
        },
        error: (err) => {
          this.error.set(err.message);
          this.isLoading.set(false);
        }
      });

    this.timeInterval = setInterval(() => this.currentTime.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  getCountdown(timestampMs: number): string {
    const diff = timestampMs - this.currentTime();
    if (diff <= 0) return '0m';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  getUrgencyClass(timestampMs: number): string {
    const diff = timestampMs - this.currentTime();
    if (diff <= 0) return 'urgent';
    if (diff < 30 * 60_000) return 'soon';
    if (diff < 2 * 3_600_000) return 'approaching';
    return 'normal';
  }

  formatFundingRate(rate: string): string {
    const r = parseFloat(rate) * 100;
    return (r >= 0 ? '+' : '') + r.toFixed(4) + '%';
  }

  getFundingRateClass(rate: string): string {
    const r = parseFloat(rate);
    if (r < 0) return 'rate-negative';
    if (r > 0) return 'rate-positive';
    return 'rate-neutral';
  }

  getNetAPRClass(apr: number): string {
    const pct = apr * 100;
    if (pct >= 50) return 'apr-high';
    if (pct >= 20) return 'apr-medium';
    return 'apr-low';
  }

  getExchangeUrl(exchange: string, symbol: string): string {
    switch (exchange.toUpperCase()) {
      case 'BYBIT': return `https://www.bybit.com/trade/usdt/${symbol}`;
      case 'BINGX': {
        let s = symbol.replace(/:.*$/, '').replace(/\//g, '');
        if (!s.includes('-') && s.endsWith('USDT')) s = s.slice(0, -4) + '-USDT';
        return `https://bingx.com/en/perpetual/${s}`;
      }
      case 'MEXC': return `https://www.mexc.com/exchange/${symbol.replace(/USDT$/, '_USDT')}`;
      case 'GATEIO': return `https://www.gate.io/trade/${symbol.replace(/USDT$/, '_USDT')}`;
      case 'BITGET': return `https://www.bitget.com/futures/usdt/${symbol}`;
      case 'OKX': return `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
      case 'KUCOIN': return `https://www.kucoin.com/futures/trade/${symbol}`;
      default: return '#';
    }
  }

  openExchange(exchange: string, symbol: string): void {
    const url = this.getExchangeUrl(exchange, symbol);
    if (url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
  }
}
