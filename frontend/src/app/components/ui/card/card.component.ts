import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() variant: 'default' | 'outlined' | 'elevated' = 'default';
  @Input() padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
  @Input() hover = false;

  getCardClasses(): string {
    const classes = ['card'];

    classes.push(`card-${this.variant}`);
    classes.push(`card-padding-${this.padding}`);

    if (this.hover) {
      classes.push('card-hover');
    }

    return classes.join(' ');
  }
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.css']
})
export class CardHeaderComponent {}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-title.component.html',
  styleUrls: ['./card-title.component.css']
})
export class CardTitleComponent {}

@Component({
  selector: 'ui-card-subtitle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-subtitle.component.html',
  styleUrls: ['./card-subtitle.component.css']
})
export class CardSubtitleComponent {}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-content.component.html',
  styleUrls: ['./card-content.component.css']
})
export class CardContentComponent {}

@Component({
  selector: 'ui-card-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-actions.component.html',
  styleUrls: ['./card-actions.component.css']
})
export class CardActionsComponent {}