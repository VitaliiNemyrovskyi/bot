import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafeHtmlPipe]
    });

    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeHtmlPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should bypass security and return SafeHtml', () => {
    const htmlString = '<strong>Bold text</strong>';
    const result = pipe.transform(htmlString);

    expect(result).toBeTruthy();
    // The result should be a SafeValue type
    expect(result.toString()).toContain('SafeValue');
  });

  it('should handle empty string', () => {
    const result = pipe.transform('');
    expect(result).toBeTruthy();
  });

  it('should handle complex HTML', () => {
    const complexHtml = `
      <div class="test">
        <p>Paragraph with <em>emphasis</em></p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `;
    const result = pipe.transform(complexHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with special characters', () => {
    const htmlWithSpecialChars = '<p>Price: $100 &amp; €50</p>';
    const result = pipe.transform(htmlWithSpecialChars);
    expect(result).toBeTruthy();
  });
});
