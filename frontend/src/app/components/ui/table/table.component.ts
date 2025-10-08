import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | null;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() striped: boolean = true;
  @Input() hoverable: boolean = true;
  @Input() bordered: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() stickyHeader: boolean = false;
  @Input() maxHeight?: string;

  @Output() sort = new EventEmitter<SortEvent>();
  @Output() rowClick = new EventEmitter<any>();

  currentSort: { column: string; direction: 'asc' | 'desc' | null } = { column: '', direction: null };

  // Inject TranslationService
  protected translationService = inject(TranslationService);

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    let direction: 'asc' | 'desc' | null = 'asc';

    if (this.currentSort.column === column.key) {
      if (this.currentSort.direction === 'asc') {
        direction = 'desc';
      } else if (this.currentSort.direction === 'desc') {
        direction = null;
      }
    }

    this.currentSort = { column: column.key, direction };
    this.sort.emit({ column: column.key, direction });
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) return '';

    switch (column.type) {
      case 'currency':
        return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(2)}%` : value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : value;
      default:
        return String(value);
    }
  }

  getTableClasses(): string {
    const classes = ['table'];

    classes.push(`table-${this.size}`);

    if (this.striped) {
      classes.push('table-striped');
    }

    if (this.hoverable) {
      classes.push('table-hoverable');
    }

    if (this.bordered) {
      classes.push('table-bordered');
    }

    if (this.stickyHeader) {
      classes.push('table-sticky-header');
    }

    return classes.join(' ');
  }

  getColumnHeaderClasses(column: TableColumn): string {
    const classes = ['table-header'];

    if (column.sortable) {
      classes.push('table-header-sortable');
    }

    if (column.align) {
      classes.push(`table-header-${column.align}`);
    }

    if (this.currentSort.column === column.key && this.currentSort.direction) {
      classes.push(`table-header-sorted-${this.currentSort.direction}`);
    }

    return classes.join(' ');
  }

  getCellClasses(column: TableColumn): string {
    const classes = ['table-cell'];

    if (column.align) {
      classes.push(`table-cell-${column.align}`);
    }

    return classes.join(' ');
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';

    if (this.currentSort.column === column.key) {
      return this.currentSort.direction === 'asc' ? '↑' :
             this.currentSort.direction === 'desc' ? '↓' : '↕';
    }

    return '↕';
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}