import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { ButtonComponent } from '../button/button.component';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'ui-confirmation-modal',
  standalone: true,
  imports: [CommonModule, DialogComponent, ButtonComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = '';
  @Input() cancelText: string = '';
  @Input() confirmVariant: 'primary' | 'danger' | 'warning' = 'primary';
  @Input() loading: boolean = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected translationService = inject(TranslationService);

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  onConfirm(): void {
    if (!this.loading) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.loading) {
      this.cancel.emit();
      this.closeModal();
    }
  }

  onDialogClose(): void {
    if (!this.loading) {
      this.cancel.emit();
      this.closeModal();
    }
  }

  private closeModal(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  getConfirmText(): string {
    return this.confirmText || this.translate('modal.confirm');
  }

  getCancelText(): string {
    return this.cancelText || this.translate('modal.cancel');
  }

  getTitle(): string {
    return this.title || this.translate('modal.confirmTitle');
  }
}
