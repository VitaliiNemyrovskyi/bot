import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriangularOpportunity } from '../../../../models/triangular-arbitrage.model';

/**
 * Triangle Visualizer Component
 *
 * Renders an SVG-based visual diagram of a triangular arbitrage path.
 * Shows:
 * - The three assets and their trading pairs
 * - Price information at each leg
 * - Direction of trades with arrows
 * - Profit calculation in the center
 */
@Component({
  selector: 'app-triangle-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './triangle-visualizer.component.html',
  styleUrls: ['./triangle-visualizer.component.scss']
})
export class TriangleVisualizerComponent implements OnInit {
  @Input() opportunity!: TriangularOpportunity;

  // SVG coordinates for triangle vertices
  readonly svgWidth = 400;
  readonly svgHeight = 400;
  readonly centerX = 200;
  readonly centerY = 200;
  readonly radius = 140;

  // Computed positions for assets
  readonly positions = signal<{
    assetA: { x: number; y: number };
    assetB: { x: number; y: number };
    assetC: { x: number; y: number };
  }>({
    assetA: { x: 0, y: 0 },
    assetB: { x: 0, y: 0 },
    assetC: { x: 0, y: 0 }
  });

  ngOnInit(): void {
    this.calculatePositions();
  }

  /**
   * Calculate SVG positions for the three assets in a triangle
   */
  private calculatePositions(): void {
    // Asset A at top (12 o'clock)
    const aAngle = -Math.PI / 2;
    const assetA = {
      x: this.centerX + this.radius * Math.cos(aAngle),
      y: this.centerY + this.radius * Math.sin(aAngle)
    };

    // Asset B at bottom-right (4 o'clock)
    const bAngle = Math.PI / 6;
    const assetB = {
      x: this.centerX + this.radius * Math.cos(bAngle),
      y: this.centerY + this.radius * Math.sin(bAngle)
    };

    // Asset C at bottom-left (8 o'clock)
    const cAngle = (5 * Math.PI) / 6;
    const assetC = {
      x: this.centerX + this.radius * Math.cos(cAngle),
      y: this.centerY + this.radius * Math.sin(cAngle)
    };

    this.positions.set({ assetA, assetB, assetC });
  }

  /**
   * Get arrow path for a leg
   */
  getArrowPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
    // Calculate angle
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    // Shorten the line to not overlap with nodes
    const offset = 35;
    const startX = from.x + offset * Math.cos(angle);
    const startY = from.y + offset * Math.sin(angle);
    const endX = to.x - offset * Math.cos(angle);
    const endY = to.y - offset * Math.sin(angle);

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  /**
   * Get arrow marker position
   */
  getArrowMarkerPosition(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number; rotation: number } {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const rotation = (angle * 180) / Math.PI;

    const offset = 35;
    const x = to.x - offset * Math.cos(angle);
    const y = to.y - offset * Math.sin(angle);

    return { x, y, rotation };
  }

  /**
   * Get label position for a leg (midpoint of arrow)
   */
  getLegLabelPosition(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number } {
    return {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    };
  }

  /**
   * Get color for profit
   */
  getProfitColor(): string {
    const profit = this.opportunity.profitPercentage;
    if (profit >= 0.5) return '#2e7d32';
    if (profit >= 0.2) return '#388e3c';
    if (profit >= 0.1) return '#4caf50';
    return '#8bc34a';
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    if (price < 0.01) {
      return price.toFixed(8);
    } else if (price < 1) {
      return price.toFixed(6);
    } else if (price < 100) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  }
}
