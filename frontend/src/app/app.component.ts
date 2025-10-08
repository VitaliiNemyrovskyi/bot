import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { TranslationService, Language, LanguageOption } from './services/translation.service';
import { ThemeService } from './services/theme.service';
import { ThemeToggleComponent } from './components/ui/theme-toggle/theme-toggle.component';
import { ButtonComponent } from './components/ui/button/button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent, ButtonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Computed signals from AuthService
  readonly isAuthenticated: Signal<boolean> = computed(() => {
    return this.authService.isAuthenticated()
  });
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isLoading = computed(() => this.authService.isLoading());

  // Translation service properties
  readonly currentLanguage = this.translationService.currentLanguage;
  readonly availableLanguages = this.translationService.availableLanguages;
  readonly currentLanguageOption = computed(() => this.translationService.getCurrentLanguageOption());

  // Theme-based logo
  readonly logoSource = computed(() => {
    return this.themeService.currentTheme() === 'dark'
      ? 'assets/logo-dark.svg'
      : 'assets/logo-light.svg';
  });

  showLanguageDropdown = false;
  showMobileMenu = false;

  constructor(
    private authService: AuthService,
    private translationService: TranslationService,
    public themeService: ThemeService
  ) {
  }

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  selectLanguage(language: Language): void {
    this.translationService.setLanguage(language);
    this.showLanguageDropdown = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}
