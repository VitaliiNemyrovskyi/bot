# Exchange Credentials Architecture - Visual Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Environment Switcher │  │  Credentials List    │  │  Credential Form │  │
│  │   Component          │  │    Component         │  │    Component     │  │
│  │                      │  │                      │  │                  │  │
│  │  [Testnet/Mainnet]   │  │  - Bybit (2)         │  │  Exchange: [▼]   │  │
│  │                      │  │  - Binance (1)       │  │  API Key: [___]  │  │
│  │  🟠 Currently:       │  │  - OKX (1)           │  │  Secret: [***]   │  │
│  │     Testnet          │  │                      │  │  [Test] [Save]   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                              │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           │ Angular Signals & Observables
                           │
┌──────────────────────────┴──────────────────────────────────────────────────┐
│                          SERVICE LAYER (State Management)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────┐    ┌────────────────────────────────┐ │
│  │  ExchangeEnvironmentService     │    │  ExchangeCredentialsService    │ │
│  │  (Global State)                 │    │  (Credential Management)       │ │
│  │                                 │    │                                │ │
│  │  Signals:                       │    │  Signals:                      │ │
│  │  • currentEnvironment           │───▶│  • credentials[]               │ │
│  │  • isTestnet                    │    │  • activeCredential            │ │
│  │  • isMainnet                    │    │  • loading                     │ │
│  │                                 │    │  • error                       │ │
│  │  Methods:                       │    │                                │ │
│  │  • setEnvironment()             │    │  Methods:                      │ │
│  │  • toggleEnvironment()          │    │  • fetchCredentials()          │ │
│  │                                 │    │  • createCredential()          │ │
│  │  Storage: localStorage          │    │  • updateCredential()          │ │
│  └─────────────────────────────────┘    │  • deleteCredential()          │ │
│                   │                      │  • activateCredential()        │ │
│                   │                      │  • testConnection()            │ │
│                   │                      └────────────────────────────────┘ │
│                   │                                      │                   │
│                   └──────────────────────────────────────┘                   │
│                                  │                                           │
│                                  │ Effect: Auto-refetch on env change        │
│                                  │                                           │
└──────────────────────────────────┴───────────────────────────────────────────┘
                                   │
                                   │ HTTP Requests (with JWT)
                                   │
┌──────────────────────────────────┴───────────────────────────────────────────┐
│                          HTTP CLIENT & INTERCEPTORS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐        ┌────────────────────┐                      │
│  │  Auth Interceptor  │───────▶│  HTTP Client       │                      │
│  │  (Add JWT Token)   │        │  (Angular)         │                      │
│  └────────────────────┘        └────────────────────┘                      │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   │ REST API Calls
                                   │
┌──────────────────────────────────┴───────────────────────────────────────────┐
│                              BACKEND API                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /api/exchange-credentials                                                  │
│    GET    /                    - List all credentials                       │
│    POST   /                    - Create credential                          │
│    GET    /:id                 - Get by ID                                  │
│    PATCH  /:id                 - Update credential                          │
│    DELETE /:id                 - Delete credential                          │
│    POST   /:id/activate        - Activate credential                        │
│    POST   /test                - Test connection                            │
│                                                                              │
│  /api/bybit/*                  - All accept ?environment=TESTNET|MAINNET    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Environment Switch

```
USER ACTION: Click "Switch to Mainnet"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ ExchangeEnvironmentSwitcherComponent                    │
│   toggleEnvironment()                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ ExchangeEnvironmentService                              │
│   setEnvironment(MAINNET)                               │
│     ├─▶ _currentEnvironment.set(MAINNET)               │
│     └─▶ localStorage.setItem('exchange_environment')   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Signal Change Propagates
                     │
         ┌───────────┴───────────┬───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Effect in        │  │ Effect in        │  │ Components       │
│ Credentials      │  │ Bybit Service    │  │ Observing Signal │
│ Service          │  │                  │  │                  │
│                  │  │                  │  │ UI Updates       │
│ fetchCredentials()│  │ clearCache()     │  │ Automatically   │
│ (for MAINNET)    │  │ (invalidate data)│  │                  │
└────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
         │                     │
         │ HTTP GET            │ Next API call
         │ ?environment=MAINNET│ uses MAINNET
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│ Backend API                                             │
│   Returns MAINNET credentials/data                      │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AppComponent
│
├─── AppHeaderComponent
│    │
│    └─── ExchangeEnvironmentSwitcherComponent
│         ├─ Input: showLabel, compact
│         ├─ Output: environmentChanged
│         └─ Displays: [Testnet] [Mainnet] toggle
│
├─── RouterOutlet
│    │
│    └─── /settings/exchange-credentials
│         │
│         └─── ExchangeCredentialsListComponent (Smart)
│              ├─ Signals: credentials, loading, error
│              ├─ Computed: groupedCredentials, hasCredentials
│              │
│              ├─── Empty State (when no credentials)
│              │    └─ "Add your first credential" CTA
│              │
│              └─── For each exchange:
│                   └─── ExchangeCredentialCardComponent (Presentation)
│                        ├─ Input: credential, showActions
│                        ├─ Output: activate, edit, delete
│                        │
│                        └─ Displays:
│                           ├─ Exchange logo & name
│                           ├─ Environment badge
│                           ├─ Masked API key (****1234)
│                           ├─ Active/Inactive status
│                           ├─ Last updated timestamp
│                           └─ Actions: [Activate] [Edit] [Delete]
│
│    └─── /settings/exchange-credentials/add
│         │
│         └─── ExchangeCredentialFormComponent (Smart)
│              ├─ FormGroup: exchange, environment, apiKey, apiSecret, label
│              ├─ Signals: loading, testingConnection, testResult
│              │
│              └─ Displays:
│                 ├─ Exchange dropdown
│                 ├─ Environment radio buttons
│                 ├─ API Key input
│                 ├─ API Secret input (masked)
│                 ├─ Label input (optional)
│                 ├─ [Test Connection] button
│                 ├─ Connection test result
│                 └─ [Cancel] [Save] buttons
```

## State Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                   APPLICATION STATE                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ExchangeEnvironmentService (Global Singleton)               │ │
│  │                                                              │ │
│  │  currentEnvironment: Signal<EnvironmentType>                │ │
│  │    └─▶ Persisted to: localStorage['exchange_environment']  │ │
│  │                                                              │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                        │
│                           │ Consumed by:                           │
│                           │                                        │
│  ┌────────────────────────┴─────────────────────────────────────┐ │
│  │  ExchangeCredentialsService (Feature State)                  │ │
│  │                                                              │ │
│  │  credentials: Signal<ExchangeCredential[]>                  │ │
│  │    └─▶ Filtered by: currentEnvironment()                   │ │
│  │                                                              │ │
│  │  activeCredential: Signal<ExchangeCredential | null>        │ │
│  │    └─▶ The currently active credential                     │ │
│  │                                                              │ │
│  │  loading: Signal<boolean>                                   │ │
│  │    └─▶ True during HTTP operations                         │ │
│  │                                                              │ │
│  │  error: Signal<string | null>                               │ │
│  │    └─▶ Error message if operation failed                   │ │
│  │                                                              │ │
│  │  Computed Signals:                                          │ │
│  │    • hasCredentials: computed(() => credentials().length>0) │ │
│  │    • credentialsByExchange: computed(() => groupBy(...))    │ │
│  │    • activeExchange: computed(() => activeCredential()...)  │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## CRUD Operation Flow

### Create Credential Flow

```
1. User fills form
   ├─ Exchange: Bybit
   ├─ Environment: Testnet
   ├─ API Key: abc123...
   └─ API Secret: xyz789...

2. User clicks "Test Connection"
   │
   ▼
┌────────────────────────────────────────────┐
│ ExchangeCredentialsService                 │
│   testConnection(data)                     │
└───────────┬────────────────────────────────┘
            │
            │ HTTP POST /api/exchange-credentials/test
            ▼
┌────────────────────────────────────────────┐
│ Backend validates with exchange API        │
│   ✓ Connection successful                  │
│   Returns: { success: true, accountPreview }│
└───────────┬────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────┐
│ Form displays success message              │
│   "✓ Connection successful!"               │
│   "Balance: 10,000 USDT"                   │
└────────────────────────────────────────────┘

3. User clicks "Save Credentials"
   │
   ▼
┌────────────────────────────────────────────┐
│ ExchangeCredentialsService                 │
│   createCredential(data)                   │
│   ├─▶ _loading.set(true)                   │
│   └─▶ _error.set(null)                     │
└───────────┬────────────────────────────────┘
            │
            │ HTTP POST /api/exchange-credentials
            │ Body: { exchange, environment, apiKey, apiSecret, label }
            ▼
┌────────────────────────────────────────────┐
│ Backend                                    │
│   1. Validates credentials                 │
│   2. Encrypts API secret                   │
│   3. Stores in database                    │
│   4. Returns credential (with masked key)  │
└───────────┬────────────────────────────────┘
            │
            │ Response: { success: true, data: credential }
            ▼
┌────────────────────────────────────────────┐
│ ExchangeCredentialsService                 │
│   ├─▶ Add to credentials array             │
│   │   _credentials.set([...existing, new]) │
│   ├─▶ _loading.set(false)                  │
│   └─▶ Signal propagates to components      │
└───────────┬────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────┐
│ Components auto-update                     │
│   • List shows new credential              │
│   • Navigate back to list                  │
└────────────────────────────────────────────┘
```

### Delete Credential Flow

```
1. User clicks [Delete] on credential card
   │
   ▼
┌────────────────────────────────────────────┐
│ Show confirmation dialog                   │
│   "Are you sure you want to delete         │
│    this credential?"                       │
│   [Cancel] [Delete]                        │
└───────────┬────────────────────────────────┘
            │
            │ User confirms
            ▼
┌────────────────────────────────────────────┐
│ ExchangeCredentialsService                 │
│   deleteCredential(id)                     │
│   ├─▶ _loading.set(true)                   │
│   └─▶ _error.set(null)                     │
└───────────┬────────────────────────────────┘
            │
            │ HTTP DELETE /api/exchange-credentials/:id
            ▼
┌────────────────────────────────────────────┐
│ Backend                                    │
│   1. Verify ownership                      │
│   2. Delete from database                  │
│   3. Return success                        │
└───────────┬────────────────────────────────┘
            │
            │ Response: { success: true }
            ▼
┌────────────────────────────────────────────┐
│ ExchangeCredentialsService                 │
│   ├─▶ Remove from credentials array        │
│   │   _credentials.set(filtered)           │
│   ├─▶ Clear active if was active           │
│   │   if (activeCredential.id === id)      │
│   │     _activeCredential.set(null)        │
│   ├─▶ _loading.set(false)                  │
│   └─▶ Signal propagates                    │
└───────────┬────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────┐
│ Components auto-update                     │
│   • Card disappears from list              │
│   • Show success message                   │
└────────────────────────────────────────────┘
```

## Signal Reactivity Pattern

```
ExchangeEnvironmentService
    │
    │ currentEnvironment: WritableSignal<EnvironmentType>
    │
    └─▶ Exposed as: Signal<EnvironmentType> (readonly)
            │
            ├─────────────────────────────────────────────────┐
            │                                                  │
            ▼                                                  ▼
    ┌──────────────────────┐                    ┌──────────────────────┐
    │ Components           │                    │ Other Services       │
    │                      │                    │                      │
    │ effect(() => {       │                    │ effect(() => {       │
    │   const env =        │                    │   const env =        │
    │   envService         │                    │   envService         │
    │     .current         │                    │     .current         │
    │     Environment();   │                    │     Environment();   │
    │                      │                    │                      │
    │   // React to change │                    │   // React to change │
    │ });                  │                    │ });                  │
    │                      │                    │                      │
    │ Or in template:      │                    │ Or:                  │
    │ {{ currentEnv() }}   │                    │ this.refetchData();  │
    └──────────────────────┘                    └──────────────────────┘

Computed Signals (Derived State):
    │
    │ isTestnet = computed(() =>
    │   currentEnvironment() === EnvironmentType.TESTNET
    │ );
    │
    └─▶ Automatically recomputes when currentEnvironment changes
        │
        └─▶ Components using isTestnet() automatically re-render
```

## Security Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                            │
└────────────────────────────────────────────────────────────────┘

1. FRONTEND (Never Trust)
   ├─ API keys never stored in localStorage
   ├─ API keys masked in UI (****1234)
   ├─ API secrets never logged
   └─ Credentials sent only during create operation

2. TRANSPORT (Always Encrypted)
   ├─ All API calls over HTTPS
   ├─ JWT token in Authorization header
   │  └─▶ Added by Auth Interceptor automatically
   └─ No credentials in URL query parameters

3. BACKEND (Trust Boundary)
   ├─ JWT validation on every request
   ├─ Credential ownership verification
   ├─ API credentials encrypted at rest
   │  └─▶ AES-256 encryption
   ├─ API secrets never returned in responses
   │  └─▶ Only masked preview returned
   └─ Rate limiting on sensitive operations

4. EXCHANGE API (External)
   ├─ Credentials validated with exchange before storing
   ├─ Permissions verified
   └─ Connection tested before activation

┌────────────────────────────────────────────────────────────────┐
│                     NEVER DO THIS                              │
├────────────────────────────────────────────────────────────────┤
│ ❌ console.log('API Key:', apiKey);                            │
│ ❌ localStorage.setItem('apiKey', apiKey);                     │
│ ❌ <div>{{ credential.apiKey }}</div>                          │
│ ❌ /api/credentials?apiKey=abc123                              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                     ALWAYS DO THIS                             │
├────────────────────────────────────────────────────────────────┤
│ ✓ Display: maskApiKey(apiKey) → "****1234"                    │
│ ✓ Send credentials only in request body, not URL              │
│ ✓ Use JWT for authentication, not credentials                 │
│ ✓ Clear sensitive form data after submission                  │
└────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING LAYERS                         │
└─────────────────────────────────────────────────────────────────┘

HTTP ERROR (from Backend)
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Service: handleError() method                                   │
│   1. Log error to console                                       │
│   2. Extract user-friendly message                              │
│   3. Set error signal: _error.set(message)                      │
│   4. Return throwError()                                        │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Component: Observable subscription error handler                │
│   .subscribe({                                                  │
│     error: (err) => {                                           │
│       // Display error to user                                  │
│       // Optionally: log to analytics                           │
│     }                                                           │
│   })                                                            │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ UI: Display Error                                               │
│   <div *ngIf="error()" class="error-message">                   │
│     {{ error() }}                                               │
│     <button (click)="retry()">Retry</button>                    │
│   </div>                                                        │
└─────────────────────────────────────────────────────────────────┘

ERROR TYPES & HANDLING:

┌───────────────────┬──────────────────────────────────────────────┐
│ Error Code        │ User Message                                 │
├───────────────────┼──────────────────────────────────────────────┤
│ 0 (Network)       │ "Unable to connect to server"                │
│ 401 (Auth)        │ "Please log in again"                        │
│ 403 (Forbidden)   │ "You don't have permission"                  │
│ 404 (Not Found)   │ "Credential not found"                       │
│ 409 (Conflict)    │ "Credential already exists"                  │
│ 422 (Validation)  │ "Invalid data provided"                      │
│ 500 (Server)      │ "Server error. Please try again later"      │
└───────────────────┴──────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE STRATEGIES                         │
└─────────────────────────────────────────────────────────────────┘

1. LAZY LOADING
   ├─ Credentials components loaded only when route accessed
   ├─ Tree-shakeable standalone components
   └─ Small initial bundle size

2. SIGNAL-BASED REACTIVITY
   ├─ Fine-grained change detection
   ├─ Only affected components re-render
   └─ Better than zone-based change detection

3. COMPUTED SIGNALS (MEMOIZATION)
   ├─ credentialsByExchange = computed(() => ...)
   ├─ Only recomputes when dependencies change
   └─ Cached until next change

4. HTTP CACHING
   ├─ Credentials cached in service after fetch
   ├─ Only refetch on:
   │  ├─ Environment change
   │  ├─ Explicit refresh
   │  └─ CRUD operation
   └─ 5-minute cache expiry (configurable)

5. CHANGE DETECTION STRATEGY
   ├─ Components use OnPush strategy
   ├─ Change detection triggered by:
   │  ├─ Signal changes
   │  ├─ Event handlers
   │  └─ Async pipe
   └─ Minimal re-renders

┌─────────────────────────────────────────────────────────────────┐
│                   BUNDLE SIZE ANALYSIS                          │
├─────────────────────────────────────────────────────────────────┤
│ Main bundle (initial):           ~200 KB (with tree-shaking)   │
│ Credentials module (lazy):       ~50 KB                        │
│ Total with credentials:           ~250 KB                      │
│                                                                 │
│ Load time (on 4G):                ~1-2 seconds                 │
│ Time to Interactive:              ~2-3 seconds                 │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Strategy Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                      TESTING PYRAMID                            │
└─────────────────────────────────────────────────────────────────┘

                     ▲
                    ╱ ╲
                   ╱E2E╲           E2E Tests (5-10 tests)
                  ╱─────╲          • Full user journeys
                 ╱       ╲         • Critical paths only
                ╱─────────╲
               ╱Integration╲       Integration Tests (20-30 tests)
              ╱─────────────╲      • Service interactions
             ╱               ╲     • Component communication
            ╱─────────────────╲    • HTTP mocking
           ╱      Unit         ╲   Unit Tests (100+ tests)
          ╱───────────────────────╲ • Service methods
         ╱                         ╲• Component logic
        ╱───────────────────────────╲• Utility functions
       ╱_____________________________╲

UNIT TESTS (Fast, Many)
├─ ExchangeEnvironmentService
│  ├─ setEnvironment()
│  ├─ toggleEnvironment()
│  ├─ localStorage persistence
│  └─ signal updates
├─ ExchangeCredentialsService
│  ├─ fetchCredentials()
│  ├─ createCredential()
│  ├─ updateCredential()
│  ├─ deleteCredential()
│  ├─ activateCredential()
│  ├─ testConnection()
│  └─ error handling
└─ Components
   ├─ Input/Output binding
   ├─ Form validation
   └─ Event handling

INTEGRATION TESTS (Medium Speed, Moderate)
├─ Environment change triggers credential refetch
├─ Create credential updates list
├─ Delete credential removes from UI
└─ Activate credential updates active state

E2E TESTS (Slow, Few)
├─ Complete add credential flow
├─ Switch environment and verify data changes
└─ Edit and delete credential
```

---

This visual diagram document complements the detailed architecture documents and provides quick visual references for understanding the system structure, data flows, and key concepts.
