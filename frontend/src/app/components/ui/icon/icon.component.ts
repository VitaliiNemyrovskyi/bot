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
    <span
      class="material-symbols-outlined material-symbols-filled"
      [class.spinning]="class.includes('spinning')"
      [style.font-size.px]="size"
      [attr.aria-hidden]="true"
    >
      {{ getIconName() }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .material-symbols-outlined {
      display: inline-block;
      color: inherit;
      vertical-align: middle;
      user-select: none;
    }

    .material-symbols-filled {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .material-symbols-outlined.spinning {
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

  // Map our icon names to Material Symbols names
  private iconNameMap: Record<string, string> = {
    'refresh': 'refresh',
    'schedule': 'schedule',
    'clear': 'cancel',
    'close': 'close',
    'error': 'error',
    'info': 'info',
    'alert-circle': 'error',
    'plus': 'add',
    'chevron-down': 'arrow_drop_down',
    'arrow_upward': 'arrow_upward',
    'arrow_downward': 'arrow_downward',
    'edit': 'edit',
    'trash': 'delete',
    'logout': 'logout',
    'play_arrow': 'play_arrow',
    'filter': 'filter_list',
    'check_circle': 'check_circle',
    'done_all': 'done_all',
    'clear_all': 'clear_all',
    'show_chart': 'show_chart',
    'trending_up': 'trending_up',
    'trending_down': 'trending_down',
    'chart': 'bar_chart',
    'analytics': 'analytics',
    'settings': 'settings',
    'tune': 'tune',
    'user': 'person',
    'eye': 'visibility',
    'eye-off': 'visibility_off',
    'lock': 'lock',
    'list': 'list',
    'clipboard': 'content_paste',
    'spinner': 'progress_activity',
    'swap_horiz': 'swap_horiz'
  };

  getIconName(): string {
    return this.iconNameMap[this.name] || this.name;
  }
}
