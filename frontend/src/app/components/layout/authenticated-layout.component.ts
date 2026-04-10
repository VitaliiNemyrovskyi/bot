import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService, Language } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';
import { ButtonComponent } from '../ui/button/button.component';
import { IconComponent } from '../ui/icon/icon.component';
import { ThemeToggleComponent } from '../ui/theme-toggle/theme-toggle.component';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  locked?: boolean;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    IconComponent,
    ThemeToggleComponent
  ],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.scss'
})
export class AuthenticatedLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);
  readonly themeService = inject(ThemeService);

  readonly currentUser = this.authService.currentUser;
  readonly isSubscribed = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    if (!user.subscriptionActive) return false;
    if (!user.subscriptionExpiry) return true;
    return new Date(user.subscriptionExpiry).getTime() > Date.now();
  });

  readonly logoSource = computed(() =>
    this.themeService.currentTheme() === 'dark'
      ? 'assets/logo-dark.svg'
      : 'assets/logo-light.svg'
  );

  readonly availableLanguages = this.translationService.availableLanguages;
  readonly currentLanguage = this.translationService.currentLanguage;
  readonly currentLanguageOption = computed(() => this.translationService.getCurrentLanguageOption());

  readonly collapsed = signal(localStorage.getItem('sidebar-collapsed') === 'true');
  readonly mobileOpen = signal(false);
  showLanguageDropdown = false;

  readonly navSections: NavSection[] = [
    {
      titleKey: 'sidebar.trading',
      items: [
        { path: '/dashboard', labelKey: 'sidebar.dashboard', icon: 'dashboard' },
        { path: '/trading/manual', labelKey: 'sidebar.manualTrading', icon: 'show_chart' },
        { path: '/trading/bot/create', labelKey: 'sidebar.gridBots', icon: 'smart_toy' },
      ]
    },
    {
      titleKey: 'sidebar.arbitrage',
      items: [
        { path: '/arbitrage/funding', labelKey: 'sidebar.funding', icon: 'account_balance' },
        { path: '/arbitrage/opportunities', labelKey: 'sidebar.opportunities', icon: 'swap_horiz', locked: true },
        { path: '/arbitrage/positions', labelKey: 'sidebar.positions', icon: 'list' },
      ]
    },
    {
      titleKey: 'sidebar.tools',
      items: [
        { path: '/chart-demo', labelKey: 'sidebar.chartDemo', icon: 'bar_chart' },
        { path: '/testing/api-tester', labelKey: 'sidebar.apiTester', icon: 'science' },
        { path: '/execution-metrics', labelKey: 'sidebar.executionMetrics', icon: 'speed' },
      ]
    },
    {
      titleKey: 'sidebar.account',
      items: [
        { path: '/profile', labelKey: 'sidebar.profile', icon: 'person' },
        { path: '/billing', labelKey: 'sidebar.billing', icon: 'credit_card' },
      ]
    }
  ];

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
    localStorage.setItem('sidebar-collapsed', String(this.collapsed()));
  }

  toggleMobileMenu(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileOpen.set(false);
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  selectLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
    this.showLanguageDropdown = false;
  }

  isItemLocked(item: NavItem): boolean {
    return !!item.locked && !this.isSubscribed();
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
