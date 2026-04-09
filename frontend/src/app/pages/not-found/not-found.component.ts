import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="not-found">
      <div class="not-found__card">
        <div class="not-found__code">404</div>
        <h1 class="not-found__title">{{ translate('notFound.title') }}</h1>
        <p class="not-found__message">{{ translate('notFound.message') }}</p>
        <ui-button variant="primary" routerLink="/trading/manual">
          {{ translate('notFound.backHome') }}
        </ui-button>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-primary);
      padding: 24px;
    }
    .not-found__card {
      text-align: center;
      max-width: 420px;
    }
    .not-found__code {
      font-size: 96px;
      font-weight: 800;
      color: var(--primary-color);
      line-height: 1;
      margin-bottom: 12px;
      opacity: 0.7;
    }
    .not-found__title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px;
    }
    .not-found__message {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0 0 28px;
      line-height: 1.5;
    }
  `]
})
export class NotFoundComponent {
  private readonly translationService = inject(TranslationService);

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
