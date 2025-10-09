import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TranslationService } from '../../../services/translation.service';

/**
 * Professional Dialog Component
 *
 * A fully accessible, theme-aware modal dialog component with:
 * - Smooth animations (fade-in overlay, slide-up content)
 * - Focus trap for keyboard navigation
 * - ESC key to close
 * - Backdrop click to close
 * - Mobile-responsive with bottom sheet on small screens
 * - Light/dark theme support using CSS variables
 * - WCAG 2.1 AA compliant accessibility
 */
@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.96)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(20px) scale(0.96)' }))
      ])
    ])
  ]
})
export class DialogComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialogElement') dialogElement?: ElementRef;

  // Inject TranslationService
  protected translationService = inject(TranslationService);

  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private scrollbarWidth: number = 0;

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    if (this.open) {
      this.calculateScrollbarWidth();
      this.addBodyClass();
      this.addEscapeListener();
      this.saveFocusState();
    }
  }

  ngAfterViewInit(): void {
    if (this.open) {
      setTimeout(() => this.setInitialFocus(), 0);
    }
  }

  ngOnDestroy(): void {
    this.removeBodyClass();
    this.removeEscapeListener();
    this.restoreFocusState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        this.calculateScrollbarWidth();
        this.addBodyClass();
        this.addEscapeListener();
        this.saveFocusState();
        setTimeout(() => this.setInitialFocus(), 100);
      } else {
        this.removeBodyClass();
        this.removeEscapeListener();
        this.restoreFocusState();
      }
    }
  }

  onBackdropClick(event: Event): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  onCloseClick(): void {
    if (this.closable) {
      this.closeDialog();
    }
  }

  private closeDialog(): void {
    this.open = false;
    this.openChange.emit(false);
    this.close.emit();
  }

  /**
   * Handle keyboard events for accessibility
   */
  private handleEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open && this.closable) {
      event.preventDefault();
      this.closeDialog();
    }

    // Focus trap - Tab navigation
    if (event.key === 'Tab' && this.open) {
      this.handleTabKey(event);
    }
  };

  /**
   * Implement focus trap for keyboard navigation
   */
  private handleTabKey(event: KeyboardEvent): void {
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: move focus backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move focus forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Update list of focusable elements within the dialog
   */
  private updateFocusableElements(): void {
    const dialog = document.querySelector('.dialog');
    if (!dialog) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      return el.offsetParent !== null && // Element is visible
             !el.hasAttribute('disabled') &&
             el.tabIndex !== -1;
    });
  }

  /**
   * Set initial focus when dialog opens
   */
  private setInitialFocus(): void {
    this.updateFocusableElements();

    if (this.focusableElements.length > 0) {
      // Focus the first focusable element (usually the close button or first input)
      this.focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the dialog itself
      const dialog = document.querySelector('.dialog') as HTMLElement;
      if (dialog) {
        dialog.focus();
      }
    }
  }

  /**
   * Save the currently focused element before opening dialog
   */
  private saveFocusState(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  /**
   * Restore focus to the previously focused element after closing dialog
   */
  private restoreFocusState(): void {
    if (this.previousActiveElement && this.previousActiveElement.focus) {
      setTimeout(() => {
        this.previousActiveElement?.focus();
        this.previousActiveElement = null;
      }, 0);
    }
  }

  /**
   * Calculate scrollbar width to prevent layout shift
   */
  private calculateScrollbarWidth(): void {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    this.scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);
  }

  private addEscapeListener(): void {
    document.addEventListener('keydown', this.handleEscape);
  }

  private removeEscapeListener(): void {
    document.removeEventListener('keydown', this.handleEscape);
  }

  private addBodyClass(): void {
    document.body.classList.add('dialog-open');
    // Prevent layout shift by adding padding equal to scrollbar width
    if (this.scrollbarWidth > 0) {
      document.body.style.paddingRight = `${this.scrollbarWidth}px`;
    }
  }

  private removeBodyClass(): void {
    document.body.classList.remove('dialog-open');
    document.body.style.paddingRight = '';
  }

  getDialogClasses(): string {
    const classes = ['dialog'];
    classes.push(`dialog-${this.size}`);
    return classes.join(' ');
  }
}

@Component({
  selector: 'ui-dialog-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.css']
})
export class DialogHeaderComponent {}

@Component({
  selector: 'ui-dialog-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-title.component.html',
  styleUrls: ['./dialog-title.component.css']
})
export class DialogTitleComponent {}

@Component({
  selector: 'ui-dialog-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css']
})
export class DialogContentComponent {}

@Component({
  selector: 'ui-dialog-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-footer.component.html',
  styleUrls: ['./dialog-footer.component.css']
})
export class DialogFooterComponent {}