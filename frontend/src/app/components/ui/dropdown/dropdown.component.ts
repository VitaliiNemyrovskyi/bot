import { Component, Input, Output, EventEmitter, forwardRef, signal, computed, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../../pipes';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

/**
 * Custom Dropdown Component
 *
 * Features:
 * - Theme support (light/dark mode)
 * - Built-in search functionality
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Reactive Forms support (ControlValueAccessor)
 * - Customizable styling
 * - Disabled state support
 * - Icon support for options
 *
 * @example
 * ```html
 * <ui-dropdown
 *   [options]="options"
 *   [(ngModel)]="selectedValue"
 *   [searchable]="true"
 *   placeholder="Select an option"
 *   (selectionChange)="onSelect($event)">
 * </ui-dropdown>
 * ```
 */
@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() searchable: boolean = true;
  @Input() showClearButton: boolean = true;
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() width: 'normal' | 'medium' | 'wide' = 'normal';
  @Input() searchPlaceholder: string = 'Search...';

  @Output() selectionChange = new EventEmitter<string>();

  // Internal state
  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedValue = signal<string | null>(null);
  highlightedIndex = signal<number>(-1);

  // Theme integration
  readonly currentTheme = this.themeService.currentTheme;
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  // Filtered options based on search
  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.options;

    return this.options.filter(option =>
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    );
  });

  // Selected option display
  selectedOption = computed(() => {
    const value = this.selectedValue();
    return this.options.find(opt => opt.value === value);
  });

  // ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private themeService: ThemeService,
    private elementRef: ElementRef,
    public sanitizer: DomSanitizer
  ) {
    // Close dropdown when clicking outside
    effect((onCleanup) => {
      if (this.isOpen()) {
        const clickHandler = (event: MouseEvent) => {
          if (!this.elementRef.nativeElement.contains(event.target)) {
            this.close();
          }
        };

        setTimeout(() => {
          document.addEventListener('click', clickHandler);
        });

        onCleanup(() => {
          document.removeEventListener('click', clickHandler);
        });
      }
    });
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue.set(value);
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

  // Dropdown actions
  toggle(): void {
    if (this.disabled) return;

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled) return;
    this.isOpen.set(true);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);

    // Focus search input after dropdown opens
    if (this.searchable) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 100);
    }
  }

  close(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.isOpen.set(false);
      this.searchQuery.set('');
      this.highlightedIndex.set(-1);
    });
    this.onTouched();
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) return;

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.close();
  }

  // Search functionality
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.highlightedIndex.set(0); // Reset highlight to first result
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    const filtered = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          const nextIndex = Math.min(this.highlightedIndex() + 1, filtered.length - 1);
          this.highlightedIndex.set(nextIndex);
          this.scrollToHighlighted();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          const prevIndex = Math.max(this.highlightedIndex() - 1, 0);
          this.highlightedIndex.set(prevIndex);
          this.scrollToHighlighted();
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.isOpen()) {
          const highlighted = filtered[this.highlightedIndex()];
          if (highlighted) {
            this.selectOption(highlighted);
          }
        } else {
          this.open();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        break;

      case 'Tab':
        this.close();
        break;
    }
  }

  private scrollToHighlighted(): void {
    setTimeout(() => {
      const highlightedEl = this.elementRef.nativeElement.querySelector('.option.highlighted');
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  // Utility methods
  isSelected(option: DropdownOption): boolean {
    return this.selectedValue() === option.value;
  }

  isHighlighted(index: number): boolean {
    return this.highlightedIndex() === index;
  }

  onOptionHover(index: number): void {
    this.highlightedIndex.set(index);
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedValue.set(null);
    this.onChange(null);
    this.selectionChange.emit('');
  }
}
