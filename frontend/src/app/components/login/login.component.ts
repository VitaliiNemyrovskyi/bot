import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Signals for component state
  private showRegisterSignal = signal(false);
  
  // Computed values
  readonly showRegister = this.showRegisterSignal.asReadonly();
  readonly isLoading = computed(() => this.authService.isLoading());
  readonly authError = computed(() => this.authService.error());
  readonly sessionMessage = computed(() => {
    if (this.loginReason === 'session_expired') {
      return this.translate('auth.sessionExpired');
    }
    return null;
  });

  // Form groups
  loginForm: FormGroup;
  registerForm: FormGroup;

  private returnUrl: string;
  private loginReason: string | null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
    this.loginReason = this.route.snapshot.queryParams['reason'] || null;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Effect to navigate when authenticated
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe();
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { email, password, name } = this.registerForm.value;
      this.authService.register(email, password, name).subscribe();
    }
  }

  loginWithGoogle() {
    // Placeholder for Google login
    // In a real app, this would integrate with Google Identity Services
    console.log('Google login clicked');
    alert('Google login would be implemented with Google Identity Services');
  }

  toggleMode() {
    this.showRegisterSignal.update(value => !value);
    this.clearError();
    this.resetForms();
  }

  clearError() {
    this.authService.clearError();
  }

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  private resetForms() {
    this.loginForm.reset();
    this.registerForm.reset();
    this.loginForm.markAsUntouched();
    this.registerForm.markAsUntouched();
  }
}