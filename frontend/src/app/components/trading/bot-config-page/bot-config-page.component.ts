import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BotConfigFormComponent } from '../bot-config-form/bot-config-form.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { GridBotService } from '../../../services/grid-bot.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-bot-config-page',
  standalone: true,
  imports: [
    CommonModule,
    BotConfigFormComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent
  ],
  templateUrl: './bot-config-page.component.html',
  styleUrl: './bot-config-page.component.scss'
})
export class BotConfigPageComponent implements OnInit {
  mode: 'create' | 'edit' | 'view' = 'create';
  botData?: any;
  strategyData?: any;
  loading = false;
  error: string | null = null;
  pageTitle = 'Create New Bot';

  protected translationService = inject(TranslationService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gridBotService: GridBotService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const botId = params['id'];
      const mode = this.route.snapshot.data['mode'] || 'create';

      this.mode = mode;
      this.updatePageTitle();

      if (botId && (mode === 'edit' || mode === 'view')) {
        this.loadBot(botId);
      }
    });

    // Check for query parameters (strategy data, etc.)
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['strategy']) {
        try {
          this.strategyData = JSON.parse(queryParams['strategy']);
        } catch (e) {
          console.warn('Invalid strategy data in query params');
        }
      }
    });
  }

  private updatePageTitle() {
    switch (this.mode) {
      case 'create':
        this.pageTitle = this.translate('dashboard.createBot');
        break;
      case 'edit':
        this.pageTitle = this.translate('bot.editConfiguration');
        break;
      case 'view':
        this.pageTitle = this.translate('bot.details');
        break;
    }
  }

  private loadBot(botId: string) {
    this.loading = true;
    this.error = null;

    this.gridBotService.getBot(botId).subscribe({
      next: (bot) => {
        this.botData = bot;
        this.loading = false;

        if (this.mode === 'view' || this.mode === 'edit') {
          this.pageTitle = `${this.mode === 'view' ? this.translate('bot.details') : this.translate('button.edit')} - ${bot.name || bot.symbol}`;
        }
      },
      error: (error) => {
        this.error = this.translate('bot.errorConfiguration');
        this.loading = false;
        console.error('Failed to load bot:', error);
      }
    });
  }

  onBotSave(botData: any) {
    this.loading = true;
    this.error = null;

    if (this.mode === 'edit' && botData.id) {
      this.gridBotService.updateBot(botData.id, 'update', botData.config).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Bot updated successfully:', response);
          this.router.navigate(['/trading']);
        },
        error: (error) => {
          this.loading = false;
          this.error = this.translate('bot.failedToUpdate');
          console.error('Failed to update bot:', error);
        }
      });
    } else {
      this.gridBotService.createBot(botData).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Bot created successfully:', response);
          this.router.navigate(['/trading']);
        },
        error: (error) => {
          this.loading = false;
          this.error = this.translate('bot.failedToCreate');
          console.error('Failed to create bot:', error);
        }
      });
    }
  }

  onBotCancel() {
    this.goBack();
  }

  onBotEdit(botData: any) {
    // Switch to edit mode
    this.mode = 'edit';
    this.updatePageTitle();
  }

  goBack() {
    this.router.navigate(['/trading']);
  }

  retry() {
    const botId = this.route.snapshot.params['id'];
    if (botId) {
      this.loadBot(botId);
    } else {
      this.error = null;
    }
  }
}
