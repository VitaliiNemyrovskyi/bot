import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipe that formats a Date into relative time (e.g., "5 min ago", "2h ago")
 * Being a pure pipe ensures Angular caches the result and only recalculates when inputs change
 * This prevents ExpressionChangedAfterItHasBeenCheckedError
 */
@Pipe({
  name: 'relativeTime',
  pure: true,
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  // Cache the reference time to ensure consistency within a change detection cycle
  private cachedNow: Date = new Date();
  private lastUpdate: number = Date.now();

  transform(date: Date | string | number): string {
    if (!date) return 'N/A';

    // Convert to Date object if needed
    const dateObj = date instanceof Date ? date : new Date(date);

    // Update cached time only once per second to prevent rapid changes
    const now = Date.now();
    if (now - this.lastUpdate > 1000) {
      this.cachedNow = new Date();
      this.lastUpdate = now;
    }

    const diffMs = this.cachedNow.getTime() - dateObj.getTime();

    // Add a 5-second buffer to prevent boundary issues
    const bufferedDiffMs = diffMs + 5000;
    const diffMins = Math.floor(bufferedDiffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
