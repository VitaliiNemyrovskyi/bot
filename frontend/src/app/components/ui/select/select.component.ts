import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = '';
  @Input() error: string = '';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() fullWidth: boolean = false;
  @Input() multiple: boolean = false;

  value: any = null;
  touched: boolean = false;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;

    if (this.multiple) {
      const selectedOptions = Array.from(target.selectedOptions).map(option => option.value);
      this.value = selectedOptions;
    } else {
      this.value = target.value;
    }

    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  getSelectClasses(): string {
    const classes = ['select'];

    classes.push(`select-${this.size}`);

    if (this.error) {
      classes.push('select-error');
    }

    if (this.fullWidth) {
      classes.push('select-full-width');
    }

    return classes.join(' ');
  }

  getWrapperClasses(): string {
    const classes = ['select-wrapper'];

    if (this.fullWidth) {
      classes.push('select-wrapper-full-width');
    }

    return classes.join(' ');
  }

  isSelected(optionValue: any): boolean {
    if (this.multiple && Array.isArray(this.value)) {
      return this.value.includes(optionValue);
    }
    return this.value === optionValue;
  }
}