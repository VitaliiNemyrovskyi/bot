# Subscription Highlighting Fix

## Problem
The subscription highlighting in the Cross-Exchange Arbitrage Opportunities table was not working. Rows with active subscriptions should have been highlighted with a blue background and blue left border, but the styling was not being applied.

## Root Causes Identified

1. **Performance Issue with Method Calls in Templates**: The `hasActiveSubscription()` method was being called directly in the template, which can cause performance issues and may not properly trigger change detection with Angular signals.

2. **CSS Specificity Issue**: The `.has-subscription` class was defined at the global component level, but it needed to be inside the `.arbitrage-table tbody tr` scope to have proper specificity and override the default table row styles.

3. **Missing Hover State Override**: The table's default hover state (`background: var(--background-secondary)`) could override the subscription highlighting when the user hovers over a row.

## Solution Implemented

### 1. Created Computed Signal for Subscribed Symbols
**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/components/trading/funding-rates/funding-rates.component.ts`

Added a computed signal that creates a Set of subscribed symbols for efficient lookup:

```typescript
/**
 * Set of symbols with active subscriptions for efficient lookup
 */
subscribedSymbols = computed(() => {
  const subs = Array.from(this.subscriptions().values());
  const symbols = new Set(subs.map(sub => sub.symbol));
  console.log('[subscribedSymbols] Computed signal updated. Active symbols:', Array.from(symbols));
  return symbols;
});
```

**Benefits**:
- Reactive: Automatically updates when subscriptions change
- Efficient: O(1) lookup time using Set
- Properly tracked by Angular's change detection

### 2. Updated hasActiveSubscription Method
**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/components/trading/funding-rates/funding-rates.component.ts`

Simplified the method to use the computed signal:

```typescript
/**
 * Check if a symbol has an active subscription
 */
hasActiveSubscription(symbol: string): boolean {
  const hasSubscription = this.subscribedSymbols().has(symbol);

  // Debug logging
  if (hasSubscription) {
    console.log('[hasActiveSubscription] Symbol has subscription:', symbol);
  }

  return hasSubscription;
}
```

### 3. Fixed CSS Specificity
**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/components/trading/funding-rates/funding-rates.component.scss`

Moved the `.has-subscription` style inside the `.arbitrage-table tbody tr` scope:

```scss
.arbitrage-table {
  tbody {
    tr {
      // ... existing styles

      &.opportunity-row {
        background: rgba(255, 215, 0, 0.05);
        border-left: 3px solid rgba(255, 215, 0, 0.5);
      }

      &.has-subscription {
        background: rgba(59, 130, 246, 0.05) !important;
        border-left: 3px solid var(--primary-color) !important;

        &:hover {
          background: rgba(59, 130, 246, 0.1) !important;
        }
      }
    }
  }
}
```

**Changes**:
- Proper CSS specificity by nesting inside the table structure
- Used `!important` to ensure it overrides default row styles
- Added hover state override for better UX

### 4. Added Debug Logging
Added comprehensive console logging to help diagnose the issue:

- `[subscribedSymbols]` - Logs when the computed signal updates with the list of active symbols
- `[hasActiveSubscription]` - Logs when a symbol is found to have an active subscription
- `[loadSubscriptions]` - Enhanced logging when subscriptions are loaded from the API

## Testing Instructions

1. **Open the application** and navigate to the Funding Rates page
2. **Open Browser DevTools Console** to see debug logs
3. **Create a subscription** for any symbol in the Cross-Exchange Arbitrage Opportunities table
4. **Verify the following**:
   - The console should show `[loadSubscriptions]` logs with the active subscription symbols
   - The console should show `[subscribedSymbols]` log with the Set of active symbols
   - The row for the subscribed symbol should have:
     - Light blue background: `rgba(59, 130, 246, 0.05)`
     - Blue left border: `3px solid #3b82f6`
   - When hovering over a subscribed row, the background should darken slightly: `rgba(59, 130, 246, 0.1)`
5. **Cancel the subscription** and verify the highlighting is removed

## Expected Visual Result

- **Normal Row**: Default background, no left border
- **Opportunity Row** (high spread): Light gold background, gold left border
- **Subscribed Row**: Light blue background (#3b82f6 at 5% opacity), blue left border (3px solid)
- **Subscribed Row (Hover)**: Darker blue background (#3b82f6 at 10% opacity), blue left border

## Technical Details

### Data Flow
1. User authenticates → Backend loads subscriptions
2. `loadSubscriptions()` method fetches subscriptions via API
3. Subscriptions stored in `subscriptions` signal (Map<string, FundingSubscription>)
4. `subscribedSymbols` computed signal reacts to changes, creates Set of symbols
5. Template evaluates `hasActiveSubscription(symbol)` for each row
6. Method checks if symbol exists in the Set from computed signal
7. Angular applies `has-subscription` class if true
8. CSS styles are applied with proper specificity

### Performance Optimization
- Using computed signals ensures Angular tracks dependencies properly
- Set lookup is O(1) vs O(n) for array iteration
- Change detection only runs when subscriptions actually change

## Files Modified

1. `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/components/trading/funding-rates/funding-rates.component.ts`
   - Added `subscribedSymbols` computed signal
   - Updated `hasActiveSubscription()` method
   - Enhanced debug logging in `loadSubscriptions()`

2. `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/components/trading/funding-rates/funding-rates.component.scss`
   - Moved `.has-subscription` style into `.arbitrage-table tbody tr` scope
   - Added `!important` flags for specificity
   - Added hover state override

3. `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/components/trading/funding-rates/funding-rates.component.html`
   - No changes (template was already correct)

## Related Components

- **FundingSubscription Interface**: Defines the structure of subscription data
- **Cross-Exchange Arbitrage API**: Backend endpoint that provides arbitrage opportunities
- **Subscription API**: Backend endpoint that manages subscriptions

## Future Improvements

1. **Remove Debug Logging**: Once verified working, remove console.log statements in production
2. **Unit Tests**: Add tests for `subscribedSymbols` computed signal and `hasActiveSubscription()` method
3. **Visual Feedback**: Consider adding a subscription icon or badge in addition to the background highlight
4. **Accessibility**: Ensure screen readers can identify subscribed rows (add ARIA attributes)
