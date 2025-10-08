import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { LightweightChartComponent, GridConfig } from '../../lightweight-chart/lightweight-chart.component';
import { EntryFilterComponent, TradingFilter } from '../entry-filter/entry-filter.component';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-bot-config-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    LightweightChartComponent,
    EntryFilterComponent,
  ],
  templateUrl: './bot-config-form.component.html',
  styleUrls: ['./bot-config-form.component.css']
})
export class BotConfigFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() botData?: any;
  @Input() strategyData?: any;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();

  configForm: FormGroup;
  symbols: string[] = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT', 'MATIC/USDT'];
  symbolOptions: any[] = [];
  strategyOptions: any[] = [
    { value: 'REGULAR', label: 'Regular (Linear)' },
    { value: 'FIBONACCI', label: 'Fibonacci' },
    { value: 'LOGARITHMIC', label: 'Logarithmic' },
    { value: 'MULTIPLICATOR', label: 'Multiplicator' },
    { value: 'MARTINGALE', label: 'Martingale' }
  ];
  currentGridConfig?: GridConfig;
  entryFilters: TradingFilter[] = [];
  exitFilters: TradingFilter[] = [];

  // Grid overlay properties removed

  // Resizable layout properties
  chartWidth = 65;
  chartHeight = 600;
  formWidth = 35;
  private isResizing = false;
  private startX = 0;
  private startChartWidth = 0;

  protected translationService = inject(TranslationService);

  constructor(private fb: FormBuilder) {
    this.configForm = this.createForm();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit() {
    this.symbolOptions = this.symbols.map(s => ({ value: s, label: s }));
    this.populateFormData();
    this.updateGridConfig();
    this.setupFormValueChanges();
    this.setupResizeListeners();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      symbol: ['BTC/USDT', Validators.required],
      gridCount: [10, [Validators.required, Validators.min(2), Validators.max(100)]],
      baseOrderSize: [10, [Validators.required, Validators.min(0.01)]],
      upperBound: [50000, [Validators.required, Validators.min(0)]],
      lowerBound: [30000, [Validators.required, Validators.min(0)]],
      strategyType: ['REGULAR', Validators.required]
    });
  }

  private populateFormData() {
    if (this.mode === 'edit' && this.botData) {
      this.configForm.patchValue({
        name: this.botData.name,
        symbol: this.botData.symbol,
        gridCount: this.botData.config?.gridStrategy?.gridCount || 10,
        baseOrderSize: this.botData.config?.riskManagement?.baseOrderSize || 10,
        upperBound: this.botData.config?.gridRange?.upperBound || 50000,
        lowerBound: this.botData.config?.gridRange?.lowerBound || 30000,
        strategyType: this.botData.config?.gridStrategy?.type || 'REGULAR'
      });

      // Load existing filters
      this.entryFilters = this.botData.config?.entryFilters || [];
      this.exitFilters = this.botData.config?.exitFilters || [];
    }
  }

  private setupFormValueChanges() {
    // Update grid configuration whenever form values change
    this.configForm.valueChanges.subscribe(() => {
      this.updateGridConfig();
    });
  }

  private updateGridConfig() {
    const formValue = this.configForm.value;

    if (formValue.symbol && formValue.upperBound && formValue.lowerBound && formValue.gridCount) {
      this.currentGridConfig = {
        symbol: formValue.symbol,
        upperBound: formValue.upperBound,
        lowerBound: formValue.lowerBound,
        gridCount: formValue.gridCount,
        gridSpacing: 1.0, // Will be calculated based on strategy
        strategyType: formValue.strategyType || 'REGULAR'
      };

      // Grid calculation removed
    }
  }

  onSave() {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;

      const botConfig = {
        id: this.botData?.id,
        name: formValue.name,
        symbol: formValue.symbol,
        config: {
          symbol: formValue.symbol,
          baseAsset: formValue.symbol.split('/')[0] || 'BTC',
          quoteAsset: formValue.symbol.split('/')[1] || 'USDT',
          gridStrategy: {
            type: formValue.strategyType || 'REGULAR',
            gridCount: formValue.gridCount,
            gridSpacing: 1.0
          },
          gridRange: {
            upperBound: formValue.upperBound,
            lowerBound: formValue.lowerBound,
            autoAdjust: false
          },
          entryFilters: this.entryFilters,
          exitFilters: this.exitFilters,
          riskManagement: {
            baseOrderSize: formValue.baseOrderSize,
            maxPositionSize: formValue.baseOrderSize * formValue.gridCount,
            maxOpenOrders: formValue.gridCount
          }
        }
      };

      this.save.emit(botConfig);
    } else {
      Object.keys(this.configForm.controls).forEach(key => {
        const control = this.configForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onEdit() {
    this.edit.emit(this.botData);
  }

  onEntryFiltersChange(filters: TradingFilter[]) {
    this.entryFilters = filters;
  }

  onExitFiltersChange(filters: TradingFilter[]) {
    this.exitFilters = filters;
  }

  // Resizable layout methods
  startResize(event: MouseEvent | TouchEvent) {
    this.isResizing = true;
    this.startX = this.getClientX(event);
    this.startChartWidth = this.chartWidth;

    event.preventDefault();
    event.stopPropagation();
  }

  private setupResizeListeners() {
    document.addEventListener('mousemove', this.handleResize.bind(this));
    document.addEventListener('mouseup', this.endResize.bind(this));
    document.addEventListener('touchmove', this.handleResize.bind(this));
    document.addEventListener('touchend', this.endResize.bind(this));
  }

  private handleResize(event: MouseEvent | TouchEvent) {
    if (!this.isResizing) return;

    const currentX = this.getClientX(event);
    const deltaX = currentX - this.startX;
    const containerWidth = window.innerWidth - 48; // Account for padding
    const deltaPercent = (deltaX / containerWidth) * 100;

    let newChartWidth = this.startChartWidth + deltaPercent;

    // Constrain between 30% and 80%
    newChartWidth = Math.max(30, Math.min(80, newChartWidth));

    this.chartWidth = newChartWidth;
    this.formWidth = 100 - newChartWidth;

    event.preventDefault();
  }

  private endResize() {
    this.isResizing = false;
  }

  // Chart-related methods
  getSelectedSymbol(): string {
    const symbol = this.configForm.get('symbol')?.value || 'BTC/USDT';
    return symbol.replace('/', '');
  }

  onChartSymbolChange(symbol: string) {
    // Update form when chart symbol changes
    const formattedSymbol = symbol.includes('/') ? symbol : symbol.replace('USDT', '/USDT');
    this.configForm.patchValue({ symbol: formattedSymbol });
    this.updateGridConfig();
  }

  // Grid calculation methods removed as grid overlay is no longer needed

  private getClientX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientX;
    } else {
      return event.touches[0]?.clientX || 0;
    }
  }
}
