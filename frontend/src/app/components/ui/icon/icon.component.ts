import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Component
 *
 * Custom icon component using inline SVG icons
 * Replaces Angular Material mat-icon
 *
 * Usage:
 * <ui-icon name="refresh" size="20"></ui-icon>
 */
@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="'icon icon-' + name + ' ' + class"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <ng-container [ngSwitch]="name">
        <!-- Refresh -->
        <g *ngSwitchCase="'refresh'">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </g>

        <!-- Schedule/Clock -->
        <g *ngSwitchCase="'schedule'">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </g>

        <!-- Clear/X Circle -->
        <g *ngSwitchCase="'clear'">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6M9 9l6 6"/>
        </g>

        <!-- Close/X -->
        <g *ngSwitchCase="'close'">
          <path d="M18 6 6 18M6 6l12 12"/>
        </g>

        <!-- Error -->
        <g *ngSwitchCase="'error'">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </g>

        <!-- Info -->
        <g *ngSwitchCase="'info'">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </g>

        <!-- Show Chart/Trending Up -->
        <g *ngSwitchCase="'show_chart'">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-5 5"/>
        </g>

        <!-- Trending Up -->
        <g *ngSwitchCase="'trending_up'">
          <path d="m23 6-9.5 9.5-5-5L1 18"/>
          <path d="M17 6h6v6"/>
        </g>

        <!-- Trending Down -->
        <g *ngSwitchCase="'trending_down'">
          <path d="m23 18-9.5-9.5-5 5L1 6"/>
          <path d="M17 18h6v-6"/>
        </g>

        <!-- Arrow Upward -->
        <g *ngSwitchCase="'arrow_upward'">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </g>

        <!-- Arrow Downward -->
        <g *ngSwitchCase="'arrow_downward'">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </g>

        <!-- Check Circle -->
        <g *ngSwitchCase="'check_circle'">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="m9 11 3 3L22 4"/>
        </g>

        <!-- Settings -->
        <g *ngSwitchCase="'settings'">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
          <path d="m1 12h6m6 0h6"/>
          <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
        </g>

        <!-- Tune/Sliders -->
        <g *ngSwitchCase="'tune'">
          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
        </g>

        <!-- Default/Unknown icon -->
        <g *ngSwitchDefault>
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
        </g>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      display: inline-block;
      color: inherit;
      vertical-align: middle;
      transition: all 0.2s ease;
    }

    .icon.spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class IconComponent {
  @Input() name = '';
  @Input() size: string | number = 24;
  @Input() class = '';
}
