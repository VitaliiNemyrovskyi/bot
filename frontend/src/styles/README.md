# CSS Variables System

This document describes the centralized CSS variables system implemented for consistent theming across the application.

## Overview

The application uses a centralized CSS variables system located in `/src/styles/variables.css` that provides:
- Consistent design tokens across all components
- Automatic dark/light theme support
- Better maintainability and scalability
- Runtime theme switching capabilities

## Structure

### Files
- `/src/styles/variables.css` - Central variable definitions
- `/src/styles.scss` - Main stylesheet with legacy variable mappings
- Component stylesheets - Use centralized variables

### Variable Categories

#### Colors
```css
--primary-color: #3b82f6;
--primary-hover: #2563eb;
--success-color: #26a69a;
--danger-color: #ef5350;
--warning-color: #ff9800;
--info-color: #2196f3;
```

#### Text Colors
```css
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;
--text-disabled: #d1d5db;
--text-inverse: #ffffff;
```

#### Background Colors
```css
--background-primary: #ffffff;
--background-secondary: #f9fafb;
--background-tertiary: #f3f4f6;
--background-overlay: rgba(0, 0, 0, 0.5);
```

#### Spacing & Layout
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

--border-radius-sm: 4px;
--border-radius-md: 6px;
--border-radius-lg: 8px;
```

#### Transitions
```css
--transition-fast: all 0.15s ease;
--transition-normal: all 0.2s ease;
--transition-slow: all 0.3s ease;
```

## Usage

### In Component Stylesheets

```scss
.my-component {
  background: var(--background-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: var(--transition-normal);

  &:hover {
    background: var(--background-secondary);
    border-color: var(--border-hover);
  }
}

.button-primary {
  background: var(--primary-color);
  color: var(--text-inverse);

  &:hover {
    background: var(--primary-hover);
  }
}
```

### Dark Theme Support

The system automatically handles dark theme through CSS variables. No additional work needed in components:

```css
/* Light theme (default) */
:root {
  --text-primary: #111827;
  --background-primary: #ffffff;
}

/* Dark theme */
[data-theme="dark"], .dark-theme {
  --text-primary: #f9fafb;
  --background-primary: #1e1e1e;
}
```

### Trading-Specific Variables

```css
--trading-buy: var(--success-color);
--trading-sell: var(--danger-color);
--trading-profit: #26a69a;
--trading-loss: #ef5350;
--grid-line: rgba(59, 130, 246, 0.3);
```

## Migration Guide

### From SCSS Variables

**Before:**
```scss
$primary-color: #3b82f6;
$border-radius: 4px;

.component {
  background: $primary-color;
  border-radius: $border-radius;
}
```

**After:**
```scss
.component {
  background: var(--primary-color);
  border-radius: var(--border-radius-sm);
}
```

### From Hardcoded Values

**Before:**
```scss
.component {
  background: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
}
```

**After:**
```scss
.component {
  background: var(--background-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## Best Practices

1. **Always use variables** instead of hardcoded values
2. **Choose semantic variables** over generic ones when available
3. **Test both themes** when developing components
4. **Use consistent spacing** from the spacing scale
5. **Follow transition patterns** for smooth animations

### Example Component

```scss
.card {
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-hover);
  }

  .card-title {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-sm);
  }

  .card-content {
    color: var(--text-secondary);
    line-height: var(--line-height-normal);
  }

  .card-actions {
    margin-top: var(--spacing-md);
    display: flex;
    gap: var(--spacing-sm);
  }
}
```

## Accessibility

The system includes support for:
- High contrast mode
- Reduced motion preferences
- Proper color contrast ratios
- Focus indicators

## Theme Integration

Components automatically inherit theme changes through the CSS variable system. No JavaScript required for basic theming.

For dynamic theme switching in TypeScript:
```typescript
document.documentElement.setAttribute('data-theme', 'dark');
// or
document.documentElement.classList.add('dark-theme');
```