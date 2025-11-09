import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Component
 *
 * Uses Material Symbols from Google Fonts
 *
 * Usage:
 * <ui-icon name="refresh" [size]="20"></ui-icon>
 * <ui-icon name="close" [size]="24" class="custom-class"></ui-icon>
 * <ui-icon name="autorenew" [size]="20" class="spinning"></ui-icon>
 */
@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <i
      class="material-icons"
      [class.spinning]="class.includes('spinning')"
      [style.font-size.px]="size"
      [attr.aria-hidden]="true"
    >{{ getIconName() }}</i>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .material-icons {
      user-select: none;
      display: inline-block;
    }

    .material-icons.spinning {
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

  getIconName(): string {
    // Map custom icon names to Material Icons
    const iconMap: Record<string, string> = {
      'spinner': 'autorenew',
      'trash': 'delete',
      'eye': 'visibility',
      'eye-off': 'visibility_off',
      'alert-circle': 'error',
      'chevron-down': 'expand_more',
      'clipboard': 'content_copy',
      'user': 'person',
      'clear': 'clear',
      'close': 'close',
      'info': 'info',
      'plus': 'add',
      'edit': 'edit',
      'logout': 'logout',
      'play_arrow': 'play_arrow',
      'filter': 'filter_list',
      'show_chart': 'show_chart',
      'trending_up': 'trending_up',
      'trending_down': 'trending_down',
      'chart': 'bar_chart',
      'analytics': 'analytics',
      'settings': 'settings',
      'tune': 'tune',
      'lock': 'lock',
      'list': 'list',
      'swap_horiz': 'swap_horiz',
      'schedule': 'schedule',
      'arrow_upward': 'arrow_upward',
      'arrow_downward': 'arrow_downward',
    };

    return iconMap[this.name] || this.name;
  }
}
