import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() error: string = '';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() fullWidth: boolean = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;

  value: any = '';
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

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  getInputClasses(): string {
    const classes = ['input'];

    classes.push(`input-${this.size}`);

    if (this.error) {
      classes.push('input-error');
    }

    if (this.fullWidth) {
      classes.push('input-full-width');
    }

    if (this.icon) {
      classes.push(`input-with-icon-${this.iconPosition}`);
    }

    return classes.join(' ');
  }

  getWrapperClasses(): string {
    const classes = ['input-wrapper'];

    if (this.fullWidth) {
      classes.push('input-wrapper-full-width');
    }

    return classes.join(' ');
  }
}

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getWrapperClasses()">
      <label *ngIf="label" class="input-label">{{ label }}</label>
      <div class="textarea-container">
        <textarea
          [class]="getTextareaClasses()"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [rows]="rows"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()">
        </textarea>
      </div>
      <div *ngIf="error" class="input-error-text">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() error: string = '';
  @Input() disabled: boolean = false;
  @Input() rows: number = 4;
  @Input() fullWidth: boolean = false;

  value: any = '';
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

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  getTextareaClasses(): string {
    const classes = ['textarea'];

    if (this.error) {
      classes.push('textarea-error');
    }

    if (this.fullWidth) {
      classes.push('textarea-full-width');
    }

    return classes.join(' ');
  }

  getWrapperClasses(): string {
    const classes = ['input-wrapper'];

    if (this.fullWidth) {
      classes.push('input-wrapper-full-width');
    }

    return classes.join(' ');
  }
}