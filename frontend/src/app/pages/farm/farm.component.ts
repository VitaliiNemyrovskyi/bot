import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FarmService, FundingOpportunity } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components/ui/button/button.component';

@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss']
})
export class FarmComponent implements OnInit, OnDestroy {
  public allOpportunities$!: Observable<FundingOpportunity[]>;
  public filteredOpportunities$!: Observable<FundingOpportunity[]>;
  public availableExchanges: string[] = [];
  public selectedExchanges: string[] = [];
  public currentTime$!: Observable<number>;

  private selectedExchangesSubject = new BehaviorSubject<string[]>([]);

  constructor(private farmService: FarmService) { }

  ngOnInit(): void {
    // Update current time every second for countdown
    this.currentTime$ = interval(1000).pipe(
      startWith(0),
      map(() => Date.now())
    );

    this.allOpportunities$ = this.farmService.getFundingOpportunities().pipe(
      map(opportunities => {
        const exchanges = [...new Set(opportunities.map(op => op.exchange))].sort();
        this.availableExchanges = exchanges;
        if (this.selectedExchanges.length === 0) {
          this.selectedExchanges = [...exchanges];
          this.selectedExchangesSubject.next(this.selectedExchanges);
        }
        return opportunities;
      })
    );

    this.filteredOpportunities$ = combineLatest([
      this.allOpportunities$,
      this.selectedExchangesSubject.asObservable().pipe(startWith(this.selectedExchanges))
    ]).pipe(
      map(([opportunities, selectedExchanges]) => {
        if (selectedExchanges.length === 0) {
          return opportunities;
        }
        return opportunities.filter(op => selectedExchanges.includes(op.exchange));
      })
    );
  }

  ngOnDestroy(): void {
    // Cleanup handled automatically by Angular
  }

  /**
   * Calculate countdown to next funding time
   * Returns formatted string in HH:MM:SS format
   */
  getCountdown(nextFundingTime: Date): string {
    const now = Date.now();
    const fundingTime = nextFundingTime.getTime();
    const diff = fundingTime - now;

    if (diff <= 0) {
      return '00:00:00';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  toggleExchangeFilter(exchange: string): void {
    const currentIndex = this.selectedExchanges.indexOf(exchange);
    if (currentIndex === -1) {
      this.selectedExchanges.push(exchange);
    } else {
      this.selectedExchanges.splice(currentIndex, 1);
    }
    this.selectedExchangesSubject.next(this.selectedExchanges);
  }

  isExchangeSelected(exchange: string): boolean {
    return this.selectedExchanges.includes(exchange);
  }

  trackByExchange(index: number, exchange: string): string { return exchange; }
}
