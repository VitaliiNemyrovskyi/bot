import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriangularPosition, ExecutionLeg, LegStatus } from '../../../../models/triangular-arbitrage.model';
import { TranslationService } from '../../../../services/translation.service';

/**
 * Execution Progress Component
 *
 * Displays a stepper showing the progress of a triangular arbitrage execution
 * through its three legs.
 */
@Component({
  selector: 'app-execution-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './execution-progress.component.html',
  styleUrls: ['./execution-progress.component.scss']
})
export class ExecutionProgressComponent {
  @Input() position!: TriangularPosition;

  constructor(private translationService: TranslationService) {}

  /**
   * Get status icon for a leg
   */
  getStatusIcon(status: LegStatus): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'executing': return 'sync';
      case 'error': return 'error';
      case 'pending': return 'radio_button_unchecked';
      default: return 'help';
    }
  }

  /**
   * Get status class
   */
  getStatusClass(status: LegStatus): string {
    return `status-${status}`;
  }

  /**
   * Format execution time
   */
  formatExecutionTime(ms?: number): string {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Get fill percentage for a leg
   */
  getFillPercentage(leg: ExecutionLeg): number {
    if (leg.targetQuantity === 0) return 0;
    return (leg.filledQuantity / leg.targetQuantity) * 100;
  }

  /**
   * Get next leg for connector display
   */
  getNextLeg(currentLegNumber: 1 | 2 | 3): ExecutionLeg | null {
    if (currentLegNumber >= 3) return null;
    // legNumber is 1-based, array is 0-indexed
    // For leg 1 (index 0), next is leg 2 (index 1)
    // For leg 2 (index 1), next is leg 3 (index 2)
    return this.position.legs[currentLegNumber as 0 | 1 | 2] || null;
  }

  /**
   * Check if next leg is not pending (for connector styling)
   */
  isNextLegNotPending(currentLegNumber: 1 | 2 | 3): boolean {
    const nextLeg = this.getNextLeg(currentLegNumber);
    return nextLeg ? nextLeg.status !== 'pending' : false;
  }

  /**
   * Translation helper
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
