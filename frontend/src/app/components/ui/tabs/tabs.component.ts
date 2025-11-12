import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId = '';
  @Input() variant: 'default' | 'pills' | 'underline' = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() fullWidth = false;

  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTabId = tabId;
      this.tabChange.emit(tabId);
    }
  }

  getTabsClasses(): string {
    const classes = ['tabs'];

    classes.push(`tabs-${this.variant}`);
    classes.push(`tabs-${this.size}`);

    if (this.fullWidth) {
      classes.push('tabs-full-width');
    }

    return classes.join(' ');
  }

  getTabClasses(tab: Tab): string {
    const classes = ['tab'];

    classes.push(`tab-${this.variant}`);
    classes.push(`tab-${this.size}`);

    if (tab.id === this.activeTabId) {
      classes.push('tab-active');
    }

    if (tab.disabled) {
      classes.push('tab-disabled');
    }

    return classes.join(' ');
  }
}

@Component({
  selector: 'ui-tab-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-content.component.html',
  styleUrls: ['./tab-content.component.css']
})
export class TabContentComponent {
  @Input() tabId = '';
  @Input() active = false;
}