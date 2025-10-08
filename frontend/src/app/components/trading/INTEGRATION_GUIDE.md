# Trading Dashboard - Quick Integration Guide

This guide will help you integrate the trading dashboard into your Angular application in 5 minutes.

## Step 1: Verify File Structure

Ensure all files are in place:

```
frontend/src/app/
├── components/
│   └── trading/
│       └── trading-dashboard/
│           ├── trading-dashboard.component.ts
│           ├── trading-dashboard.component.html
│           ├── trading-dashboard.component.css
│           ├── trading-dashboard.component.spec.ts
│           └── README.md
├── services/
│   ├── manual-trading.service.ts
│   └── translations/
│       └── trading-translations.ts
└── models/
    └── trading.model.ts
```

## Step 2: Add Translations

Open `src/app/services/translation.service.ts` and add the trading translations:

```typescript
import { tradingTranslations } from './translations/trading-translations';

// Find the translations object and merge for each language:
private translations: Record<Language, Record<string, string>> = {
  en: {
    // ... existing English translations
    ...tradingTranslations.en,
  },
  es: {
    // ... existing Spanish translations
    ...tradingTranslations.es,
  },
  fr: {
    // ... existing French translations
    ...tradingTranslations.fr,
  },
  ru: {
    // ... existing Russian translations
    ...tradingTranslations.ru,
  },
  uk: {
    // ... existing Ukrainian translations
    ...tradingTranslations.uk,
  }
};
```

## Step 3: Add Route

Open `src/app/app.routes.ts` and add the trading dashboard route:

```typescript
import { TradingDashboardComponent } from './components/trading/trading-dashboard/trading-dashboard.component';

export const routes: Routes = [
  // ... your existing routes
  {
    path: 'trading/manual',
    component: TradingDashboardComponent,
    // Optional: Add auth guard if needed
    // canActivate: [AuthGuard]
  }
];
```

## Step 4: Add Navigation Link (Optional)

Add a link to your navigation menu:

```html
<a routerLink="/trading/manual">Manual Trading</a>
```

Or using your UI components:

```html
<ui-button variant="primary" routerLink="/trading/manual">
  Manual Trading
</ui-button>
```

## Step 5: Test with Mock Data

The component works with mock data by default. Navigate to:
```
http://localhost:4200/trading/manual
```

You should see:
- ✅ Order placement form
- ✅ Account balance card (with mock data)
- ✅ 2 mock open positions
- ✅ 2 mock orders in history

## Step 6: Connect to Backend API (When Ready)

### 6.1 Update Service Base URL

In `src/app/services/manual-trading.service.ts`:

```typescript
private readonly baseUrl = 'http://localhost:3000/api'; // Your backend URL
```

### 6.2 Replace Mock Data Loading

In `trading-dashboard.component.ts`, find the `loadAllData()` method:

```typescript
// Replace this:
loadAllData(): void {
  this.loadMockData();
}

// With this:
loadAllData(): void {
  const exchange = this.selectedExchange();
  this.tradingService.getPositions(exchange).subscribe();
  this.tradingService.getOrders(exchange).subscribe();
  this.tradingService.getAccountBalance(exchange).subscribe();
}
```

### 6.3 Backend API Endpoints Required

Your backend needs to implement these endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bybit/order` | Place new order |
| GET | `/api/bybit/positions` | Get open positions |
| GET | `/api/bybit/orders` | Get order history |
| GET | `/api/bybit/balance` | Get account balance |
| POST | `/api/bybit/position/close` | Close position |
| DELETE | `/api/bybit/order/:orderId` | Cancel order |

## Step 7: Verify Everything Works

### Test Checklist:
- [ ] Page loads without errors
- [ ] Form validation works (try submitting empty form)
- [ ] Can select different exchanges
- [ ] Can select different trading pairs
- [ ] Order type changes between Market/Limit
- [ ] Balance card displays properly
- [ ] Positions table shows data
- [ ] Orders table shows data
- [ ] Refresh button works
- [ ] Auto-refresh toggle works
- [ ] Dark mode works (if enabled)
- [ ] Responsive on mobile (check with DevTools)

## Troubleshooting

### Problem: Component doesn't load
**Solution**: Check browser console for errors. Ensure all dependencies are imported.

### Problem: Translations show as "Translated Text"
**Solution**: Translation keys not added. Complete Step 2 properly.

### Problem: "Cannot find module" errors
**Solution**: Restart dev server: `ng serve`

### Problem: Styles look broken
**Solution**: Ensure CSS variables are defined in `src/styles.scss`

### Problem: API calls fail
**Solution**: Check CORS configuration on backend. Check network tab in DevTools.

## Advanced Configuration

### Change Default Exchange
```typescript
// In trading-dashboard.component.ts constructor:
this.selectedExchange.set('binance'); // Instead of 'bybit'
```

### Change Auto-Refresh Interval
```typescript
// In toggleAutoRefresh() method:
this.tradingService.setupAutoRefresh(exchange, 5000) // 5 seconds instead of 10
```

### Add Custom Trading Pairs
```typescript
// In trading-dashboard.component.ts:
symbolOptions: SelectOption[] = [
  // Add your custom pairs
  { value: 'CUSTOMUSDT', label: 'CUSTOM/USDT' },
  // ... existing pairs
];
```

### Customize Colors
```css
/* In src/styles.scss or component CSS: */
:root {
  --primary-color: #your-color;
  /* Buy/Sell colors */
  .side-buy { color: #your-green; }
  .side-sell { color: #your-red; }
}
```

## Production Deployment

Before deploying to production:

1. **Remove or Disable Mock Data**
   - Ensure `loadMockData()` is not being called
   - All data comes from real API

2. **Enable Production Mode**
   ```typescript
   // In main.ts (should already be there)
   if (environment.production) {
     enableProdMode();
   }
   ```

3. **Configure Backend URL**
   - Use environment variables
   - Don't hardcode production URLs

4. **Security Checklist**
   - [ ] API authentication implemented
   - [ ] HTTPS enabled
   - [ ] CORS properly configured
   - [ ] Rate limiting enabled
   - [ ] Input validation on backend
   - [ ] Error messages don't expose sensitive info

5. **Performance Optimization**
   - [ ] Enable production build: `ng build --configuration=production`
   - [ ] Enable gzip compression on server
   - [ ] Set up CDN for static assets
   - [ ] Monitor bundle size

## Need Help?

1. **Check the README**: Detailed documentation in `trading-dashboard/README.md`
2. **Review Tests**: See usage examples in `.spec.ts` file
3. **Check Inline Docs**: JSDoc comments in TypeScript files
4. **Browser DevTools**: Check console and network tabs for errors

## Next Steps

After successful integration:

1. **Add WebSocket Support**: For real-time price updates
2. **Implement Notifications**: Toast messages for order success/failure
3. **Add Charts**: Price charts for selected trading pair
4. **Add Order Book**: Real-time order book display
5. **Add Trade History**: Recent trades for the pair
6. **Enhanced Analytics**: PnL charts, win rate, statistics

## Example Backend Response Formats

### Position Response
```json
{
  "id": "pos-123",
  "exchange": "bybit",
  "symbol": "BTCUSDT",
  "side": "Buy",
  "size": 0.1,
  "entryPrice": 50000,
  "markPrice": 51000,
  "leverage": 10,
  "unrealizedPnl": 100,
  "unrealizedPnlPercent": 2,
  "createdAt": "2025-10-03T10:00:00Z",
  "updatedAt": "2025-10-03T10:30:00Z"
}
```

### Order Response
```json
{
  "orderId": "order-123",
  "exchange": "bybit",
  "symbol": "BTCUSDT",
  "side": "Buy",
  "type": "Limit",
  "quantity": 0.1,
  "price": 49000,
  "status": "New",
  "timeInForce": "GTC",
  "filledQuantity": 0,
  "createdAt": "2025-10-03T10:00:00Z",
  "updatedAt": "2025-10-03T10:00:00Z"
}
```

### Balance Response
```json
{
  "exchange": "bybit",
  "totalBalance": 10175,
  "availableBalance": 8675,
  "usedMargin": 1400,
  "unrealizedPnl": 175,
  "walletBalance": 10000,
  "currency": "USDT",
  "updatedAt": "2025-10-03T10:30:00Z"
}
```

---

**Integration Time**: ~5 minutes
**Difficulty**: Easy
**Prerequisites**: Angular 18+, UI components, Translation service
