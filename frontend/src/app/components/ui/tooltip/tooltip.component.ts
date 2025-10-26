import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';
import { ThemeService } from '../../../services/theme.service';

/**
 * Toast notification component
 *
 * Displays toast notifications at the top-right of the screen
 * Supports multiple variants: error, warning, info, success
 */
@Component({
  selector: 'ui-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  private themeService = inject(ThemeService);

  toasts = this.toastService.getToasts;
  isDarkMode = computed(() => this.themeService.isDark());

  /**
   * Close a toast
   */
  close(toast: Toast): void {
    this.toastService.remove(toast.id);
  }

  /**
   * Get toast classes
   */
  getToastClasses(toast: Toast): string {
    const classes = [
      'toast',
      `toast--${toast.variant}`,
      this.isDarkMode() ? 'toast--dark' : 'toast--light'
    ];
    return classes.join(' ');
  }

  /**
   * Get icon for toast variant
   */
  getIcon(variant: string): string {
    switch (variant) {
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ⓘ';
      case 'success':
        return '✓';
      default:
        return 'ⓘ';
    }
  }
}
