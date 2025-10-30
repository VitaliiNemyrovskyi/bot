import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * SafeHtml Pipe
 *
 * Bypasses Angular's built-in sanitization for HTML content.
 * Use with caution - only apply to trusted content to avoid XSS vulnerabilities.
 *
 * Usage:
 * ```html
 * <div [innerHTML]="htmlContent | safeHtml"></div>
 * ```
 *
 * Example:
 * ```typescript
 * htmlContent = '<strong>Bold text</strong> with <em>italic</em>';
 * ```
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
