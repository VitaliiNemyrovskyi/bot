import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleTheme()"
      class="theme-toggle-button"
      [attr.aria-label]="buttonLabel()"
      [title]="buttonLabel()"
      type="button"
    >
      <div class="icon-container">
        <svg
          *ngIf="themeService.isLight()"
          class="icon sun-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg
          *ngIf="themeService.isDark()"
          class="icon moon-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </div>
      <span class="button-text">
        {{ themeService.isDark() ? 'Light' : 'Dark' }} Mode
      </span>
    </button>
  `,
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent {
  readonly buttonLabel = computed(() =>
    `Switch to ${this.themeService.isDark() ? 'light' : 'dark'} mode`
  );

  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}