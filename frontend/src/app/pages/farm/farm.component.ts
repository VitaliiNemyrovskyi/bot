import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
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
export class FarmComponent implements OnInit {
  public allOpportunities$!: Observable<FundingOpportunity[]>;
  public filteredOpportunities$!: Observable<FundingOpportunity[]>;
  public availableExchanges: string[] = [];
  public selectedExchanges: string[] = [];

  private selectedExchangesSubject = new BehaviorSubject<string[]>([]);

  constructor(private farmService: FarmService) { }

  ngOnInit(): void {
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
