# Angular Pipes

This directory contains custom Angular pipes used throughout the application.

## SafeHtmlPipe

Bypasses Angular's built-in sanitization for HTML content.

### Usage

#### 1. Import the pipe in your component

```typescript
import { SafeHtmlPipe } from '@/app/pipes';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [SafeHtmlPipe],
  template: `
    <div [innerHTML]="htmlContent | safeHtml"></div>
  `
})
export class ExampleComponent {
  htmlContent = '<strong>Bold text</strong> with <em>italic</em>';
}
```

#### 2. Example with dynamic content

```typescript
import { SafeHtmlPipe } from '@/app/pipes';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [SafeHtmlPipe],
  template: `
    <div class="message" [innerHTML]="formattedMessage | safeHtml"></div>
  `
})
export class MessageComponent {
  message = 'User <strong>John</strong> sent you a message';

  get formattedMessage(): string {
    return this.formatMessage(this.message);
  }

  private formatMessage(msg: string): string {
    // Your formatting logic here
    return msg;
  }
}
```

#### 3. Example with dropdown options

```typescript
import { SafeHtmlPipe } from '@/app/pipes';
import { DropdownComponent, DropdownOption } from '@/app/components/ui/dropdown/dropdown.component';

@Component({
  selector: 'app-exchange-selector',
  standalone: true,
  imports: [DropdownComponent, SafeHtmlPipe],
  template: `
    <ui-dropdown
      [options]="exchangeOptions"
      [(ngModel)]="selectedExchange"
      [searchable]="true"
    ></ui-dropdown>
  `
})
export class ExchangeSelectorComponent {
  selectedExchange = 'BINANCE';

  exchangeOptions: DropdownOption[] = [
    {
      value: 'BINANCE',
      label: 'BINANCE (0.05% / 8h)'
    },
    {
      value: 'BINGX',
      label: 'BingX (0.03% / 4h)'
    }
  ];
}
```

### Security Warning

⚠️ **Use with caution!** This pipe bypasses Angular's built-in sanitization. Only use it with **trusted content** to avoid XSS (Cross-Site Scripting) vulnerabilities.

**Safe usage:**
- Content you generate in your own application
- Content from trusted APIs with proper backend validation
- Sanitized content from a trusted source

**Unsafe usage:**
- User-generated content without sanitization
- Content from untrusted third-party sources
- Direct user input

### Best Practices

1. **Sanitize on the backend** - Always sanitize HTML content on your backend before sending it to the frontend
2. **Validate content** - Ensure the HTML content is from a trusted source
3. **Limit usage** - Only use this pipe when absolutely necessary
4. **Code review** - Review any usage of this pipe during code reviews
5. **Content Security Policy** - Implement CSP headers to mitigate XSS risks

### Alternatives

If you don't need to render HTML tags, consider these safer alternatives:

- Use regular text binding: `{{ textContent }}`
- Use Angular's built-in sanitization: `[innerHTML]="content"` (without the pipe)
- Use component composition instead of HTML strings
