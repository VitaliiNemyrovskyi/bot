import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Slider Component
 *
 * A range slider input component with modern styling and customizable options.
 * Supports ngModel two-way binding.
 *
 * @example
 * <ui-slider
 *   [(ngModel)]="value"
 *   [min]="0"
 *   [max]="100"
 *   [step]="1"
 *   label="Volume"
 *   [disabled]="false"
 * ></ui-slider>
 */
@Component({
  selector: 'ui-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ]
})
export class SliderComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() disabled: boolean = false;
  @Input() showValue: boolean = true;
  @Input() showLabels: boolean = true;
  @Input() formatValue?: (value: number) => string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  value = signal<number>(0);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Write value from ngModel
   */
  writeValue(value: number): void {
    if (value !== null && value !== undefined) {
      this.value.set(value);
    }
  }

  /**
   * Register change callback
   */
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  /**
   * Register touched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Handle disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Handle slider change
   */
  onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const numValue = parseFloat(target.value);
    this.value.set(numValue);
    this.onChange(numValue);
    this.onTouched();
  }

  /**
   * Get formatted value for display
   */
  getFormattedValue(): string {
    if (this.formatValue) {
      return this.formatValue(this.value());
    }
    return this.value().toString();
  }

  /**
   * Calculate percentage for slider track fill
   */
  getPercentage(): number {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value() - this.min) / range) * 100;
  }
}
