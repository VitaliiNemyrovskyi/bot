import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'error' | 'warning' | 'info' | 'success';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

/**
 * Toast notification service
 *
 * Manages toast notifications without external dependencies
 * Supports multiple toast variants: error, warning, info, success
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  private toasts = signal<Toast[]>([]);

  /**
   * Get all active toasts
   */
  getToasts = this.toasts.asReadonly();

  /**
   * Show a toast notification
   */
  show(message: string, variant: ToastVariant = 'info', duration: number = 5000): void {
    const id = ++this.toastIdCounter;
    const toast: Toast = { id, message, variant, duration };

    // Add toast
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 10000);
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration || 7000);
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration || 5000);
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration || 5000);
  }

  /**
   * Remove a toast by ID
   */
  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts.set([]);
  }
}
