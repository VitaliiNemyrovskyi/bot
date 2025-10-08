import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'link' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Custom Button Component
 *
 * Features:
 * - Theme support (light/dark mode)
 * - Multiple variants (primary, secondary, tertiary, danger, link, ghost)
 * - Multiple sizes (small, medium, large)
 * - Loading state with spinner
 * - Disabled state
 * - Icon-only mode
 * - Full-width mode
 * - Custom className support
 *
 * @example
 * ```html
 * <ui-button
 *   variant="primary"
 *   size="medium"
 *   [loading]="isLoading"
 *   [disabled]="isDisabled"
 *   (clicked)="handleClick()">
 *   Click Me
 * </ui-button>
 * ```
 */
@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() iconOnly = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() className = '';

  @Output() clicked = new EventEmitter<Event>();

  // Inject theme service
  private themeService = inject(ThemeService);
  isDarkMode = computed(() => this.themeService.isDark());

  /**
   * Handle button click
   */
  handleClick(event: Event): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }

  /**
   * Get button classes
   */
  getButtonClasses(): string {
    const classes = [
      'ui-button',
      `ui-button--${this.variant}`,
      `ui-button--${this.size}`,
      this.isDarkMode() ? 'ui-button--dark' : 'ui-button--light'
    ];

    if (this.disabled) classes.push('ui-button--disabled');
    if (this.loading) classes.push('ui-button--loading');
    if (this.iconOnly) classes.push('ui-button--icon-only');
    if (this.fullWidth) classes.push('ui-button--full-width');
    if (this.className) classes.push(this.className);

    return classes.join(' ');
  }
}
