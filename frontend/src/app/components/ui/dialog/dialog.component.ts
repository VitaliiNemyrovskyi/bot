import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  // Inject TranslationService
  protected translationService = inject(TranslationService);

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    if (this.open) {
      this.addBodyClass();
      this.addEscapeListener();
    }
  }

  ngOnDestroy(): void {
    this.removeBodyClass();
    this.removeEscapeListener();
  }

  ngOnChanges(): void {
    if (this.open) {
      this.addBodyClass();
      this.addEscapeListener();
    } else {
      this.removeBodyClass();
      this.removeEscapeListener();
    }
  }

  onBackdropClick(event: Event): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  onCloseClick(): void {
    this.closeDialog();
  }

  private closeDialog(): void {
    this.open = false;
    this.openChange.emit(false);
    this.close.emit();
  }

  private handleEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open && this.closable) {
      this.closeDialog();
    }
  };

  private addEscapeListener(): void {
    document.addEventListener('keydown', this.handleEscape);
  }

  private removeEscapeListener(): void {
    document.removeEventListener('keydown', this.handleEscape);
  }

  private addBodyClass(): void {
    document.body.classList.add('dialog-open');
  }

  private removeBodyClass(): void {
    document.body.classList.remove('dialog-open');
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