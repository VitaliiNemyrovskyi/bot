import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardActionsComponent } from '../../ui/card/card.component';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { TranslationService } from '../../../services/translation.service';

export interface TradingFilter {
  id: string;
  name: string;
  type: 'ENTRY' | 'EXIT';
  enabled: boolean;
  indicator: string;
  condition: string;
  value: number;
  timeframe?: string;
  period?: number;
  description?: string;
}

export interface IndicatorOption {
  value: string;
  label: string;
  description: string;
  hasValue: boolean;
  hasPeriod: boolean;
  hasTimeframe: boolean;
  defaultPeriod?: number;
  minValue?: number;
  maxValue?: number;
}

@Component({
  selector: 'app-entry-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    CardActionsComponent,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './entry-filter.component.html',
  styleUrls: ['./entry-filter.component.css']
})
export class EntryFilterComponent implements OnInit {
  protected translationService = inject(TranslationService);
  @Input() mode: 'ENTRY' | 'EXIT' = 'ENTRY';
  @Input() filters: TradingFilter[] = [];
  @Output() filtersChange = new EventEmitter<TradingFilter[]>();

  filterForm: FormGroup;
  showForm = false;
  editingIndex = -1;
  selectedIndicator?: IndicatorOption;

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  indicatorOptions: IndicatorOption[] = [
    {
      value: 'SMA',
      label: 'Simple Moving Average (SMA)',
      description: 'Average price over a period',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 20,
      minValue: 0,
      maxValue: 1000000
    },
    {
      value: 'EMA',
      label: 'Exponential Moving Average (EMA)',
      description: 'Weighted average giving more importance to recent prices',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 20,
      minValue: 0,
      maxValue: 1000000
    },
    {
      value: 'RSI',
      label: 'Relative Strength Index (RSI)',
      description: 'Momentum oscillator (0-100)',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 14,
      minValue: 0,
      maxValue: 100
    },
    {
      value: 'MACD',
      label: 'MACD Signal',
      description: 'Moving Average Convergence Divergence',
      hasValue: true,
      hasPeriod: false,
      hasTimeframe: true,
      minValue: -1000,
      maxValue: 1000
    },
    {
      value: 'STOCH',
      label: 'Stochastic Oscillator',
      description: 'Momentum indicator (0-100)',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 14,
      minValue: 0,
      maxValue: 100
    },
    {
      value: 'BOLLINGER_UPPER',
      label: 'Bollinger Bands Upper',
      description: 'Upper Bollinger Band level',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 20,
      minValue: 0,
      maxValue: 1000000
    },
    {
      value: 'BOLLINGER_LOWER',
      label: 'Bollinger Bands Lower',
      description: 'Lower Bollinger Band level',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 20,
      minValue: 0,
      maxValue: 1000000
    },
    {
      value: 'VOLUME',
      label: 'Volume',
      description: 'Trading volume',
      hasValue: true,
      hasPeriod: false,
      hasTimeframe: true,
      minValue: 0,
      maxValue: 1000000000
    },
    {
      value: 'ATR',
      label: 'Average True Range (ATR)',
      description: 'Volatility indicator',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 14,
      minValue: 0,
      maxValue: 1000
    },
    {
      value: 'ADX',
      label: 'Average Directional Index (ADX)',
      description: 'Trend strength indicator (0-100)',
      hasValue: true,
      hasPeriod: true,
      hasTimeframe: true,
      defaultPeriod: 14,
      minValue: 0,
      maxValue: 100
    }
  ];

  conditionOptions = [
    { value: 'GREATER_THAN', label: 'Greater Than (>)' },
    { value: 'LESS_THAN', label: 'Less Than (<)' },
    { value: 'GREATER_EQUAL', label: 'Greater Than or Equal (>=)' },
    { value: 'LESS_EQUAL', label: 'Less Than or Equal (<=)' },
    { value: 'EQUAL', label: 'Equal To (=)' },
    { value: 'CROSS_ABOVE', label: 'Cross Above' },
    { value: 'CROSS_BELOW', label: 'Cross Below' }
  ];

  timeframeOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.createForm();
  }

  ngOnInit() {}

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      indicator: ['', Validators.required],
      condition: ['', Validators.required],
      value: [null],
      period: [null],
      timeframe: ['1h'],
      description: ['']
    });
  }

  addFilter() {
    this.showForm = true;
    this.editingIndex = -1;
    this.filterForm.reset({
      timeframe: '1h'
    });
  }

  editFilter(index: number) {
    this.showForm = true;
    this.editingIndex = index;
    const filter = this.filters[index];

    this.filterForm.patchValue({
      name: filter!.name,
      indicator: filter!.indicator,
      condition: filter!.condition,
      value: filter!.value,
      period: filter!.period,
      timeframe: filter!.timeframe || '1h',
      description: filter!.description || ''
    });

    this.onIndicatorChange(filter!.indicator);
  }

  saveFilter() {
    if (!this.filterForm.valid) return;

    const formValue = this.filterForm.value;
    const filter: TradingFilter = {
      id: this.editingIndex !== -1 ? this.filters[this.editingIndex]!.id : this.generateFilterId(),
      name: formValue.name,
      type: this.mode,
      enabled: true,
      indicator: formValue.indicator,
      condition: formValue.condition,
      value: formValue.value,
      period: formValue.period,
      timeframe: formValue.timeframe,
      description: formValue.description
    };

    const newFilters = [...this.filters];
    if (this.editingIndex !== -1) {
      newFilters[this.editingIndex] = filter;
    } else {
      newFilters.push(filter);
    }

    this.filters = newFilters;
    this.filtersChange.emit(this.filters);
    this.cancelForm();
  }

  removeFilter(index: number) {
    if (confirm('Are you sure you want to remove this filter?')) {
      const newFilters = this.filters.filter((_, i) => i !== index);
      this.filters = newFilters;
      this.filtersChange.emit(this.filters);
    }
  }

  toggleFilter(index: number, event: any) {
    const newFilters = [...this.filters];
    newFilters[index]!.enabled = event.target.checked;
    this.filters = newFilters;
    this.filtersChange.emit(this.filters);
  }

  cancelForm() {
    this.showForm = false;
    this.editingIndex = -1;
    this.selectedIndicator = undefined;
    this.filterForm.reset();
  }

  onIndicatorChange(indicatorValue: string | any) {
    // Handle both string values and event objects
    const value = typeof indicatorValue === 'string' ? indicatorValue : (indicatorValue?.value || indicatorValue?.target?.value);
    this.selectedIndicator = this.indicatorOptions.find(opt => opt.value === value);

    if (this.selectedIndicator) {
      // Set default period if applicable
      if (this.selectedIndicator.hasPeriod && this.selectedIndicator.defaultPeriod) {
        this.filterForm.patchValue({ period: this.selectedIndicator.defaultPeriod });
      }

      // Update form validators based on indicator
      if (this.selectedIndicator.hasValue) {
        this.filterForm.get('value')?.setValidators([Validators.required]);
      } else {
        this.filterForm.get('value')?.clearValidators();
      }
      this.filterForm.get('value')?.updateValueAndValidity();
    }
  }

  getFilterDescription(filter: TradingFilter): string {
    const indicator = this.indicatorOptions.find(opt => opt.value === filter.indicator);
    const condition = this.conditionOptions.find(opt => opt.value === filter.condition);

    let description = `${indicator?.label || filter.indicator} ${condition?.label || filter.condition}`;

    if (filter.value !== null && filter.value !== undefined) {
      description += ` ${filter.value}`;
    }

    if (filter.period) {
      description += ` (Period: ${filter.period})`;
    }

    if (filter.timeframe) {
      description += ` [${filter.timeframe}]`;
    }

    return description;
  }

  private generateFilterId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}