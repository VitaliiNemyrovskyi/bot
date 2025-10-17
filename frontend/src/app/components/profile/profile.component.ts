import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Language, TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { ExchangeCredentialsService } from '../../services/exchange-credentials.service';
import {
  CreateExchangeCredentialRequest,
  EXCHANGE_METADATA,
  ExchangeCredential,
  ExchangeType,
  getExchangeName,
  TestConnectionRequest
} from '../../models/exchange-credentials.model';
import { take } from 'rxjs/operators';
import { TradingPlatformInfoModalComponent } from '../trading-platform-info-modal/trading-platform-info-modal.component';
import { ConfirmationModalComponent } from '../ui/confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from '../ui/button/button.component';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface MessageLocal {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'trade';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actions?: MessageActionLocal[];
}

interface MessageActionLocal {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, TradingPlatformInfoModalComponent, ConfirmationModalComponent, ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  // Signals and computed values
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');
  readonly availableLanguages = this.translationService.availableLanguages;
  readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  // Component state
  activeTab = signal<string>('settings');

  // Tab configuration
  tabs: Tab[] = [
    { id: 'settings', label: 'profile.preferences', icon: '⚙️' },
    { id: 'userinfo', label: 'profile.personalInfo', icon: '👤' },
    { id: 'platforms', label: 'profile.tradingPlatforms', icon: '🔗' },
    { id: 'messages', label: 'profile.messages', icon: '📧' }
  ];

  // Settings
  selectedLanguage: Language = 'en';
  selectedCurrency = 'USD';
  emailNotifications = true;
  priceAlerts = true;
  tradingAlerts = false;

  // Forms
  userInfoForm: FormGroup;
  newCredentialForm: FormGroup;

  // Exchange Credentials State
  credentials = signal<ExchangeCredential[]>([]);
  editingCredentialId = signal<string | null>(null);
  editFormData = signal<Partial<ExchangeCredential> & { apiKey?: string; apiSecret?: string; authToken?: string }>({});
  showAddCredentialModal = signal<boolean>(false);
  testingConnectionId = signal<string | null>(null);
  deletingCredentialId = signal<string | null>(null);
  savingCredentialId = signal<string | null>(null);
  showApiSecret = signal<{ [key: string]: boolean }>({});
  revealedCredentials = signal<{ [key: string]: { apiKey?: string; apiSecret?: string } }>({});

  // Toast notification state
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  showToastSignal = signal<boolean>(false);

  // Trading Platform Info Modal state
  showPlatformInfoModal = signal<boolean>(false);
  selectedCredentialForModal = signal<ExchangeCredential | null>(null);

  // Confirmation Modal state
  showConfirmModal = signal<boolean>(false);
  confirmModalTitle = signal<string>('');
  confirmModalMessage = signal<string>('');
  confirmModalConfirmText = signal<string>('');
  confirmModalCancelText = signal<string>('');
  confirmModalVariant = signal<'primary' | 'danger' | 'warning'>('primary');
  confirmModalCallback = signal<(() => void) | null>(null);

  // Enum references for template
  readonly ExchangeType = ExchangeType;
  readonly EXCHANGE_METADATA = EXCHANGE_METADATA;
  readonly getExchangeName = getExchangeName;
  readonly exchanges = Object.values(ExchangeType);

  // Data
  messages: MessageLocal[] = [
    {
      id: '1',
      type: 'trade',
      title: 'Order Filled',
      content: 'Your limit order for 0.5 BTC at $45,000 has been successfully filled.',
      timestamp: new Date('2024-12-12T10:30:00'),
      read: false,
      actions: [
        { label: 'View Order', type: 'primary', action: 'viewOrder' },
        { label: 'Trade More', type: 'secondary', action: 'openTrading' }
      ]
    },
    {
      id: '2',
      type: 'warning',
      title: 'API Key Expiring Soon',
      content: 'Your Binance API key will expire in 7 days. Please renew it to continue trading.',
      timestamp: new Date('2024-12-11T14:15:00'),
      read: false,
      actions: [
        { label: 'Renew Key', type: 'primary', action: 'renewApiKey' }
      ]
    },
    {
      id: '3',
      type: 'success',
      title: 'Security Update',
      content: 'Your account security settings have been successfully updated.',
      timestamp: new Date('2024-12-10T09:00:00'),
      read: true
    },
    {
      id: '4',
      type: 'info',
      title: 'New Feature Available',
      content: 'Check out our new advanced charting tools in the trading dashboard.',
      timestamp: new Date('2024-12-09T16:45:00'),
      read: true,
      actions: [
        { label: 'Learn More', type: 'secondary', action: 'learnMore' }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private translationService: TranslationService,
    private themeService: ThemeService,
    private userService: UserService,
    private googleAuthService: GoogleAuthService,
    public exchangeCredentialsService: ExchangeCredentialsService,
    private router: Router
  ) {
    this.userInfoForm = this.fb.group({
      firstName: ['John'],
      lastName: ['Doe'],
      email: [{ value: this.currentUser()?.email || '', disabled: true }],
      phone: ['+1234567890'],
      timezone: ['UTC']
    });

    this.newCredentialForm = this.fb.group({
      exchange: ['', Validators.required],
      apiKey: ['', Validators.required],
      apiSecret: ['', Validators.required],
      authToken: [''], // Browser session token for MEXC
      label: ['', [Validators.maxLength(50)]]
    });

    this.selectedLanguage = this.translationService.currentLanguage();
  }

  ngOnInit(): void {
    // Initialize component
  }

  // Tab navigation
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);

    // Load credentials when switching to platforms tab
    if (tabId === 'platforms') {
      this.onPlatformsTabActivated();
    }
  }

  // Translation helper
  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  // Settings operations
  changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLanguage = target.value as Language;
    this.translationService.setLanguage(newLanguage);
    this.selectedLanguage = newLanguage;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  changeCurrency(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCurrency = target.value;
    // Save currency preference
    localStorage.setItem('preferred-currency', this.selectedCurrency);
  }

  updateNotificationSettings(): void {
    // Save notification settings
    const settings = {
      email: this.emailNotifications,
      priceAlerts: this.priceAlerts,
      tradingAlerts: this.tradingAlerts
    };
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }

  // User info operations
  updateUserInfo(): void {
    if (this.userInfoForm.valid) {
      console.log('Updating user info:', this.userInfoForm.value);
      // Simulate API call
      this.showToast('User information updated successfully!', 'success');
      this.userInfoForm.markAsPristine();
    }
  }

  resetUserInfo(): void {
    this.userInfoForm.reset();
  }

  changeAvatar(): void {
    // Open file picker or avatar selection modal
    console.log('Change avatar clicked');
    this.showToast('Avatar change functionality would be implemented here', 'info');
  }

  linkGoogleAccount(): void {
    this.googleAuthService.linkGoogleAccount().subscribe({
      next: (response) => {
        if (response.success) {
          this.showToast(`Google account linked successfully! ${response.message}`, 'success');
          // Refresh user data or update UI as needed
        } else {
          this.showToast(`Failed to link Google account: ${response.message}`, 'error');
        }
      },
      error: (error) => {
        console.error('Error linking Google account:', error);
        this.showToast('Failed to link Google account. Please try again.', 'error');
      }
    });
  }

  // Messages operations
  markAsRead(messageId: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
    }
  }

  markAllAsRead(): void {
    this.messages.forEach(message => message.read = true);
  }

  executeMessageAction(action: MessageActionLocal): void {
    console.log('Executing action:', action);
    switch (action.action) {
      case 'viewOrder':
        this.showToast('Would navigate to order details', 'info');
        break;
      case 'openTrading':
        this.showToast('Would open trading interface', 'info');
        break;
      case 'renewApiKey':
        this.showToast('Would open API key renewal process', 'info');
        break;
      case 'learnMore':
        this.showToast('Would show feature information', 'info');
        break;
    }
  }

  // Logout functionality
  logout(): void {
    this.authService.logout().pipe(take(1)).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  // ============================================================================
  // EXCHANGE CREDENTIALS METHODS
  // ============================================================================

  /**
   * Load credentials when tab opens
   */
  loadCredentials(): void {
    this.exchangeCredentialsService.fetchCredentials().subscribe({
      next: (creds) => {
        this.credentials.set(creds);
      },
      error: (err) => {
        console.error('Failed to load credentials:', err);
        this.showToast('Failed to load exchange credentials. Please try again.', 'error');
      }
    });
  }

  /**
   * Start editing a credential row
   */
  startEditCredential(credential: ExchangeCredential): void {
    this.editingCredentialId.set(credential.id);
    this.editFormData.set({
      label: credential.label,
      apiKey: '',  // Empty string means "keep current"
      apiSecret: '',  // Empty string means "keep current"
      authToken: '',  // Empty string means "keep current"
      // Store original values for canceling
      _originalLabel: credential.label
    } as any);
  }

  /**
   * Test connection with edited values
   */
  testEditConnection(credential: ExchangeCredential): void {
    const editData = this.editFormData();

    // Get the revealed credentials
    const revealed = this.revealedCredentials()[credential.id];

    // Determine which API key and secret to use
    let apiKey: string;
    let apiSecret: string;

    // If user entered new values, use those
    if (editData.apiKey && editData.apiKey.trim() !== '') {
      apiKey = editData.apiKey.trim();
    } else if (revealed?.apiKey) {
      // Use revealed stored value
      apiKey = revealed.apiKey;
    } else {
      // Need to fetch the credential first
      console.log('No API key available, need to reveal first');
      this.showToast('Please click the eye icon to reveal the API Key first', 'warning');
      return;
    }

    if (editData.apiSecret && editData.apiSecret.trim() !== '') {
      apiSecret = editData.apiSecret.trim();
    } else if (revealed?.apiSecret) {
      apiSecret = revealed.apiSecret;
    } else {
      console.log('No API secret available, need to reveal first');
      this.showToast('Please click the eye icon to reveal the API Secret first', 'warning');
      return;
    }

    const testData: TestConnectionRequest = {
      exchange: credential.exchange,
      apiKey: apiKey,
      apiSecret: apiSecret,
      authToken: editData.authToken && editData.authToken.trim() !== '' ? editData.authToken.trim() : undefined
    };

    this.testingConnectionId.set(credential.id);

    this.exchangeCredentialsService.testConnection(testData).subscribe({
      next: (result) => {
        this.testingConnectionId.set(null);
        if (result.success) {
          this.showToast('Connection successful! You can now save the credentials.', 'success');
        } else {
          this.showToast('Connection failed: ' + (result.message || 'Unknown error'), 'error');
        }
      },
      error: (err) => {
        this.testingConnectionId.set(null);
        this.showToast('Connection test failed: ' + (err.message || 'Unknown error'), 'error');
      }
    });
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.editingCredentialId.set(null);
    this.editFormData.set({});
  }

  /**
   * Save edited credential
   */
  saveCredential(credentialId: string): void {
    const editData = this.editFormData();

    // Build update request with only changed fields
    const updateRequest: any = {};

    // Always include label (even if empty)
    if (editData.label !== undefined) {
      updateRequest.label = editData.label || undefined;
    }

    // Include apiKey only if it was changed (non-empty)
    if (editData.apiKey && editData.apiKey.trim() !== '') {
      updateRequest.apiKey = editData.apiKey.trim();
    }

    // Include apiSecret only if it was changed (non-empty)
    if (editData.apiSecret && editData.apiSecret.trim() !== '') {
      updateRequest.apiSecret = editData.apiSecret.trim();
    }

    // Include authToken only if it was changed (non-empty)
    if (editData.authToken && editData.authToken.trim() !== '') {
      updateRequest.authToken = editData.authToken.trim();
    }

    // Set saving state
    this.savingCredentialId.set(credentialId);

    this.exchangeCredentialsService.updateCredential(credentialId, updateRequest).pipe(take(1)).subscribe({
      next: (updated) => {
        // Clear editing and saving state first
        this.editingCredentialId.set(null);
        this.editFormData.set({});
        this.savingCredentialId.set(null);

        // Clear visibility toggles for this credential
        const currentVisibility = this.showApiSecret();
        const updatedVisibility = { ...currentVisibility };
        delete updatedVisibility[credentialId + '_key'];
        delete updatedVisibility[credentialId + '_secret'];
        this.showApiSecret.set(updatedVisibility);

        // Service already updated the state - sync local component state
        this.credentials.set(this.exchangeCredentialsService.credentials());

        this.showToast('Credential updated successfully!', 'success');
      },
      error: (err) => {
        console.error('Failed to update credential:', err);
        this.savingCredentialId.set(null);
        this.showToast('Failed to update credential: ' + err.message, 'error');
      }
    });
  }

  /**
   * Update edit form data
   */
  updateEditField(field: string, value: any): void {
    this.editFormData.set({
      ...this.editFormData(),
      [field]: value
    });
  }

  /**
   * Test connection for a credential
   */
  testConnection(credential: ExchangeCredential): void {
    this.testingConnectionId.set(credential.id);

    // Note: We can't test existing credentials without the secret
    // We need to show a message about this
    this.showToast('Connection testing requires API secret. Please use the "Add New Credential" form to test connections before saving.', 'info');
    this.testingConnectionId.set(null);
  }

  /**
   * Delete a credential
   */
  deleteCredential(credential: ExchangeCredential): void {
    const exchangeName = this.getExchangeName(credential.exchange);
    const labelPart = credential.label ? ` "${credential.label}"` : '';

    this.showConfirmation({
      title: this.translate('modal.deleteCredentialTitle'),
      message: this.translate('modal.deleteCredentialMessage', {
        exchangeName: exchangeName,
        label: labelPart
      }),
      confirmText: this.translate('button.delete'),
      variant: 'danger',
      onConfirm: () => {
        this.deletingCredentialId.set(credential.id);

        this.exchangeCredentialsService.deleteCredential(credential.id).subscribe({
          next: () => {
            // Service already updated the state - sync local component state
            this.credentials.set(this.exchangeCredentialsService.credentials());
            this.deletingCredentialId.set(null);

            this.showToast('Credential deleted successfully!', 'success');
          },
          error: (err) => {
            console.error('Failed to delete credential:', err);
            this.deletingCredentialId.set(null);
            this.showToast('Failed to delete credential: ' + err.message, 'error');
          }
        });
      }
    });
  }

  /**
   * Toggle active status
   */
  toggleActive(credential: ExchangeCredential, e: Event): void {
    const isChecked = (e.target as HTMLInputElement).checked;

    this.exchangeCredentialsService.updateCredential(credential.id, { isActive: isChecked })
      .pipe(take(1)).subscribe({
      next: (updated) => {
        // Service already updated the state - sync local component state
        this.credentials.set(this.exchangeCredentialsService.credentials());

        this.showToast(`Credential ${isChecked ? 'activated' : 'deactivated'} successfully!`, 'success');
      },
      error: (err) => {
        console.error('Failed to toggle credential:', err);
        this.showToast('Failed to toggle credential: ' + err.message, 'error');
      }
    });
  }

  /**
   * Open add credential modal
   */
  openAddCredentialModal(): void {
    this.newCredentialForm.reset({
      exchange: '',
      apiKey: '',
      apiSecret: '',
      authToken: '',
      label: ''
    });
    this.showAddCredentialModal.set(true);
  }

  /**
   * Close add credential modal
   */
  closeAddCredentialModal(): void {
    if (this.newCredentialForm.dirty) {
      this.showConfirmation({
        title: this.translate('modal.unsavedChangesTitle'),
        message: this.translate('modal.unsavedChangesMessage'),
        confirmText: this.translate('modal.confirm'),
        variant: 'warning',
        onConfirm: () => {
          this.showAddCredentialModal.set(false);
          this.newCredentialForm.reset();
        }
      });
    } else {
      this.showAddCredentialModal.set(false);
      this.newCredentialForm.reset();
    }
  }

  /**
   * Test connection in the add form
   */
  testNewConnection(): void {
    if (this.newCredentialForm.invalid) {
      Object.keys(this.newCredentialForm.controls).forEach(key => {
        this.newCredentialForm.get(key)?.markAsTouched();
      });
      this.showToast('Please fill in all required fields before testing connection.', 'warning');
      return;
    }

    const testData: TestConnectionRequest = {
      exchange: this.newCredentialForm.value.exchange,
      apiKey: this.newCredentialForm.value.apiKey,
      apiSecret: this.newCredentialForm.value.apiSecret,
      authToken: this.newCredentialForm.value.authToken || undefined
    };

    this.testingConnectionId.set('new');

    this.exchangeCredentialsService.testConnection(testData).subscribe({
      next: (result) => {
        this.testingConnectionId.set(null);
        if (result.success) {
          this.showToast('Connection successful! You can now save the credentials.', 'success');
        } else {
          this.showToast('Connection failed: ' + result.message, 'error');
        }
      },
      error: (err) => {
        this.testingConnectionId.set(null);
        this.showToast('Connection test failed: ' + err.message, 'error');
      }
    });
  }

  /**
   * Save new credential
   */
  saveNewCredential(): void {
    if (this.newCredentialForm.invalid) {
      Object.keys(this.newCredentialForm.controls).forEach(key => {
        this.newCredentialForm.get(key)?.markAsTouched();
      });
      this.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const data: CreateExchangeCredentialRequest = {
      exchange: this.newCredentialForm.value.exchange,
      apiKey: this.newCredentialForm.value.apiKey,
      apiSecret: this.newCredentialForm.value.apiSecret,
      authToken: this.newCredentialForm.value.authToken || undefined,
      label: this.newCredentialForm.value.label || undefined,
      isActive: true // Set new credentials as active by default
    };

    this.exchangeCredentialsService.createCredential(data).subscribe({
      next: (newCred) => {
        // Service already updated the state - sync local component state
        this.credentials.set(this.exchangeCredentialsService.credentials());

        // Close modal
        this.showAddCredentialModal.set(false);
        this.newCredentialForm.reset();

        this.showToast('Credential saved successfully!', 'success');
      },
      error: (err) => {
        console.error('Failed to create credential:', err);
        this.showToast('Failed to save credential: ' + err.message, 'error');
      }
    });
  }

  /**
   * Toggle API key visibility (in edit mode)
   */
  toggleApiKeyVisibility(credentialId: string): void {
    const key = credentialId + '_key';
    const current = this.showApiSecret();
    const newVisibility = !current[key];

    this.showApiSecret.set({
      ...current,
      [key]: newVisibility
    });

    // If revealing and we don't have the decrypted value yet, fetch it
    if (newVisibility && !this.revealedCredentials()[credentialId]?.apiKey) {
      this.fetchDecryptedCredential(credentialId);
    }
  }

  /**
   * Toggle API secret visibility (in edit mode)
   */
  toggleApiSecretVisibility(credentialId: string): void {
    const key = credentialId + '_secret';
    const current = this.showApiSecret();
    const newVisibility = !current[key];

    this.showApiSecret.set({
      ...current,
      [key]: newVisibility
    });

    // If revealing and we don't have the decrypted value yet, fetch it
    if (newVisibility && !this.revealedCredentials()[credentialId]?.apiSecret) {
      this.fetchDecryptedCredential(credentialId);
    }
  }

  /**
   * Fetch decrypted credential from backend
   */
  fetchDecryptedCredential(credentialId: string): void {
    this.exchangeCredentialsService.getCredentialById(credentialId).subscribe({
      next: (credential) => {
        // Store the revealed credentials
        const current = this.revealedCredentials();
        this.revealedCredentials.set({
          ...current,
          [credentialId]: {
            apiKey: (credential as any).apiKey || credential.apiKeyPreview,
            apiSecret: (credential as any).apiSecret || '(Secret not returned by server)'
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch decrypted credential:', err);
        this.showToast('Failed to retrieve credential details: ' + err.message, 'error');
      }
    });
  }

  /**
   * Legacy method for modal form - toggle API secret visibility
   */
  toggleApiSecretVisibilityLegacy(credentialId: string): void {
    const current = this.showApiSecret();
    this.showApiSecret.set({
      ...current,
      [credentialId]: !current[credentialId]
    });
  }

  /**
   * Toggle new form API secret visibility
   */
  toggleNewFormApiSecretVisibility(): void {
    this.toggleApiSecretVisibility('new');
  }

  /**
   * Get masked display for API key/secret
   */
  getMaskedValue(value: string): string {
    if (!value || value.length <= 4) {
      return '****';
    }
    return '...' + value.slice(-4);
  }

  /**
   * Called when platforms tab is activated
   */
  onPlatformsTabActivated(): void {
    this.loadCredentials();
  }

  /**
   * Show toast notification
   */
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToastSignal.set(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showToastSignal.set(false);
    }, 5000);
  }

  /**
   * Open trading platform info modal
   * Shows detailed information about the selected exchange credential
   */
  openPlatformInfoModal(credential: ExchangeCredential): void {
    this.selectedCredentialForModal.set(credential);
    this.showPlatformInfoModal.set(true);
  }

  /**
   * Close trading platform info modal
   */
  closePlatformInfoModal(): void {
    this.showPlatformInfoModal.set(false);
    this.selectedCredentialForModal.set(null);
  }

  /**
   * Show confirmation modal
   */
  showConfirmation(config: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning';
    onConfirm: () => void;
  }): void {
    this.confirmModalTitle.set(config.title || this.translate('modal.confirmTitle'));
    this.confirmModalMessage.set(config.message);
    this.confirmModalConfirmText.set(config.confirmText || this.translate('modal.confirm'));
    this.confirmModalCancelText.set(config.cancelText || this.translate('modal.cancel'));
    this.confirmModalVariant.set(config.variant || 'primary');
    this.confirmModalCallback.set(config.onConfirm);
    this.showConfirmModal.set(true);
  }

  /**
   * Handle confirmation modal confirm action
   */
  onConfirmModalConfirm(): void {
    const callback = this.confirmModalCallback();
    this.closeConfirmModal();
    // Execute callback in next tick to ensure modal closes first
    setTimeout(() => {
      if (callback) {
        callback();
      }
    }, 0);
  }

  /**
   * Handle confirmation modal cancel action
   */
  onConfirmModalCancel(): void {
    this.closeConfirmModal();
  }

  /**
   * Close confirmation modal
   */
  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.confirmModalCallback.set(null);
  }

}
