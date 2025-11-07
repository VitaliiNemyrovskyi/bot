import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Component
 *
 * Custom icon component using icon font
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
    <i
      [class]="'ui-icon ui-icon-' + name + (class ? ' ' + class : '')"
      [style.font-size.px]="size"
      [attr.aria-hidden]="true"
    ></i>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ui-icon {
      display: inline-block;
      color: inherit;
      vertical-align: middle;
    }

    .ui-icon.spinning {
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
