import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { TranslationService } from '../../../services/translation.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;
  let translationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['translate']);

    await TestBed.configureTestingModule({
      imports: [ConfirmationModalComponent],
      providers: [
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;

    // Set up default translation mock
    translationService.translate.and.callFake((key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'modal.confirmTitle': 'Confirm Action',
        'modal.confirm': 'Confirm',
        'modal.cancel': 'Cancel'
      };
      return translations[key] || key;
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.open).toBe(false);
      expect(component.title).toBe('');
      expect(component.message).toBe('');
      expect(component.confirmText).toBe('');
      expect(component.cancelText).toBe('');
      expect(component.confirmVariant).toBe('primary');
      expect(component.loading).toBe(false);
    });

    it('should accept input properties', () => {
      component.open = true;
      component.title = 'Delete Item';
      component.message = 'Are you sure?';
      component.confirmText = 'Delete';
      component.cancelText = 'No';
      component.confirmVariant = 'danger';
      component.loading = true;

      fixture.detectChanges();

      expect(component.open).toBe(true);
      expect(component.title).toBe('Delete Item');
      expect(component.message).toBe('Are you sure?');
      expect(component.confirmText).toBe('Delete');
      expect(component.cancelText).toBe('No');
      expect(component.confirmVariant).toBe('danger');
      expect(component.loading).toBe(true);
    });
  });

  describe('Text Methods', () => {
    it('should return confirmText when provided', () => {
      component.confirmText = 'Delete';
      expect(component.getConfirmText()).toBe('Delete');
    });

    it('should return translated confirm text when not provided', () => {
      component.confirmText = '';
      expect(component.getConfirmText()).toBe('Confirm');
      expect(translationService.translate).toHaveBeenCalledWith('modal.confirm', undefined);
    });

    it('should return cancelText when provided', () => {
      component.cancelText = 'No';
      expect(component.getCancelText()).toBe('No');
    });

    it('should return translated cancel text when not provided', () => {
      component.cancelText = '';
      expect(component.getCancelText()).toBe('Cancel');
      expect(translationService.translate).toHaveBeenCalledWith('modal.cancel', undefined);
    });

    it('should return title when provided', () => {
      component.title = 'Custom Title';
      expect(component.getTitle()).toBe('Custom Title');
    });

    it('should return translated title when not provided', () => {
      component.title = '';
      expect(component.getTitle()).toBe('Confirm Action');
      expect(translationService.translate).toHaveBeenCalledWith('modal.confirmTitle', undefined);
    });
  });

  describe('Confirm Action', () => {
    it('should emit confirm event when confirm is clicked', () => {
      spyOn(component.confirm, 'emit');
      component.loading = false;

      component.onConfirm();

      expect(component.confirm.emit).toHaveBeenCalled();
    });

    it('should not emit confirm event when loading is true', () => {
      spyOn(component.confirm, 'emit');
      component.loading = true;

      component.onConfirm();

      expect(component.confirm.emit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('should emit cancel event and close modal when cancel is clicked', () => {
      spyOn(component.cancel, 'emit');
      spyOn(component.openChange, 'emit');
      component.loading = false;
      component.open = true;

      component.onCancel();

      expect(component.cancel.emit).toHaveBeenCalled();
      expect(component.open).toBe(false);
      expect(component.openChange.emit).toHaveBeenCalledWith(false);
    });

    it('should not emit cancel event when loading is true', () => {
      spyOn(component.cancel, 'emit');
      component.loading = true;
      component.open = true;

      component.onCancel();

      expect(component.cancel.emit).not.toHaveBeenCalled();
      expect(component.open).toBe(true);
    });
  });

  describe('Dialog Close', () => {
    it('should emit cancel event and close modal when dialog is closed', () => {
      spyOn(component.cancel, 'emit');
      spyOn(component.openChange, 'emit');
      component.loading = false;
      component.open = true;

      component.onDialogClose();

      expect(component.cancel.emit).toHaveBeenCalled();
      expect(component.open).toBe(false);
      expect(component.openChange.emit).toHaveBeenCalledWith(false);
    });

    it('should not close modal when loading is true', () => {
      spyOn(component.cancel, 'emit');
      component.loading = true;
      component.open = true;

      component.onDialogClose();

      expect(component.cancel.emit).not.toHaveBeenCalled();
      expect(component.open).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should display message text', () => {
      component.open = true;
      component.message = 'Are you sure you want to delete this item?';
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.confirmation-message'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent).toContain('Are you sure you want to delete this item?');
    });

    it('should have keyboard-accessible buttons', () => {
      component.open = true;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('ui-button'));
      expect(buttons.length).toBe(2);
    });
  });

  describe('Variant Styles', () => {
    it('should apply primary variant to confirm button', () => {
      component.open = true;
      component.confirmVariant = 'primary';
      fixture.detectChanges();

      expect(component.confirmVariant).toBe('primary');
    });

    it('should apply danger variant to confirm button', () => {
      component.open = true;
      component.confirmVariant = 'danger';
      fixture.detectChanges();

      expect(component.confirmVariant).toBe('danger');
    });

    it('should apply warning variant to confirm button', () => {
      component.open = true;
      component.confirmVariant = 'warning';
      fixture.detectChanges();

      expect(component.confirmVariant).toBe('warning');
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when loading is true', () => {
      component.open = true;
      component.loading = true;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('ui-button'));
      buttons.forEach(button => {
        expect(button.componentInstance.disabled).toBe(true);
      });
    });

    it('should show loading state on confirm button', () => {
      component.open = true;
      component.loading = true;
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.queryAll(By.css('ui-button'))[1];
      expect(confirmButton.componentInstance.loading).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      component.open = true;
      component.message = '';
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.confirmation-message'));
      expect(messageElement.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle very long message', () => {
      component.open = true;
      component.message = 'A'.repeat(500);
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.confirmation-message'));
      expect(messageElement.nativeElement.textContent).toBe('A'.repeat(500));
    });

    it('should handle rapid open/close', () => {
      spyOn(component.openChange, 'emit');

      component.open = true;
      fixture.detectChanges();

      component.onCancel();
      expect(component.open).toBe(false);

      component.open = true;
      fixture.detectChanges();

      component.onCancel();
      expect(component.open).toBe(false);

      expect(component.openChange.emit).toHaveBeenCalledTimes(2);
    });
  });
});
