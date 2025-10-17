import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { ExchangeCredentialsService } from '../../services/exchange-credentials.service';
import { ExchangeCredential, ExchangeType } from '../../models/exchange-credentials.model';

describe('ProfileComponent - Confirmation Modal Tests', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let mockExchangeCredentialsService: jasmine.SpyObj<ExchangeCredentialsService>;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['USER']
  };

  const mockCredential: ExchangeCredential = {
    id: 'cred-123',
    exchange: ExchangeType.BINANCE,
    apiKeyPreview: 'ABC...XYZ',
    label: 'My Binance Account',
    isActive: true,
    userId: '123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    // Create mock services
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'hasRole'], {
      currentUser: jasmine.createSpy().and.returnValue(mockUser)
    });
    mockTranslationService = jasmine.createSpyObj('TranslationService', ['translate', 'setLanguage'], {
      currentLanguage: jasmine.createSpy().and.returnValue('en'),
      availableLanguages: ['en', 'es', 'fr']
    });
    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      currentTheme: jasmine.createSpy().and.returnValue('light')
    });
    mockUserService = jasmine.createSpyObj('UserService', ['updateUser']);
    mockGoogleAuthService = jasmine.createSpyObj('GoogleAuthService', ['linkGoogleAccount']);
    mockExchangeCredentialsService = jasmine.createSpyObj('ExchangeCredentialsService', [
      'fetchCredentials',
      'getCredentialById',
      'createCredential',
      'updateCredential',
      'deleteCredential',
      'testConnection'
    ], {
      credentials: jasmine.createSpy().and.returnValue([])
    });

    // Setup default mock return values
    mockAuthService.logout.and.returnValue(of(void 0));
    mockTranslationService.translate.and.callFake((key: string, params?: any) => key);
    mockExchangeCredentialsService.fetchCredentials.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: UserService, useValue: mockUserService },
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: ExchangeCredentialsService, useValue: mockExchangeCredentialsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============================================================================
  // CONFIRMATION MODAL TESTS
  // ============================================================================

  describe('Confirmation Modal', () => {
    describe('showConfirmation()', () => {
      it('should set all modal properties correctly with full config', () => {
        const mockCallback = jasmine.createSpy('onConfirm');
        const config = {
          title: 'Delete Item',
          message: 'Are you sure you want to delete this item?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          variant: 'danger' as const,
          onConfirm: mockCallback
        };

        component.showConfirmation(config);

        expect(component.confirmModalTitle()).toBe('Delete Item');
        expect(component.confirmModalMessage()).toBe('Are you sure you want to delete this item?');
        expect(component.confirmModalConfirmText()).toBe('Delete');
        expect(component.confirmModalCancelText()).toBe('Cancel');
        expect(component.confirmModalVariant()).toBe('danger');
        expect(component.confirmModalCallback()).toBe(mockCallback);
        expect(component.showConfirmModal()).toBe(true);
      });

      it('should set default values when optional properties are not provided', () => {
        const mockCallback = jasmine.createSpy('onConfirm');
        mockTranslationService.translate.and.callFake((key: string) => {
          const translations: { [key: string]: string } = {
            'modal.confirmTitle': 'Confirm',
            'modal.confirm': 'OK',
            'modal.cancel': 'Cancel'
          };
          return translations[key] || key;
        });

        component.showConfirmation({
          message: 'Proceed with action?',
          onConfirm: mockCallback
        });

        expect(component.confirmModalTitle()).toBe('Confirm');
        expect(component.confirmModalMessage()).toBe('Proceed with action?');
        expect(component.confirmModalConfirmText()).toBe('OK');
        expect(component.confirmModalCancelText()).toBe('Cancel');
        expect(component.confirmModalVariant()).toBe('primary');
        expect(component.confirmModalCallback()).toBe(mockCallback);
        expect(component.showConfirmModal()).toBe(true);
      });

      it('should store the callback function directly without wrapping', () => {
        const mockCallback = jasmine.createSpy('onConfirm');

        component.showConfirmation({
          message: 'Test message',
          onConfirm: mockCallback
        });

        const storedCallback = component.confirmModalCallback();
        expect(storedCallback).toBe(mockCallback);
        expect(typeof storedCallback).toBe('function');
      });

      it('should open the confirmation modal', () => {
        expect(component.showConfirmModal()).toBe(false);

        component.showConfirmation({
          message: 'Test',
          onConfirm: () => {}
        });

        expect(component.showConfirmModal()).toBe(true);
      });

      it('should support warning variant', () => {
        component.showConfirmation({
          message: 'Warning message',
          variant: 'warning',
          onConfirm: () => {}
        });

        expect(component.confirmModalVariant()).toBe('warning');
      });

      it('should support primary variant', () => {
        component.showConfirmation({
          message: 'Primary message',
          variant: 'primary',
          onConfirm: () => {}
        });

        expect(component.confirmModalVariant()).toBe('primary');
      });

      it('should translate title when not provided', () => {
        mockTranslationService.translate.and.callFake((key: string) => {
          if (key === 'modal.confirmTitle') return 'Translated Confirm';
          return key;
        });

        component.showConfirmation({
          message: 'Test',
          onConfirm: () => {}
        });

        expect(mockTranslationService.translate).toHaveBeenCalledWith('modal.confirmTitle');
        expect(component.confirmModalTitle()).toBe('Translated Confirm');
      });

      it('should translate confirm button text when not provided', () => {
        mockTranslationService.translate.and.callFake((key: string) => {
          if (key === 'modal.confirm') return 'Translated OK';
          return key;
        });

        component.showConfirmation({
          message: 'Test',
          onConfirm: () => {}
        });

        expect(mockTranslationService.translate).toHaveBeenCalledWith('modal.confirm');
        expect(component.confirmModalConfirmText()).toBe('Translated OK');
      });

      it('should translate cancel button text when not provided', () => {
        mockTranslationService.translate.and.callFake((key: string) => {
          if (key === 'modal.cancel') return 'Translated Cancel';
          return key;
        });

        component.showConfirmation({
          message: 'Test',
          onConfirm: () => {}
        });

        expect(mockTranslationService.translate).toHaveBeenCalledWith('modal.cancel');
        expect(component.confirmModalCancelText()).toBe('Translated Cancel');
      });
    });

    describe('onConfirmModalConfirm()', () => {
      it('should close the confirmation modal', () => {
        component.showConfirmModal.set(true);

        component.onConfirmModalConfirm();

        expect(component.showConfirmModal()).toBe(false);
      });

      it('should execute the stored callback after closing modal', fakeAsync(() => {
        const mockCallback = jasmine.createSpy('onConfirm');
        component.confirmModalCallback.set(mockCallback);
        component.showConfirmModal.set(true);

        component.onConfirmModalConfirm();

        // Modal should close immediately
        expect(component.showConfirmModal()).toBe(false);
        // Callback should not be called yet
        expect(mockCallback).not.toHaveBeenCalled();

        // Callback should be called after timeout
        tick(0);
        expect(mockCallback).toHaveBeenCalledTimes(1);
      }));

      it('should handle case when no callback is set', fakeAsync(() => {
        component.confirmModalCallback.set(null);
        component.showConfirmModal.set(true);

        expect(() => {
          component.onConfirmModalConfirm();
          tick(0);
        }).not.toThrow();

        expect(component.showConfirmModal()).toBe(false);
      }));

      it('should clear the callback after closing', () => {
        const mockCallback = jasmine.createSpy('onConfirm');
        component.confirmModalCallback.set(mockCallback);

        component.onConfirmModalConfirm();

        expect(component.confirmModalCallback()).toBeNull();
      });

      it('should use setTimeout for proper timing', fakeAsync(() => {
        const mockCallback = jasmine.createSpy('onConfirm');
        component.confirmModalCallback.set(mockCallback);
        component.showConfirmModal.set(true);

        const spySetTimeout = spyOn(window, 'setTimeout').and.callThrough();

        component.onConfirmModalConfirm();

        expect(spySetTimeout).toHaveBeenCalledWith(jasmine.any(Function), 0);

        tick(0);
        expect(mockCallback).toHaveBeenCalled();
      }));

      it('should execute callback with correct context', fakeAsync(() => {
        let executionContext: any = null;
        const mockCallback = function(this: any) {
          executionContext = this;
        };
        component.confirmModalCallback.set(mockCallback);

        component.onConfirmModalConfirm();
        tick(0);

        // Context should be preserved (will be undefined in strict mode or window in non-strict)
        expect(executionContext).toBeDefined();
      }));

      it('should handle callback that throws an error', fakeAsync(() => {
        const errorCallback = jasmine.createSpy('errorCallback').and.throwError('Test error');
        component.confirmModalCallback.set(errorCallback);

        component.onConfirmModalConfirm();

        // Modal should still close
        expect(component.showConfirmModal()).toBe(false);

        // Error should be thrown when callback executes
        expect(() => {
          tick(0);
        }).toThrowError('Test error');
      }));
    });

    describe('onConfirmModalCancel()', () => {
      it('should close the confirmation modal', () => {
        component.showConfirmModal.set(true);

        component.onConfirmModalCancel();

        expect(component.showConfirmModal()).toBe(false);
      });

      it('should NOT execute the callback', fakeAsync(() => {
        const mockCallback = jasmine.createSpy('onConfirm');
        component.confirmModalCallback.set(mockCallback);
        component.showConfirmModal.set(true);

        component.onConfirmModalCancel();

        tick(1000); // Wait for any potential timeouts

        expect(mockCallback).not.toHaveBeenCalled();
      }));

      it('should clear the callback', () => {
        const mockCallback = jasmine.createSpy('onConfirm');
        component.confirmModalCallback.set(mockCallback);

        component.onConfirmModalCancel();

        expect(component.confirmModalCallback()).toBeNull();
      });

      it('should handle multiple cancel calls gracefully', () => {
        component.showConfirmModal.set(true);

        component.onConfirmModalCancel();
        expect(component.showConfirmModal()).toBe(false);

        component.onConfirmModalCancel();
        expect(component.showConfirmModal()).toBe(false);
      });
    });

    describe('closeConfirmModal()', () => {
      it('should set showConfirmModal to false', () => {
        component.showConfirmModal.set(true);

        component.closeConfirmModal();

        expect(component.showConfirmModal()).toBe(false);
      });

      it('should clear the callback', () => {
        const mockCallback = jasmine.createSpy('onConfirm');
        component.confirmModalCallback.set(mockCallback);

        component.closeConfirmModal();

        expect(component.confirmModalCallback()).toBeNull();
      });

      it('should clear all modal state', () => {
        component.showConfirmModal.set(true);
        component.confirmModalCallback.set(() => {});

        component.closeConfirmModal();

        expect(component.showConfirmModal()).toBe(false);
        expect(component.confirmModalCallback()).toBeNull();
      });

      it('should be safe to call when modal is already closed', () => {
        component.showConfirmModal.set(false);
        component.confirmModalCallback.set(null);

        expect(() => {
          component.closeConfirmModal();
        }).not.toThrow();

        expect(component.showConfirmModal()).toBe(false);
        expect(component.confirmModalCallback()).toBeNull();
      });
    });

    // ============================================================================
    // INTEGRATION TESTS
    // ============================================================================

    describe('Integration: Delete Credential Flow', () => {
      it('should show confirmation modal when deleteCredential is called', () => {
        mockTranslationService.translate.and.callFake((key: string, params?: any) => {
          if (key === 'modal.deleteCredentialTitle') return 'Delete Credential';
          if (key === 'modal.deleteCredentialMessage') {
            return `Delete ${params?.exchangeName}${params?.label}?`;
          }
          if (key === 'button.delete') return 'Delete';
          return key;
        });

        component.deleteCredential(mockCredential);

        expect(component.showConfirmModal()).toBe(true);
        expect(component.confirmModalTitle()).toBe('Delete Credential');
        expect(component.confirmModalMessage()).toContain('Binance');
        expect(component.confirmModalConfirmText()).toBe('Delete');
        expect(component.confirmModalVariant()).toBe('danger');
        expect(component.confirmModalCallback()).toBeTruthy();
      });

      it('should delete credential when user confirms', fakeAsync(() => {
        mockExchangeCredentialsService.deleteCredential.and.returnValue(of(void 0));
        mockExchangeCredentialsService.credentials.and.returnValue([]);
        spyOn(component, 'showToast');

        component.deleteCredential(mockCredential);

        expect(component.showConfirmModal()).toBe(true);

        // User confirms deletion
        component.onConfirmModalConfirm();
        tick(0);

        expect(mockExchangeCredentialsService.deleteCredential).toHaveBeenCalledWith('cred-123');
        expect(component.showToast).toHaveBeenCalledWith('Credential deleted successfully!', 'success');
      }));

      it('should NOT delete credential when user cancels', fakeAsync(() => {
        component.deleteCredential(mockCredential);

        expect(component.showConfirmModal()).toBe(true);

        // User cancels deletion
        component.onConfirmModalCancel();
        tick(100);

        expect(mockExchangeCredentialsService.deleteCredential).not.toHaveBeenCalled();
      }));

      it('should show error toast when deletion fails', fakeAsync(() => {
        const errorMessage = 'Network error';
        mockExchangeCredentialsService.deleteCredential.and.returnValue(
          throwError(() => ({ message: errorMessage }))
        );
        spyOn(component, 'showToast');

        component.deleteCredential(mockCredential);
        component.onConfirmModalConfirm();
        tick(0);

        expect(component.showToast).toHaveBeenCalledWith(
          `Failed to delete credential: ${errorMessage}`,
          'error'
        );
      }));

      it('should set deletingCredentialId during deletion', fakeAsync(() => {
        mockExchangeCredentialsService.deleteCredential.and.returnValue(of(void 0));
        mockExchangeCredentialsService.credentials.and.returnValue([]);

        component.deleteCredential(mockCredential);
        component.onConfirmModalConfirm();
        tick(0);

        expect(component.deletingCredentialId()).toBe('cred-123');

        // After successful deletion, it should be cleared
        tick(0);
        expect(component.deletingCredentialId()).toBeNull();
      }));

      it('should include credential label in confirmation message', () => {
        mockTranslationService.translate.and.callFake((key: string, params?: any) => {
          if (key === 'modal.deleteCredentialMessage' && params) {
            return `Delete ${params.exchangeName}${params.label}?`;
          }
          return key;
        });

        const credentialWithLabel = { ...mockCredential, label: 'My Trading Account' };
        component.deleteCredential(credentialWithLabel);

        expect(component.confirmModalMessage()).toContain('My Trading Account');
      });

      it('should handle credential without label', () => {
        mockTranslationService.translate.and.callFake((key: string, params?: any) => {
          if (key === 'modal.deleteCredentialMessage' && params) {
            return `Delete ${params.exchangeName}${params.label}?`;
          }
          return key;
        });

        const credentialWithoutLabel = { ...mockCredential, label: '' };
        component.deleteCredential(credentialWithoutLabel);

        expect(component.confirmModalMessage()).toContain('Binance');
      });
    });

    describe('Integration: Unsaved Changes Flow', () => {
      it('should show confirmation modal when closing Add Credential modal with dirty form', () => {
        mockTranslationService.translate.and.callFake((key: string) => {
          const translations: { [key: string]: string } = {
            'modal.unsavedChangesTitle': 'Unsaved Changes',
            'modal.unsavedChangesMessage': 'You have unsaved changes. Discard?',
            'modal.confirm': 'Discard'
          };
          return translations[key] || key;
        });

        component.newCredentialForm.markAsDirty();
        component.showAddCredentialModal.set(true);

        component.closeAddCredentialModal();

        expect(component.showConfirmModal()).toBe(true);
        expect(component.confirmModalTitle()).toBe('Unsaved Changes');
        expect(component.confirmModalMessage()).toBe('You have unsaved changes. Discard?');
        expect(component.confirmModalVariant()).toBe('warning');
        expect(component.showAddCredentialModal()).toBe(true); // Should still be open
      });

      it('should close Add Credential modal when user confirms discarding changes', fakeAsync(() => {
        component.newCredentialForm.markAsDirty();
        component.showAddCredentialModal.set(true);

        component.closeAddCredentialModal();
        expect(component.showConfirmModal()).toBe(true);

        // User confirms
        component.onConfirmModalConfirm();
        tick(0);

        expect(component.showAddCredentialModal()).toBe(false);
        expect(component.newCredentialForm.pristine).toBe(true);
      }));

      it('should NOT close Add Credential modal when user cancels', fakeAsync(() => {
        component.newCredentialForm.markAsDirty();
        component.showAddCredentialModal.set(true);

        component.closeAddCredentialModal();
        expect(component.showConfirmModal()).toBe(true);

        // User cancels
        component.onConfirmModalCancel();
        tick(100);

        expect(component.showAddCredentialModal()).toBe(true);
        expect(component.newCredentialForm.dirty).toBe(true);
      }));

      it('should close Add Credential modal without confirmation when form is pristine', () => {
        component.newCredentialForm.markAsPristine();
        component.showAddCredentialModal.set(true);

        component.closeAddCredentialModal();

        expect(component.showConfirmModal()).toBe(false);
        expect(component.showAddCredentialModal()).toBe(false);
      });

      it('should reset form after confirming discard', fakeAsync(() => {
        component.newCredentialForm.setValue({
          exchange: ExchangeType.BINANCE,
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          authToken: '',
          label: 'Test'
        });
        component.newCredentialForm.markAsDirty();
        component.showAddCredentialModal.set(true);

        component.closeAddCredentialModal();
        component.onConfirmModalConfirm();
        tick(0);

        expect(component.newCredentialForm.value.apiKey).toBe('');
        expect(component.newCredentialForm.value.apiSecret).toBe('');
      }));
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle rapid open/close of confirmation modal', fakeAsync(() => {
        const callback1 = jasmine.createSpy('callback1');
        const callback2 = jasmine.createSpy('callback2');

        component.showConfirmation({ message: 'First', onConfirm: callback1 });
        component.closeConfirmModal();
        component.showConfirmation({ message: 'Second', onConfirm: callback2 });
        component.onConfirmModalConfirm();
        tick(0);

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledTimes(1);
      }));

      it('should handle confirmation modal opened multiple times before confirming', fakeAsync(() => {
        const callback1 = jasmine.createSpy('callback1');
        const callback2 = jasmine.createSpy('callback2');

        component.showConfirmation({ message: 'First', onConfirm: callback1 });
        component.showConfirmation({ message: 'Second', onConfirm: callback2 });
        component.onConfirmModalConfirm();
        tick(0);

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledTimes(1);
      }));

      it('should handle null callback gracefully', fakeAsync(() => {
        component.confirmModalCallback.set(null);

        expect(() => {
          component.onConfirmModalConfirm();
          tick(0);
        }).not.toThrow();
      }));

      it('should handle undefined callback gracefully', fakeAsync(() => {
        component.confirmModalCallback.set(undefined as any);

        expect(() => {
          component.onConfirmModalConfirm();
          tick(0);
        }).not.toThrow();
      }));

      it('should maintain signal reactivity when updating modal state', () => {
        const callback = jasmine.createSpy('callback');

        component.showConfirmation({ message: 'Test', onConfirm: callback });
        fixture.detectChanges();

        expect(component.showConfirmModal()).toBe(true);

        component.closeConfirmModal();
        fixture.detectChanges();

        expect(component.showConfirmModal()).toBe(false);
      });

      it('should handle confirmation callback that modifies component state', fakeAsync(() => {
        let callbackExecuted = false;
        const callback = () => {
          callbackExecuted = true;
          component.activeTab.set('platforms');
        };

        component.showConfirmation({ message: 'Test', onConfirm: callback });
        component.onConfirmModalConfirm();
        tick(0);

        expect(callbackExecuted).toBe(true);
        expect(component.activeTab()).toBe('platforms');
      }));

      it('should handle confirmation callback that triggers another confirmation', fakeAsync(() => {
        const nestedCallback = jasmine.createSpy('nestedCallback');
        const outerCallback = () => {
          component.showConfirmation({
            message: 'Nested confirmation',
            onConfirm: nestedCallback
          });
        };

        component.showConfirmation({ message: 'Outer', onConfirm: outerCallback });
        component.onConfirmModalConfirm();
        tick(0);

        expect(component.showConfirmModal()).toBe(true);
        expect(component.confirmModalMessage()).toBe('Nested confirmation');

        component.onConfirmModalConfirm();
        tick(0);

        expect(nestedCallback).toHaveBeenCalled();
      }));

      it('should preserve variant type across modal lifecycle', () => {
        component.showConfirmation({
          message: 'Test',
          variant: 'danger',
          onConfirm: () => {}
        });

        expect(component.confirmModalVariant()).toBe('danger');

        component.onConfirmModalCancel();

        // Open another modal with different variant
        component.showConfirmation({
          message: 'Test 2',
          variant: 'warning',
          onConfirm: () => {}
        });

        expect(component.confirmModalVariant()).toBe('warning');
      });

      it('should handle callback that returns a value', fakeAsync(() => {
        const callbackWithReturn = jasmine.createSpy('callbackWithReturn').and.returnValue('some value');
        component.confirmModalCallback.set(callbackWithReturn);

        component.onConfirmModalConfirm();
        tick(0);

        expect(callbackWithReturn).toHaveBeenCalled();
      }));

      it('should handle async callback', fakeAsync(() => {
        let asyncCompleted = false;
        const asyncCallback = async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          asyncCompleted = true;
        };

        component.confirmModalCallback.set(asyncCallback);
        component.onConfirmModalConfirm();
        tick(0);

        // Callback should be called but might not complete yet
        tick(100);
        expect(asyncCompleted).toBe(true);
      }));
    });

    describe('Modal State Management', () => {
      it('should initialize all modal signals with correct default values', () => {
        expect(component.showConfirmModal()).toBe(false);
        expect(component.confirmModalTitle()).toBe('');
        expect(component.confirmModalMessage()).toBe('');
        expect(component.confirmModalConfirmText()).toBe('');
        expect(component.confirmModalCancelText()).toBe('');
        expect(component.confirmModalVariant()).toBe('primary');
        expect(component.confirmModalCallback()).toBeNull();
      });

      it('should update all signals when showConfirmation is called', () => {
        const callback = jasmine.createSpy('callback');
        component.showConfirmation({
          title: 'Custom Title',
          message: 'Custom Message',
          confirmText: 'Yes',
          cancelText: 'No',
          variant: 'danger',
          onConfirm: callback
        });

        expect(component.showConfirmModal()).toBe(true);
        expect(component.confirmModalTitle()).toBe('Custom Title');
        expect(component.confirmModalMessage()).toBe('Custom Message');
        expect(component.confirmModalConfirmText()).toBe('Yes');
        expect(component.confirmModalCancelText()).toBe('No');
        expect(component.confirmModalVariant()).toBe('danger');
        expect(component.confirmModalCallback()).toBe(callback);
      });

      it('should only clear necessary signals when modal closes', () => {
        component.showConfirmation({
          title: 'Test',
          message: 'Message',
          confirmText: 'OK',
          cancelText: 'Cancel',
          variant: 'warning',
          onConfirm: () => {}
        });

        component.closeConfirmModal();

        expect(component.showConfirmModal()).toBe(false);
        expect(component.confirmModalCallback()).toBeNull();
        // Other signals may retain their values (implementation detail)
      });

      it('should handle signal updates in correct order during confirm', fakeAsync(() => {
        const executionOrder: string[] = [];
        const callback = () => {
          executionOrder.push('callback');
        };

        component.showConfirmation({ message: 'Test', onConfirm: callback });
        executionOrder.push('modal-opened');

        component.onConfirmModalConfirm();
        executionOrder.push('confirm-called');

        expect(component.showConfirmModal()).toBe(false);
        executionOrder.push('modal-closed');

        tick(0);

        expect(executionOrder).toEqual([
          'modal-opened',
          'confirm-called',
          'modal-closed',
          'callback'
        ]);
      }));
    });

    describe('Translation Integration', () => {
      it('should use translation service for all default texts', () => {
        mockTranslationService.translate.and.callFake((key: string) => `translated_${key}`);

        component.showConfirmation({
          message: 'Test message',
          onConfirm: () => {}
        });

        expect(mockTranslationService.translate).toHaveBeenCalledWith('modal.confirmTitle');
        expect(mockTranslationService.translate).toHaveBeenCalledWith('modal.confirm');
        expect(mockTranslationService.translate).toHaveBeenCalledWith('modal.cancel');
      });

      it('should pass parameters to translation service correctly', () => {
        mockTranslationService.translate.and.callFake((key: string, params?: any) => {
          if (params) {
            return `${key}:${JSON.stringify(params)}`;
          }
          return key;
        });

        const credentialWithLabel = { ...mockCredential, label: 'Test Label' };
        component.deleteCredential(credentialWithLabel);

        expect(mockTranslationService.translate).toHaveBeenCalledWith(
          'modal.deleteCredentialMessage',
          jasmine.objectContaining({
            exchangeName: jasmine.any(String),
            label: jasmine.any(String)
          })
        );
      });
    });
  });
});
