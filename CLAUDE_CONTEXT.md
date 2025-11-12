# Trading Bot Platform - AI Context & Knowledge Base

**Purpose**: This document provides a comprehensive knowledge synthesis optimized for AI assistants working on this codebase.

**Last Updated**: 2025-10-01

---

## Project Overview

### What This Is
A cryptocurrency trading bot platform with real-time market data visualization and automated grid trading strategies.

### Tech Stack Summary
- **Frontend**: Angular 18 + TypeScript 5.4.5 + lightweight-charts 5.0.8 + RxJS 7.8
- **Backend**: Next.js 15.5.2 + React 19 + TypeScript 5.x
- **Exchange**: Bybit V5 API (REST + WebSocket)
- **Auth**: JWT + Google OAuth
- **Architecture**: SPA frontend + API backend, WebSocket real-time data

### Key Directories
```
/bot
├── /frontend               # Angular 18 application
│   └── /src/app
│       ├── /components     # UI components
│       ├── /services       # Business logic
│       └── /guards         # Route protection
├── /backend                # Next.js API server
│   └── /src/app/api        # API routes
└── /*.md                   # Documentation
```

---

## Critical Implementation Details

### 1. Real-Time Data Flow (MOST IMPORTANT)

**The Pattern**: REST → WebSocket → BehaviorSubject → Component

```typescript
// CORRECT PATTERN (already implemented):
getRealTimeKlineData(symbol, interval); {
  // 1. Fetch initial data (REST)
  const initial$ = this.getKlineData(symbol, interval, 100);

  // 2. Subscribe to WebSocket
  const ws$ = this.webSocketService.subscribeToKline(symbol, interval);

  // 3. Merge: BehaviorSubject emits full array
  return initial$.pipe(
    switchMap(initialData => {
      const subject = new BehaviorSubject(initialData);

      ws$.subscribe(newCandle => {
        const updated = this.updateCandlestickData(subject.value, newCandle);
        subject.next(updated); // Emit full array, not individual candle
      });

      return subject.asObservable();
    })
  );
}
```

**Chart Update Pattern**:
```typescript
let isFirstLoad = true;

this.bybitService.getRealTimeKlineData(symbol, '1').subscribe(candles => {
  if (isFirstLoad) {
    // Initial: Load all data
    this.candlestickSeries.setData(candles);
    isFirstLoad = false;
  } else {
    // Update: Modify last candle only
    const lastCandle = candles[candles.length - 1];
    this.candlestickSeries.update(lastCandle);
  }
});
```

**Why This Pattern**:
- `setData()`: Replaces entire dataset, expensive, only for initial load
- `update()`: Modifies single point, efficient, for real-time updates
- BehaviorSubject emits full array because component needs context

### 2. Recent Critical Fix - lightweight-charts v5 Migration

**What Changed**:
```typescript
// OLD (v4 - WRONG):
this.chart.addCandlestickSeries({ ... })

// NEW (v5 - CORRECT):
import { CandlestickSeries } from 'lightweight-charts';
this.chart.addSeries(CandlestickSeries, { ... })
```

**Location**: `/frontend/src/app/components/lightweight-chart/lightweight-chart.component.ts:189`

**Why It Matters**: v5 changed the API. Using old method causes runtime errors.

### 3. WebSocket Subscription Flow

**Subscription Key Format**: `${symbol}_${interval}` (e.g., `BTCUSDT_1`)

**Topic Format**: `kline.${interval}.${symbol}` (e.g., `kline.1.BTCUSDT`)

**Critical**: One Subject per subscription key, shared across multiple observers

```typescript
// In BybitWebSocketService
private subscriptions = new Map<string, Subject<CandlestickData>>();

subscribeToKline(symbol, interval) {
  const key = `${symbol}_${interval}`;

  if (!this.subscriptions.has(key)) {
    this.subscriptions.set(key, new Subject<CandlestickData>());
  }

  // ... connect and send subscription message

  return this.subscriptions.get(key).asObservable();
}
```

**Why**: Multiple components can subscribe to same symbol without multiple WebSocket subscriptions.

---

## Architectural Patterns

### Service Layer Architecture

```
Component
    ↓
BybitService (High-level API)
    ↓
BybitWebSocketService (Low-level WebSocket)
    ↓
Bybit Exchange
```

**BybitService**: Combines REST + WebSocket, provides Observable<Array>
**BybitWebSocketService**: Manages connection, provides Observable<Individual>

### Data Transformation Pipeline

```
Bybit Raw (strings)
  → transformBybitData()
  → CandlestickData (numbers, Unix timestamp)
  → Component formatting
  → lightweight-charts (UTCTimestamp)
```

**Critical**: Always convert timestamps to Unix seconds (not milliseconds)

```typescript
// CORRECT:
time: Math.floor(klineData.start / 1000)  // ms → seconds

// WRONG:
time: klineData.start  // leaves in milliseconds
```

### Error Handling Pattern

1. **WebSocket Errors**: Auto-reconnect after 5s
2. **REST API Errors**: Fallback to generated data
3. **Component Errors**: Retry button, error state display

---

## Common Development Tasks

### Adding a New Exchange

1. Create `ExchangeWebSocketService` in `/frontend/src/app/services/`
2. Implement same interface as `BybitWebSocketService`
3. Create `ExchangeService` wrapping the WebSocket service
4. Update components to support exchange selection

### Adding a New Chart Indicator

1. Import indicator from lightweight-charts
2. Add to chart after `addSeries()`
3. Subscribe to data changes
4. Update indicator with `update()` method

### Adding New API Endpoint

**Backend** (`/backend/src/app/api/[route]/route.ts`):
```typescript
export async function GET(request: NextRequest) {
  const user = await validateUser(request);
  // ... implementation
  return NextResponse.json(data);
}
```

**Frontend** (Service):
```typescript
getData(): Observable<T> {
  return this.http.get<T>('/api/route').pipe(
    timeout(10000),
    catchError(this.handleError)
  );
}
```

### Debugging Real-Time Data Issues

**Check these in order**:
1. WebSocket connection state: `this.bybitService.getWebSocketConnectionState()`
2. Active subscriptions: `this.bybitService.getActiveSubscriptions()`
3. Console logs with prefixes: `[WS SERVICE]`, `[BYBIT SERVICE]`, `[CHART]`
4. Network tab: Look for WebSocket connection and messages
5. Data format: Ensure timestamps are Unix seconds

**Common Issues**:
- "No subscription found": Check subscription key format
- "Chart not updating": Verify using `update()` not `setData()`
- "WebSocket disconnected": Check Bybit API status, firewall

---

## Key Files Reference

### Services (Business Logic)

| File | Purpose | Key Methods |
|------|---------|-------------|
| `bybit.service.ts` | Main Bybit integration | `getRealTimeKlineData()`, `getKlineData()` |
| `bybit-websocket.service.ts` | WebSocket manager | `subscribeToKline()`, `connect()` |
| `auth.service.ts` | Authentication | `login()`, `logout()`, `isAuthenticated()` |
| `theme.service.ts` | Theme management | `toggleTheme()`, `currentTheme` signal |

### Components (UI)

| File | Purpose | Inputs/Outputs |
|------|---------|----------------|
| `lightweight-chart.component.ts` | Real-time chart | `@Input() symbol`, `@Output() symbolChange` |
| `bot-config-form.component.ts` | Bot configuration | Grid settings, strategy selection |
| `grid-bot-dashboard.component.ts` | Bot monitoring | Performance metrics, controls |

### Backend Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | User authentication |
| `/api/trading/grid-bot` | GET/POST/PUT/DELETE | Grid bot CRUD |
| `/api/user/profile` | GET/PUT | User profile management |

---

## Code Conventions

### Naming
- **Services**: `*.service.ts` (PascalCase class name)
- **Components**: `*.component.ts` (kebab-case selector)
- **Interfaces**: PascalCase, exported at top of file
- **Observables**: Suffix with `$` (e.g., `data$`)

### RxJS Patterns
```typescript
// GOOD: Explicit subscription cleanup
ngOnDestroy() {
  this.subscription?.unsubscribe();
  this.service.unsubscribeFromKline(this.symbol, '1');
}

// GOOD: Error handling
.pipe(
  timeout(10000),
  catchError(error => {
    console.error('Error:', error);
    return of(fallbackData);
  })
)

// AVOID: Nested subscriptions
// Use switchMap, mergeMap, or combineLatest instead
```

### Console Logging
Use prefixes for easy filtering:
```typescript
console.log('[CHART] Loading data...');
console.log('[WS SERVICE] Connected');
console.log('[BYBIT SERVICE] Fetching candles');
```

### TypeScript
- **Strict mode enabled**: No implicit `any`
- **Interfaces over types** for data structures
- **Signals** for reactive state (Angular 18 feature)

---

## Important Dependencies

### Frontend Critical Packages
```json
{
  "lightweight-charts": "5.0.8",  // v5 API, NOT v4
  "rxjs": "7.8.0",                 // Observable patterns
  "@angular/core": "18.0.0"        // Signals, standalone components
}
```

### Known Compatibility Issues
- **lightweight-charts v5**: Breaking changes from v4, use `addSeries(SeriesType, options)`
- **Angular 18**: Standalone components, signals-based reactivity
- **Next.js 15.5**: App router, server components

---

## Testing Strategies

### Manual Testing Checklist
- [ ] WebSocket connects and shows "Live" status
- [ ] Chart loads initial data
- [ ] Chart updates in real-time (watch candle change)
- [ ] Theme toggle works (light/dark)
- [ ] Symbol change reloads chart
- [ ] Error handling (disconnect network, reconnect)

### Unit Test Patterns
```typescript
// Service tests
it('should combine REST and WebSocket data', (done) => {
  service.getRealTimeKlineData('BTCUSDT', '1')
    .subscribe(candles => {
      expect(candles.length).toBeGreaterThan(0);
      done();
    });
});

// Component tests
it('should initialize chart on AfterViewInit', () => {
  component.ngAfterViewInit();
  expect(component['chart']).toBeTruthy();
});
```

---

## Performance Optimizations

### Implemented
1. **Data Windowing**: Keep only last 1000 candles
2. **Shared Subscriptions**: One WebSocket subscription per symbol/interval
3. **OnPush Change Detection**: For chart component (future enhancement)
4. **Connection Pooling**: Single WebSocket connection

### Recommended Future Optimizations
1. **Virtual Scrolling**: For large data tables
2. **Lazy Loading**: Routes and modules
3. **Web Workers**: For heavy calculations
4. **IndexedDB**: Cache historical data
5. **Service Worker**: PWA offline support

---

## Security Considerations

### Current Implementation
- **JWT Authentication**: Token stored in localStorage
- **Password Hashing**: bcrypt with salt
- **API Key Encryption**: For exchange credentials
- **CORS**: Configured via proxy in development

### Security Best Practices
1. Never commit `.env` files
2. Rotate JWT secrets regularly
3. Use HTTPS in production
4. Implement rate limiting on API endpoints
5. Validate all user inputs
6. Sanitize data before rendering

---

## Common Pitfalls

### 1. Using Wrong Chart API
```typescript
// WRONG (v4 API):
this.chart.addCandlestickSeries()

// CORRECT (v5 API):
this.chart.addSeries(CandlestickSeries, options)
```

### 2. Timestamp Format Confusion
```typescript
// WRONG: Milliseconds
time: 1672324800000

// CORRECT: Seconds
time: 1672324800
```

### 3. Subscription Memory Leaks
```typescript
// WRONG: No cleanup
ngOnInit() {
  this.service.getData().subscribe(data => ...);
}

// CORRECT: Unsubscribe on destroy
private subscription?: Subscription;
ngOnInit() {
  this.subscription = this.service.getData().subscribe(data => ...);
}
ngOnDestroy() {
  this.subscription?.unsubscribe();
}
```

### 4. Chart Update Pattern
```typescript
// WRONG: Using setData() for every update
this.series.setData(newData);  // Recreates entire chart!

// CORRECT: Use update() for real-time changes
this.series.update(lastCandle);  // Efficient update
```

---

## Environment-Specific Notes

### Development
- Frontend: `http://localhost:4200` (proxy to backend)
- Backend: `http://localhost:3000`
- WebSocket: Direct to `wss://stream.bybit.com/v5/public/spot`

### Production
- Serve frontend as static files (Nginx, Vercel, etc.)
- Backend on separate domain or subdomain
- HTTPS required for WebSocket security
- Environment variables in deployment platform

---

## Quick Reference Commands

```bash
# Start development
cd backend && npm run dev &
cd frontend && npm start

# Build for production
cd frontend && npm run build
cd backend && npm run build && npm start

# Testing
cd frontend && npm test
cd backend && npm test

# Linting
cd frontend && npm run lint
cd backend && npm run lint

# Check for updates
npm outdated
```

---

## Documentation Cross-References

- **Architecture Overview**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **WebSocket Data Flow**: See [WEBSOCKET_DATA_FLOW.md](./WEBSOCKET_DATA_FLOW.md)
- **API Documentation**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **Setup Instructions**: See [SETUP.md](./SETUP.md)
- **Trading Configuration**: See [TRADING_SETUP.md](./TRADING_SETUP.md)

---

## Recent Changes & Migration Notes

### October 2025: lightweight-charts v5 Migration
**What Changed**:
- `addCandlestickSeries()` → `addSeries(CandlestickSeries, options)`
- Import `CandlestickSeries` from 'lightweight-charts'
- All series types now follow same pattern

**Files Modified**:
- `/frontend/src/app/components/lightweight-chart/lightweight-chart.component.ts`

**Migration Impact**: Breaking change, must update all chart creation code

### September 2025: WebSocket Subscription Fix
**Problem**: Candles not updating in real-time
**Root Cause**: Subscription key mismatch, Subject not emitting
**Solution**: Enhanced logging, fixed key generation, wrapped Observable
**Files Modified**:
- `/frontend/src/app/services/bybit-websocket.service.ts`
- `/frontend/src/app/services/bybit.service.ts`

---

## Developer Workflow

### Making Changes
1. **Read Documentation**: Check ARCHITECTURE.md and this file first
2. **Understand Data Flow**: Review WEBSOCKET_DATA_FLOW.md for real-time features
3. **Check Existing Patterns**: Follow established conventions
4. **Test Thoroughly**: Manual testing + unit tests
5. **Update Documentation**: Keep docs in sync with code

### Code Review Checklist
- [ ] Follows existing patterns
- [ ] No subscription memory leaks
- [ ] Error handling implemented
- [ ] TypeScript strict mode compliance
- [ ] Console logs use prefixes
- [ ] Documentation updated

---

## Troubleshooting Decision Tree

```
Chart Not Updating
├─ WebSocket Connected?
│  ├─ No → Check connection state, review console
│  └─ Yes → Check subscriptions
│     ├─ Subscription exists?
│     │  ├─ No → Verify subscription key format
│     │  └─ Yes → Check data flow
│     │     ├─ Data received in service?
│     │     │  ├─ No → WebSocket message routing issue
│     │     │  └─ Yes → Check component subscription
│     │     │     ├─ Component receiving data?
│     │     │     │  ├─ No → Observable chain broken
│     │     │     │  └─ Yes → Chart update issue
│     │     │     │     └─ Using update() not setData()?
```

---

## Future Roadmap

### Planned Features
1. Multi-exchange support (Binance, Coinbase)
2. Advanced technical indicators
3. Machine learning strategy optimization
4. Portfolio management
5. Mobile responsive design
6. Database persistence (PostgreSQL)
7. Real-time notifications (WebSocket to client)

### Technical Debt
1. Add comprehensive unit tests
2. Implement E2E tests with Playwright
3. Add error boundary components
4. Implement retry logic with exponential backoff
5. Add performance monitoring (Web Vitals)

---

## Key Takeaways for AI Assistants

1. **Real-Time Data Flow**: Always use getRealTimeKlineData() → BehaviorSubject pattern
2. **Chart Updates**: setData() once, update() thereafter
3. **Subscription Management**: One Subject per key, clean up on destroy
4. **WebSocket**: Single connection, multiplexed subscriptions
5. **Timestamps**: Always Unix seconds, never milliseconds
6. **lightweight-charts v5**: Use addSeries(SeriesType, options)
7. **Console Logs**: Use prefixes [CHART], [WS SERVICE], [BYBIT SERVICE]
8. **Error Handling**: Fallback data, auto-reconnect, user-friendly messages

---

## Contact & Support

For questions about this codebase:
1. Check this document first
2. Review relevant .md documentation
3. Search console logs for error details
4. Check GitHub issues
5. Consult external documentation (Angular, Bybit API, etc.)

**Remember**: This platform is production-grade but actively developed. Always test changes thoroughly!
