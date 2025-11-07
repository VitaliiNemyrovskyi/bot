import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Component
 *
 * Custom icon component using inline SVG icons
 * Replaces Angular Material mat-icon
 *
 * Usage:
 * <ui-icon name="refresh" [size]="20"></ui-icon>
 * <ui-icon name="close" [size]="24" class="custom-class"></ui-icon>
 * <ui-icon name="spinner" [size]="20" class="spinning"></ui-icon>
 *
 * Available icons (34 total):
 * - Basic: refresh, schedule, clear, close, error, info, alert-circle, plus
 * - Navigation: chevron-down, arrow_upward, arrow_downward
 * - Actions: edit, trash, logout, play_arrow, filter
 * - Status: check_circle, done_all, clear_all
 * - Charts: show_chart, trending_up, trending_down, chart, analytics
 * - Settings: settings, tune
 * - User: user, eye, eye-off, lock
 * - Other: list, clipboard, spinner, swap_horiz
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

        <!-- Edit -->
        <g *ngSwitchCase="'edit'">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </g>

        <!-- Logout -->
        <g *ngSwitchCase="'logout'">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </g>

        <!-- Chevron Down -->
        <g *ngSwitchCase="'chevron-down'">
          <path d="M6 9l6 6 6-6"/>
        </g>

        <!-- Chart -->
        <g *ngSwitchCase="'chart'">
          <path d="M3 3v18h18"/>
          <path d="M7 12l4-4 4 4 6-6"/>
        </g>

        <!-- List -->
        <g *ngSwitchCase="'list'">
          <path d="M2 4h20M2 10h20M2 16h20M2 22h20"/>
        </g>

        <!-- Clipboard -->
        <g *ngSwitchCase="'clipboard'">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </g>

        <!-- User -->
        <g *ngSwitchCase="'user'">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </g>

        <!-- Eye -->
        <g *ngSwitchCase="'eye'">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </g>

        <!-- Eye Off -->
        <g *ngSwitchCase="'eye-off'">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </g>

        <!-- Trash/Delete -->
        <g *ngSwitchCase="'trash'">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </g>

        <!-- Lock -->
        <g *ngSwitchCase="'lock'">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </g>

        <!-- Filter -->
        <g *ngSwitchCase="'filter'">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </g>

        <!-- Analytics -->
        <g *ngSwitchCase="'analytics'">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </g>

        <!-- Alert Circle -->
        <g *ngSwitchCase="'alert-circle'">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </g>

        <!-- Clear All -->
        <g *ngSwitchCase="'clear_all'">
          <path d="M5 13l4 4L19 7"/>
          <path d="M13 15l6-6"/>
        </g>

        <!-- Done All -->
        <g *ngSwitchCase="'done_all'">
          <path d="M1 13l4 4L15 7"/>
          <path d="M8 13l4 4L22 7"/>
        </g>

        <!-- Play Arrow -->
        <g *ngSwitchCase="'play_arrow'">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </g>

        <!-- Spinner -->
        <g *ngSwitchCase="'spinner'">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </g>

        <!-- Swap Horizontal -->
        <g *ngSwitchCase="'swap_horiz'">
          <path d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
          <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </g>

        <!-- Plus -->
        <g *ngSwitchCase="'plus'">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
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
