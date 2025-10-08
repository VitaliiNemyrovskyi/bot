# Exchange Credentials Management Architecture

## Executive Summary

This document outlines the comprehensive Angular frontend architecture for managing multiple cryptocurrency exchange credentials with testnet/mainnet environment switching. The design follows Angular best practices, uses standalone components, leverages signals for reactive state management, and ensures scalability for supporting multiple exchanges (Bybit, Binance, OKX, etc.).

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management Strategy](#state-management-strategy)
3. [Service Layer Design](#service-layer-design)
4. [Component Hierarchy](#component-hierarchy)
5. [Routing Configuration](#routing-configuration)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Type System & Interfaces](#type-system--interfaces)
8. [Integration Strategy](#integration-strategy)
9. [Security Considerations](#security-considerations)
10. [Future Extensibility](#future-extensibility)

---

## 1. Architecture Overview

### 1.1 Design Principles

- **Single Responsibility**: Each service and component has one clear purpose
- **Reactive State Management**: Leverage Angular signals for fine-grained reactivity
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Scalability**: Architecture supports adding new exchanges without refactoring
- **Testability**: Services and components designed for easy unit testing
- **Performance**: Lazy loading, change detection optimization, and efficient state updates

### 1.2 Module Structure

```
src/app/
├── services/
│   ├── exchange-credentials.service.ts    (NEW)
│   ├── exchange-environment.service.ts    (NEW)
│   └── bybit-user.service.ts              (UPDATED)
├── components/
│   └── exchange-credentials/              (NEW)
│       ├── exchange-environment-switcher/
│       ├── exchange-credentials-list/
│       ├── exchange-credential-form/
│       └── exchange-credential-card/
├── models/
│   └── exchange-credentials.models.ts     (NEW)
├── config/
│   └── app.config.ts                      (UPDATED)
└── app.routes.ts                          (UPDATED)
```

### 1.3 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Signals for State** | Modern Angular reactive primitive, better performance than BehaviorSubject |
| **Standalone Components** | Simplified dependency management, better tree-shaking |
| **Service-based State** | Centralized state management without NgRx overhead |
| **Local Storage for Preferences** | Persist user environment selection across sessions |
| **Separate Services** | Credentials and Environment concerns separated for maintainability |

---

## 2. State Management Strategy

### 2.1 State Architecture

The application uses a **Service-based State Management** pattern with Angular Signals:

```
┌─────────────────────────────────────────────────────────┐
│         ExchangeEnvironmentService (Global)             │
│  - currentEnvironment: Signal<EnvironmentType>          │
│  - Persists to localStorage                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──> ExchangeCredentialsService
                 │    - credentials: Signal<ExchangeCredential[]>
                 │    - activeCredential: Signal<ExchangeCredential | null>
                 │    - loading: Signal<boolean>
                 │    - error: Signal<string | null>
                 │
                 └──> BybitUserService (UPDATED)
                      - Uses environment to fetch correct credentials
                      - Reacts to environment changes
```

### 2.2 State Synchronization Flow

1. **User Action**: User switches environment (Testnet → Mainnet)
2. **Environment Service**: Updates signal and localStorage
3. **Credentials Service**: Observes environment change, refetches credentials
4. **Bybit Service**: Observes environment change, invalidates cache, refetches data
5. **Components**: React to signal changes, update UI

### 2.3 State Persistence

- **Environment Preference**: Stored in `localStorage` as `exchange_environment`
- **Credentials**: Fetched from backend on demand, cached in service signals
- **Active Credential**: Tracked in service, not persisted (server determines active)

---

## 3. Service Layer Design

### 3.1 ExchangeEnvironmentService

**Purpose**: Manage global exchange environment selection (testnet/mainnet)

**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/services/exchange-environment.service.ts`

```typescript
@Injectable({
  providedIn: 'root'
})
export class ExchangeEnvironmentService {
  // Signals
  private readonly _currentEnvironment: WritableSignal<EnvironmentType>;
  public readonly currentEnvironment: Signal<EnvironmentType>;

  // Observables (for RxJS interop)
  public readonly currentEnvironment$: Observable<EnvironmentType>;

  constructor() {
    // Initialize from localStorage or default to TESTNET
    const stored = this.getStoredEnvironment();
    this._currentEnvironment = signal(stored || EnvironmentType.TESTNET);
    this.currentEnvironment = this._currentEnvironment.asReadonly();

    // Create observable from signal
    this.currentEnvironment$ = toObservable(this.currentEnvironment);
  }

  // Public Methods
  public setEnvironment(env: EnvironmentType): void;
  public toggleEnvironment(): void;
  public isTestnet(): boolean;
  public isMainnet(): boolean;

  // Private Methods
  private getStoredEnvironment(): EnvironmentType | null;
  private persistEnvironment(env: EnvironmentType): void;
}
```

**Key Responsibilities**:
- Maintain single source of truth for environment selection
- Persist preference to localStorage
- Emit changes via signals and observables
- Provide convenience methods for environment checks

**State Management**:
- Uses `WritableSignal` internally
- Exposes `ReadonlySignal` to consumers
- Provides `Observable` for RxJS compatibility

---

### 3.2 ExchangeCredentialsService

**Purpose**: Manage CRUD operations for exchange credentials across multiple exchanges

**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/services/exchange-credentials.service.ts`

```typescript
@Injectable({
  providedIn: 'root'
})
export class ExchangeCredentialsService {
  // Signals
  private readonly _credentials = signal<ExchangeCredential[]>([]);
  public readonly credentials = this._credentials.asReadonly();

  private readonly _activeCredential = signal<ExchangeCredential | null>(null);
  public readonly activeCredential = this._activeCredential.asReadonly();

  private readonly _loading = signal<boolean>(false);
  public readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  public readonly error = this._error.asReadonly();

  // Computed Signals
  public readonly hasCredentials = computed(() => this.credentials().length > 0);
  public readonly activeExchange = computed(() => this.activeCredential()?.exchange ?? null);
  public readonly credentialsByExchange = computed(() => this.groupByExchange(this.credentials()));

  constructor(
    private http: HttpClient,
    private environmentService: ExchangeEnvironmentService
  ) {
    // React to environment changes
    effect(() => {
      const env = this.environmentService.currentEnvironment();
      this.fetchCredentials();
    });
  }

  // CRUD Operations
  public fetchCredentials(): Observable<ExchangeCredential[]>;
  public getCredentialById(id: string): Observable<ExchangeCredential>;
  public createCredential(data: CreateExchangeCredentialRequest): Observable<ExchangeCredential>;
  public updateCredential(id: string, data: UpdateExchangeCredentialRequest): Observable<ExchangeCredential>;
  public deleteCredential(id: string): Observable<void>;
  public activateCredential(id: string): Observable<ExchangeCredential>;

  // Utility Methods
  public getCredentialsForExchange(exchange: ExchangeType): ExchangeCredential[];
  public getActiveCredentialForExchange(exchange: ExchangeType): ExchangeCredential | null;
  public testConnection(data: TestConnectionRequest): Observable<TestConnectionResponse>;
  public refreshCredentials(): void;
  public clearError(): void;

  // Private Methods
  private groupByExchange(credentials: ExchangeCredential[]): Map<ExchangeType, ExchangeCredential[]>;
  private updateCredentialsState(credentials: ExchangeCredential[]): void;
  private handleError(error: HttpErrorResponse): Observable<never>;
}
```

**Key Responsibilities**:
- Fetch and cache all user credentials
- Perform CRUD operations via HTTP
- Track active credential per exchange
- React to environment changes
- Provide derived state via computed signals

**State Management**:
- All state stored in signals
- Computed signals for derived data
- Effect for environment synchronization
- Error state management

**HTTP Integration**:
- All operations return Observables
- Automatic JWT token injection via interceptor
- Centralized error handling
- Loading state management

---

### 3.3 BybitUserService (UPDATED)

**Updates Required**:

```typescript
@Injectable({
  providedIn: 'root'
})
export class BybitUserService {
  // Existing implementation...

  constructor(
    private http: HttpClient,
    private environmentService: ExchangeEnvironmentService  // NEW
  ) {
    // React to environment changes
    effect(() => {
      const env = this.environmentService.currentEnvironment();
      this.clearUserInfo(); // Clear cache when environment changes
    });
  }

  // NEW: All API calls should include environment context
  getUserInfo(): Observable<BybitUserInfo> {
    const env = this.environmentService.currentEnvironment();
    return this.http.get<BybitUserInfo>(
      getEndpointUrl('bybit', 'userInfo'),
      { params: { environment: env } }
    );
  }

  // Similar updates for other methods...
}
```

**Integration Points**:
- Inject `ExchangeEnvironmentService`
- Add environment parameter to all API calls
- Clear cached data on environment switch
- Update stored keys checking to be environment-aware

---

## 4. Component Hierarchy

### 4.1 Component Tree Structure

```
ExchangeCredentialsPageComponent (Smart Container)
│
├── ExchangeEnvironmentSwitcherComponent (Presentation)
│   └── Displays in page header or toolbar
│
└── ExchangeCredentialsListComponent (Smart)
    │
    ├── Empty State (when no credentials)
    │
    └── For each exchange:
        └── ExchangeCredentialCardComponent (Presentation)
            ├── Exchange Logo & Name
            ├── Environment Badge
            ├── Masked API Key
            ├── Active/Inactive Badge
            └── Actions: [Activate, Edit, Delete]

ExchangeCredentialFormComponent (Smart Container)
├── Form Fields
├── Validation Messages
└── Actions: [Test Connection, Save, Cancel]
```

### 4.2 Component Specifications

#### 4.2.1 ExchangeEnvironmentSwitcherComponent

**Purpose**: Global environment toggle (Testnet ↔ Mainnet)

**Location**: Can be placed in:
- Application header/toolbar
- Settings page
- Any page needing environment context

**Component Signature**:
```typescript
@Component({
  selector: 'app-exchange-environment-switcher',
  standalone: true,
  templateUrl: './exchange-environment-switcher.component.html',
  styleUrl: './exchange-environment-switcher.component.css'
})
export class ExchangeEnvironmentSwitcherComponent {
  // Inputs
  @Input() showLabel: boolean = true;
  @Input() compact: boolean = false;

  // Outputs
  @Output() environmentChanged = new EventEmitter<EnvironmentType>();

  // Signals
  protected readonly currentEnvironment: Signal<EnvironmentType>;
  protected readonly isTestnet: Signal<boolean>;

  constructor(private environmentService: ExchangeEnvironmentService) {
    this.currentEnvironment = this.environmentService.currentEnvironment;
    this.isTestnet = computed(() => this.currentEnvironment() === EnvironmentType.TESTNET);
  }

  // Methods
  toggleEnvironment(): void;
  setEnvironment(env: EnvironmentType): void;
}
```

**UI Features**:
- Toggle switch or segmented control
- Visual indication of current environment (colors: Testnet=Orange, Mainnet=Blue)
- Confirmation dialog when switching with active connections
- Disabled state when operations in progress
- Tooltip explaining environment differences

**Visual Design**:
```
┌────────────────────────────────┐
│  Environment: [TESTNET] MAINNET │  ← Segmented control
│  🟠 Currently in Testnet mode    │  ← Status indicator
└────────────────────────────────┘
```

---

#### 4.2.2 ExchangeCredentialsListComponent

**Purpose**: Display all configured exchange credentials with management actions

**Component Signature**:
```typescript
@Component({
  selector: 'app-exchange-credentials-list',
  standalone: true,
  imports: [CommonModule, ExchangeCredentialCardComponent],
  templateUrl: './exchange-credentials-list.component.html',
  styleUrl: './exchange-credentials-list.component.css'
})
export class ExchangeCredentialsListComponent {
  // Signals
  protected readonly credentials: Signal<ExchangeCredential[]>;
  protected readonly loading: Signal<boolean>;
  protected readonly error: Signal<string | null>;
  protected readonly hasCredentials: Signal<boolean>;
  protected readonly currentEnvironment: Signal<EnvironmentType>;

  // Computed
  protected readonly groupedCredentials: Signal<Map<ExchangeType, ExchangeCredential[]>>;

  constructor(
    private credentialsService: ExchangeCredentialsService,
    private environmentService: ExchangeEnvironmentService,
    private router: Router
  ) {
    this.credentials = this.credentialsService.credentials;
    this.loading = this.credentialsService.loading;
    this.error = this.credentialsService.error;
    this.hasCredentials = this.credentialsService.hasCredentials;
    this.currentEnvironment = this.environmentService.currentEnvironment;

    this.groupedCredentials = computed(() => {
      const creds = this.credentials();
      return this.groupByExchange(creds);
    });
  }

  ngOnInit(): void;
  onAddCredential(): void;
  onEditCredential(credential: ExchangeCredential): void;
  onDeleteCredential(credential: ExchangeCredential): void;
  onActivateCredential(credential: ExchangeCredential): void;
  onRefresh(): void;

  private groupByExchange(credentials: ExchangeCredential[]): Map<ExchangeType, ExchangeCredential[]>;
}
```

**UI Features**:
- Grouped by exchange (Bybit, Binance, OKX, etc.)
- Filter by environment (current environment highlighted)
- Search/filter functionality
- Add new credential button (prominent)
- Refresh button
- Empty state with call-to-action
- Loading skeleton screens
- Error messages with retry option

**Visual Layout**:
```
┌──────────────────────────────────────────────────────┐
│ Exchange Credentials         [+ Add New] [Refresh]   │
├──────────────────────────────────────────────────────┤
│                                                       │
│ BYBIT                                                 │
│ ┌──────────────────┐  ┌──────────────────┐          │
│ │ Testnet Card     │  │ Mainnet Card     │          │
│ └──────────────────┘  └──────────────────┘          │
│                                                       │
│ BINANCE                                               │
│ ┌──────────────────┐                                 │
│ │ Mainnet Card     │                                 │
│ └──────────────────┘                                 │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

#### 4.2.3 ExchangeCredentialFormComponent

**Purpose**: Add or edit exchange credentials with validation and testing

**Component Signature**:
```typescript
@Component({
  selector: 'app-exchange-credential-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exchange-credential-form.component.html',
  styleUrl: './exchange-credential-form.component.css'
})
export class ExchangeCredentialFormComponent implements OnInit {
  // Inputs
  @Input() credentialId?: string;  // For edit mode
  @Input() mode: 'create' | 'edit' = 'create';

  // Signals
  protected readonly loading: Signal<boolean>;
  protected readonly testingConnection = signal<boolean>(false);
  protected readonly testResult = signal<TestConnectionResponse | null>(null);

  // Form
  protected credentialForm: FormGroup;

  // Computed
  protected readonly formTitle = computed(() =>
    this.mode === 'create' ? 'Add Exchange Credentials' : 'Edit Credentials'
  );
  protected readonly submitButtonText = computed(() =>
    this.mode === 'create' ? 'Save Credentials' : 'Update Credentials'
  );

  constructor(
    private fb: FormBuilder,
    private credentialsService: ExchangeCredentialsService,
    private router: Router
  ) {
    this.loading = this.credentialsService.loading;
    this.initializeForm();
  }

  ngOnInit(): void;
  onSubmit(): void;
  onTestConnection(): void;
  onCancel(): void;

  private initializeForm(): void;
  private loadCredential(id: string): void;
  private validateForm(): boolean;
  private maskApiKey(key: string): string;
}
```

**Form Fields**:
1. **Exchange** (dropdown, required)
   - Options: Bybit, Binance, OKX, etc.
   - Disabled in edit mode

2. **Environment** (radio buttons, required)
   - Testnet / Mainnet
   - Disabled in edit mode

3. **API Key** (text input, required)
   - Masked in edit mode
   - Validation: min length, format

4. **API Secret** (password input, required)
   - Always masked
   - Show/hide toggle
   - Validation: min length

5. **Label** (text input, optional)
   - User-friendly name (e.g., "My Trading Account")
   - Max length: 50 characters

**Validation Rules**:
```typescript
{
  exchange: ['', Validators.required],
  environment: ['', Validators.required],
  apiKey: ['', [Validators.required, Validators.minLength(20)]],
  apiSecret: ['', [Validators.required, Validators.minLength(20)]],
  label: ['', [Validators.maxLength(50)]]
}
```

**UI Features**:
- Real-time validation feedback
- Test connection button (validates credentials before saving)
- Connection test results display
- Success/error messages
- Confirmation dialog on cancel if form dirty
- Submit disabled until form valid
- Loading states for async operations

**Visual Layout**:
```
┌────────────────────────────────────────────┐
│ Add Exchange Credentials                   │
├────────────────────────────────────────────┤
│                                             │
│ Exchange: [Bybit ▼]                        │
│                                             │
│ Environment: ○ Testnet  ● Mainnet          │
│                                             │
│ API Key: [___________________________]     │
│                                             │
│ API Secret: [*************************] 👁  │
│                                             │
│ Label (optional): [My Trading Account]     │
│                                             │
│ [Test Connection]                          │
│ ✓ Connection successful!                   │
│                                             │
│           [Cancel]  [Save Credentials]     │
└────────────────────────────────────────────┘
```

---

#### 4.2.4 ExchangeCredentialCardComponent

**Purpose**: Display single credential with status and actions

**Component Signature**:
```typescript
@Component({
  selector: 'app-exchange-credential-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-credential-card.component.html',
  styleUrl: './exchange-credential-card.component.css'
})
export class ExchangeCredentialCardComponent {
  // Inputs
  @Input({ required: true }) credential!: ExchangeCredential;
  @Input() showActions: boolean = true;

  // Outputs
  @Output() activate = new EventEmitter<ExchangeCredential>();
  @Output() edit = new EventEmitter<ExchangeCredential>();
  @Output() delete = new EventEmitter<ExchangeCredential>();

  // Methods
  onActivate(): void;
  onEdit(): void;
  onDelete(): void;
  getExchangeLogo(): string;
  getEnvironmentColor(): string;
}
```

**UI Features**:
- Exchange logo and name
- Environment badge (color-coded)
- Masked API key preview (last 4 chars)
- Active/Inactive status badge
- Last updated timestamp
- Actions menu (activate, edit, delete)
- Confirmation dialog for delete

**Visual Design**:
```
┌────────────────────────────────────┐
│ 🔷 BYBIT              [🟠 Testnet] │
│                                     │
│ API Key: ****1234                  │
│ Label: My Trading Account           │
│                                     │
│ ✓ Active                            │
│ Updated: 2 hours ago                │
│                                     │
│ [Activate] [Edit] [Delete]         │
└────────────────────────────────────┘
```

---

## 5. Routing Configuration

### 5.1 New Routes

**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  // ... existing routes ...

  // Exchange Credentials Management Routes
  {
    path: 'settings',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'exchange-credentials',
        loadComponent: () => import('./components/exchange-credentials/exchange-credentials-list/exchange-credentials-list.component')
          .then(m => m.ExchangeCredentialsListComponent),
        data: {
          title: 'Exchange Credentials',
          breadcrumb: 'Credentials'
        }
      },
      {
        path: 'exchange-credentials/add',
        loadComponent: () => import('./components/exchange-credentials/exchange-credential-form/exchange-credential-form.component')
          .then(m => m.ExchangeCredentialFormComponent),
        data: {
          title: 'Add Exchange Credentials',
          breadcrumb: 'Add',
          mode: 'create'
        }
      },
      {
        path: 'exchange-credentials/edit/:id',
        loadComponent: () => import('./components/exchange-credentials/exchange-credential-form/exchange-credential-form.component')
          .then(m => m.ExchangeCredentialFormComponent),
        data: {
          title: 'Edit Exchange Credentials',
          breadcrumb: 'Edit',
          mode: 'edit'
        }
      },
      {
        path: 'exchange-credentials/:exchange',
        loadComponent: () => import('./components/exchange-credentials/exchange-credentials-list/exchange-credentials-list.component')
          .then(m => m.ExchangeCredentialsListComponent),
        data: {
          title: 'Exchange Credentials',
          breadcrumb: 'Credentials',
          filterByExchange: true
        }
      }
    ]
  },

  // Update existing bybit-info route to be environment-aware
  {
    path: 'bybit-info',
    loadComponent: () => import('./components/bybit/bybit-user-info/bybit-user-info.component')
      .then(m => m.BybitUserInfoComponent),
    canActivate: [AuthGuard],
    data: {
      requiresCredentials: true  // NEW: Guard checks for active credentials
    }
  }
];
```

### 5.2 Route Guards

**New Guard**: `ExchangeCredentialsGuard`

```typescript
export const exchangeCredentialsGuard: CanActivateFn = (route, state) => {
  const credentialsService = inject(ExchangeCredentialsService);
  const router = inject(Router);

  const requiresCredentials = route.data['requiresCredentials'];
  if (!requiresCredentials) return true;

  const hasCredentials = credentialsService.hasCredentials();
  if (!hasCredentials) {
    router.navigate(['/settings/exchange-credentials'], {
      queryParams: { returnUrl: state.url, reason: 'no_credentials' }
    });
    return false;
  }

  return true;
};
```

### 5.3 Navigation Flow

```
User Journey:
1. Dashboard → Settings → Exchange Credentials
2. Exchange Credentials List → Add New → Form → Save → Back to List
3. Exchange Credentials List → Edit → Form → Update → Back to List
4. Exchange Credentials List → Delete → Confirm → Refresh List
5. Any Page with Environment Switcher → Toggle → Reload Data
```

---

## 6. Data Flow Architecture

### 6.1 State Flow Diagram

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Component Calls      │
│ Service Method       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐         ┌─────────────────┐
│ Service Updates      │────────▶│ HTTP Request    │
│ Loading Signal       │         │ (with JWT token)│
└──────┬───────────────┘         └────────┬────────┘
       │                                   │
       │                                   ▼
       │                         ┌─────────────────┐
       │                         │ Backend API     │
       │                         └────────┬────────┘
       │                                   │
       │                         ┌─────────▼────────┐
       │                         │ Success/Error    │
       │                         └────────┬─────────┘
       │                                   │
       ▼                                   ▼
┌──────────────────────┐         ┌─────────────────┐
│ Service Updates      │◀────────│ HTTP Response   │
│ State Signals        │         └─────────────────┘
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Components React     │
│ (Signal Effects)     │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ UI Updates           │
└──────────────────────┘
```

### 6.2 Environment Switch Flow

```
User toggles environment (Testnet → Mainnet)
        │
        ▼
ExchangeEnvironmentService.setEnvironment(MAINNET)
        │
        ├─▶ Update signal: _currentEnvironment.set(MAINNET)
        │
        └─▶ Persist to localStorage: 'exchange_environment'
        │
        ▼
Signal change triggers effects in dependent services:
        │
        ├─▶ ExchangeCredentialsService effect runs
        │   └─▶ Fetches credentials for MAINNET
        │
        └─▶ BybitUserService effect runs
            └─▶ Clears cached data
            └─▶ Next getUserInfo() call uses MAINNET
        │
        ▼
Components observing signals automatically re-render
        │
        └─▶ UI shows MAINNET data
```

### 6.3 CRUD Operation Flow (Example: Add Credential)

```
1. User clicks "Add New" → Navigate to form
2. User fills form → FormGroup validates
3. User clicks "Test Connection"
   ├─▶ credentialsService.testConnection(data)
   ├─▶ HTTP POST /api/exchange-credentials/test
   └─▶ Display result (success/error)

4. User clicks "Save Credentials"
   ├─▶ credentialsService.createCredential(data)
   ├─▶ HTTP POST /api/exchange-credentials
   ├─▶ Service updates _credentials signal
   └─▶ Navigate back to list

5. List component observes credentials() signal
   └─▶ New credential appears in UI
```

---

## 7. Type System & Interfaces

### 7.1 Core Domain Models

**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/models/exchange-credentials.models.ts`

```typescript
/**
 * Supported exchange types
 */
export enum ExchangeType {
  BYBIT = 'BYBIT',
  BINANCE = 'BINANCE',
  OKX = 'OKX',
  COINBASE = 'COINBASE',
  KRAKEN = 'KRAKEN',
  HUOBI = 'HUOBI',
  KUCOIN = 'KUCOIN'
}

/**
 * Environment types
 */
export enum EnvironmentType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET'
}

/**
 * Exchange credential entity
 * Represents a single API credential for an exchange in a specific environment
 */
export interface ExchangeCredential {
  id: string;
  userId: string;
  exchange: ExchangeType;
  environment: EnvironmentType;
  apiKeyPreview: string;  // Masked API key (e.g., "****1234")
  label?: string;         // User-provided friendly name
  isActive: boolean;      // Whether this credential is currently active
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
}

/**
 * Request to create new exchange credential
 */
export interface CreateExchangeCredentialRequest {
  exchange: ExchangeType;
  environment: EnvironmentType;
  apiKey: string;
  apiSecret: string;
  label?: string;
}

/**
 * Request to update existing credential
 * Only label can be updated; API keys require delete + recreate
 */
export interface UpdateExchangeCredentialRequest {
  label?: string;
}

/**
 * Response for credential operations
 */
export interface ExchangeCredentialResponse {
  success: boolean;
  data: ExchangeCredential;
  message?: string;
  timestamp: string;
}

/**
 * Response for list operations
 */
export interface ExchangeCredentialsListResponse {
  success: boolean;
  data: {
    credentials: ExchangeCredential[];
    totalCount: number;
  };
  timestamp: string;
}

/**
 * Request to test credential connection
 */
export interface TestConnectionRequest {
  exchange: ExchangeType;
  environment: EnvironmentType;
  apiKey: string;
  apiSecret: string;
}

/**
 * Response for connection test
 */
export interface TestConnectionResponse {
  success: boolean;
  message: string;
  testnet: boolean;
  accountPreview?: {
    accountId?: string;
    totalEquity?: string;
    totalBalance?: string;
    currency?: string;
  };
  timestamp: string;
}

/**
 * Request to activate credential
 */
export interface ActivateCredentialRequest {
  credentialId: string;
}

/**
 * Generic error response
 */
export interface ExchangeCredentialError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### 7.2 API Endpoint Interfaces

```typescript
/**
 * API endpoint definitions for exchange credentials
 */
export interface ExchangeCredentialsEndpoints {
  list: string;              // GET    /api/exchange-credentials
  getById: string;           // GET    /api/exchange-credentials/:id
  create: string;            // POST   /api/exchange-credentials
  update: string;            // PATCH  /api/exchange-credentials/:id
  delete: string;            // DELETE /api/exchange-credentials/:id
  activate: string;          // POST   /api/exchange-credentials/:id/activate
  testConnection: string;    // POST   /api/exchange-credentials/test
}
```

### 7.3 Service Interface Contracts

```typescript
/**
 * Contract for ExchangeCredentialsService
 */
export interface IExchangeCredentialsService {
  // State Signals
  readonly credentials: Signal<ExchangeCredential[]>;
  readonly activeCredential: Signal<ExchangeCredential | null>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly hasCredentials: Signal<boolean>;

  // CRUD Operations
  fetchCredentials(): Observable<ExchangeCredential[]>;
  getCredentialById(id: string): Observable<ExchangeCredential>;
  createCredential(data: CreateExchangeCredentialRequest): Observable<ExchangeCredential>;
  updateCredential(id: string, data: UpdateExchangeCredentialRequest): Observable<ExchangeCredential>;
  deleteCredential(id: string): Observable<void>;
  activateCredential(id: string): Observable<ExchangeCredential>;

  // Utility Methods
  testConnection(data: TestConnectionRequest): Observable<TestConnectionResponse>;
  refreshCredentials(): void;
  clearError(): void;
}

/**
 * Contract for ExchangeEnvironmentService
 */
export interface IExchangeEnvironmentService {
  // State Signals
  readonly currentEnvironment: Signal<EnvironmentType>;
  readonly currentEnvironment$: Observable<EnvironmentType>;

  // Methods
  setEnvironment(env: EnvironmentType): void;
  toggleEnvironment(): void;
  isTestnet(): boolean;
  isMainnet(): boolean;
}
```

---

## 8. Integration Strategy

### 8.1 Backend API Endpoints (Expected)

The frontend expects the following REST API endpoints to be available:

```typescript
// Exchange Credentials Management
GET    /api/exchange-credentials              // List all credentials for current user
GET    /api/exchange-credentials/:id          // Get single credential by ID
POST   /api/exchange-credentials              // Create new credential
PATCH  /api/exchange-credentials/:id          // Update credential (label only)
DELETE /api/exchange-credentials/:id          // Delete credential
POST   /api/exchange-credentials/:id/activate // Set as active credential
POST   /api/exchange-credentials/test         // Test credential connection

// Bybit Operations (UPDATED - environment-aware)
GET    /api/bybit/user-info?environment=TESTNET     // Get user info
GET    /api/bybit/wallet-balance?environment=MAINNET // Get wallet balance
GET    /api/bybit/asset-info?environment=TESTNET    // Get asset info
// ... other Bybit endpoints updated similarly
```

### 8.2 Request/Response Examples

**Create Credential Request**:
```json
POST /api/exchange-credentials
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "exchange": "BYBIT",
  "environment": "TESTNET",
  "apiKey": "your-api-key-here",
  "apiSecret": "your-api-secret-here",
  "label": "My Trading Account"
}
```

**Create Credential Response** (Success):
```json
{
  "success": true,
  "data": {
    "id": "cred_abc123",
    "userId": "user_xyz789",
    "exchange": "BYBIT",
    "environment": "TESTNET",
    "apiKeyPreview": "****1234",
    "label": "My Trading Account",
    "isActive": false,
    "createdAt": "2025-10-01T12:00:00.000Z",
    "updatedAt": "2025-10-01T12:00:00.000Z"
  },
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

**Test Connection Request**:
```json
POST /api/exchange-credentials/test
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "exchange": "BYBIT",
  "environment": "TESTNET",
  "apiKey": "your-api-key-here",
  "apiSecret": "your-api-secret-here"
}
```

**Test Connection Response** (Success):
```json
{
  "success": true,
  "message": "Connection successful",
  "testnet": true,
  "accountPreview": {
    "totalEquity": "10000.50",
    "totalBalance": "10000.50",
    "currency": "USDT"
  },
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

### 8.3 App Config Updates

**File**: `/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/config/app.config.ts`

```typescript
export interface AppConfig {
  api: {
    baseUrl: string;
    endpoints: {
      auth: { /* existing */ };
      trading: { /* existing */ };
      user: { /* existing */ };
      google: { /* existing */ };
      bybit: { /* existing */ };
      exchangeCredentials: {  // NEW
        list: string;
        getById: string;
        create: string;
        update: string;
        delete: string;
        activate: string;
        testConnection: string;
      };
    };
  };
  app: { /* existing */ };
  features: { /* existing */ };
}

export const appConfig: AppConfig = {
  api: {
    baseUrl: '/api',
    endpoints: {
      // ... existing endpoints ...

      exchangeCredentials: {
        list: '/exchange-credentials',
        getById: '/exchange-credentials/:id',
        create: '/exchange-credentials',
        update: '/exchange-credentials/:id',
        delete: '/exchange-credentials/:id',
        activate: '/exchange-credentials/:id/activate',
        testConnection: '/exchange-credentials/test'
      }
    }
  },
  // ... rest of config ...
};

// NEW helper function for parameterized URLs
export function getParameterizedUrl(
  category: keyof AppConfig['api']['endpoints'],
  endpoint: string,
  params: Record<string, string>
): string {
  const categoryEndpoints = appConfig.api.endpoints[category] as Record<string, string>;
  let endpointPath = categoryEndpoints[endpoint];

  // Replace :param with actual values
  Object.entries(params).forEach(([key, value]) => {
    endpointPath = endpointPath.replace(`:${key}`, value);
  });

  return buildApiUrl(endpointPath);
}
```

### 8.4 HTTP Interceptor Updates

The existing `authInterceptor` already handles JWT token injection. No changes needed, but ensure it continues to:

1. Attach JWT token to all API requests
2. Handle 401 errors (session expiry)
3. Log errors appropriately

### 8.5 Error Handling Strategy

All services should implement consistent error handling:

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  console.error('Exchange Credentials Service Error:', error);

  let errorMessage = 'An unexpected error occurred';

  if (error.error?.error?.message) {
    errorMessage = error.error.error.message;
  } else if (error.status === 0) {
    errorMessage = 'Unable to connect to server. Please check your internet connection.';
  } else if (error.status === 401) {
    errorMessage = 'Authentication failed. Please log in again.';
  } else if (error.status === 403) {
    errorMessage = 'You do not have permission to perform this action.';
  } else if (error.status === 404) {
    errorMessage = 'The requested credential was not found.';
  } else if (error.status === 409) {
    errorMessage = 'A credential for this exchange and environment already exists.';
  } else if (error.status === 422) {
    errorMessage = 'Invalid data provided. Please check your input.';
  } else if (error.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
  }

  this._error.set(errorMessage);
  return throwError(() => new Error(errorMessage));
}
```

---

## 9. Security Considerations

### 9.1 Credential Protection

1. **Never log full API keys or secrets**
   - Always mask in UI: `****1234`
   - Never include in error messages
   - Never store in localStorage

2. **Secure transmission**
   - All API calls over HTTPS
   - JWT authentication on all requests
   - API keys/secrets only sent during create operation

3. **Backend validation**
   - Backend must validate credentials before storing
   - Backend encrypts credentials at rest
   - Backend never returns full API secrets in responses

### 9.2 Frontend Security Measures

```typescript
// Example: Masking API key
private maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 4) {
    return '****';
  }
  return '****' + apiKey.slice(-4);
}

// Example: Secure form handling
private clearSensitiveData(): void {
  this.credentialForm.patchValue({
    apiKey: '',
    apiSecret: ''
  });
}

// Never do this:
// console.log('API Key:', apiKey);  ❌
// localStorage.setItem('apiKey', apiKey);  ❌
```

### 9.3 XSS Prevention

- All user inputs sanitized by Angular's built-in protection
- Use `[textContent]` instead of `[innerHTML]` for user-provided data
- Validate all form inputs before submission

### 9.4 CSRF Protection

- JWT tokens used (not cookies), immune to CSRF
- Backend should still implement CSRF protection for cookie-based sessions if any

---

## 10. Future Extensibility

### 10.1 Adding New Exchanges

To add a new exchange (e.g., Kraken):

1. **Add to ExchangeType enum**:
```typescript
export enum ExchangeType {
  BYBIT = 'BYBIT',
  BINANCE = 'BINANCE',
  OKX = 'OKX',
  KRAKEN = 'KRAKEN'  // NEW
}
```

2. **Add exchange logo**:
   - Add logo SVG/PNG to `/assets/images/exchanges/kraken.svg`

3. **Update ExchangeCredentialCardComponent**:
```typescript
getExchangeLogo(exchange: ExchangeType): string {
  const logos = {
    BYBIT: '/assets/images/exchanges/bybit.svg',
    BINANCE: '/assets/images/exchanges/binance.svg',
    OKX: '/assets/images/exchanges/okx.svg',
    KRAKEN: '/assets/images/exchanges/kraken.svg'  // NEW
  };
  return logos[exchange] || '/assets/images/exchanges/default.svg';
}
```

4. **Backend implements Kraken API integration**
   - No frontend changes needed beyond above

### 10.2 Adding More Environments

If you need more than Testnet/Mainnet (e.g., Staging):

1. **Update EnvironmentType enum**:
```typescript
export enum EnvironmentType {
  TESTNET = 'TESTNET',
  STAGING = 'STAGING',  // NEW
  MAINNET = 'MAINNET'
}
```

2. **Update ExchangeEnvironmentSwitcherComponent**:
   - Change from toggle to dropdown/segmented control with 3 options

3. **Update color coding**:
```typescript
getEnvironmentColor(env: EnvironmentType): string {
  const colors = {
    TESTNET: '#FF9800',   // Orange
    STAGING: '#9C27B0',   // Purple (NEW)
    MAINNET: '#2196F3'    // Blue
  };
  return colors[env];
}
```

### 10.3 Advanced Features (Phase 2)

Potential enhancements for future iterations:

1. **Credential Rotation**
   - Schedule automatic API key rotation
   - Notify before expiry
   - Automated rotation workflow

2. **Multi-Account Support**
   - Multiple credentials per exchange/environment
   - Quick switching between accounts
   - Account nicknames and categorization

3. **Permission Scopes**
   - Display API key permissions
   - Warn about insufficient permissions
   - Permission templates

4. **Credential Health Monitoring**
   - Periodic connection testing
   - Alert on failures
   - Last successful connection timestamp
   - Rate limit tracking

5. **Audit Log**
   - Track all credential operations
   - Display modification history
   - Security event logging

6. **Import/Export**
   - Bulk import credentials from CSV
   - Export for backup (encrypted)
   - Migration tools

7. **Advanced Security**
   - 2FA for credential operations
   - IP whitelisting management
   - Session-based credential unlocking

---

## 11. Implementation Checklist

### Phase 1: Core Infrastructure (Priority 1)

- [ ] Create type definitions (`exchange-credentials.models.ts`)
- [ ] Update `app.config.ts` with new endpoints
- [ ] Create `ExchangeEnvironmentService`
- [ ] Create `ExchangeCredentialsService`
- [ ] Update `BybitUserService` to use environment service
- [ ] Add new routes to `app.routes.ts`

### Phase 2: Core Components (Priority 1)

- [ ] Create `ExchangeEnvironmentSwitcherComponent`
- [ ] Create `ExchangeCredentialsListComponent`
- [ ] Create `ExchangeCredentialFormComponent`
- [ ] Create `ExchangeCredentialCardComponent`

### Phase 3: Integration (Priority 2)

- [ ] Integrate environment switcher into app header
- [ ] Add credentials link to settings/profile menu
- [ ] Update dashboard to show environment context
- [ ] Add credential status indicators where relevant

### Phase 4: Testing & Polish (Priority 2)

- [ ] Unit tests for services
- [ ] Component tests
- [ ] E2E tests for credential management flow
- [ ] Error handling edge cases
- [ ] Loading states and skeletons
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile/tablet)

### Phase 5: Documentation (Priority 3)

- [ ] User documentation
- [ ] API documentation
- [ ] Developer onboarding guide
- [ ] Architecture decision records (ADRs)

---

## 12. Testing Strategy

### 12.1 Unit Tests

**ExchangeEnvironmentService**:
```typescript
describe('ExchangeEnvironmentService', () => {
  it('should initialize with stored environment from localStorage');
  it('should default to TESTNET if no stored environment');
  it('should update signal when setEnvironment called');
  it('should toggle between TESTNET and MAINNET');
  it('should persist environment to localStorage');
  it('should emit observable values when environment changes');
});
```

**ExchangeCredentialsService**:
```typescript
describe('ExchangeCredentialsService', () => {
  it('should fetch credentials from API');
  it('should update credentials signal on successful fetch');
  it('should handle fetch errors gracefully');
  it('should create new credential via API');
  it('should update active credential when activated');
  it('should delete credential and update state');
  it('should test connection and return result');
  it('should refetch credentials when environment changes');
  it('should group credentials by exchange correctly');
});
```

**Components**:
```typescript
describe('ExchangeCredentialFormComponent', () => {
  it('should initialize form with empty values in create mode');
  it('should load credential data in edit mode');
  it('should validate required fields');
  it('should test connection before saving');
  it('should submit form and navigate on success');
  it('should display validation errors');
  it('should confirm before canceling dirty form');
});
```

### 12.2 Integration Tests

```typescript
describe('Credential Management Flow', () => {
  it('should complete full create credential flow');
  it('should switch environment and see updated credentials');
  it('should activate credential and see it reflected in dashboard');
  it('should edit credential label');
  it('should delete credential with confirmation');
});
```

### 12.3 E2E Tests (Cypress/Playwright)

```typescript
describe('Exchange Credentials E2E', () => {
  it('navigates to credentials page from dashboard');
  it('adds new Bybit testnet credential');
  it('tests credential connection');
  it('switches environment and credentials update');
  it('activates credential');
  it('edits credential label');
  it('deletes credential');
});
```

---

## 13. Performance Considerations

### 13.1 Optimization Strategies

1. **Lazy Loading**
   - All credential components lazy loaded
   - Only load when user navigates to settings

2. **Signal-based Change Detection**
   - Components using `OnPush` change detection
   - Signals trigger minimal re-renders

3. **API Call Optimization**
   - Cache credentials in service
   - Only refetch on environment change or explicit refresh
   - Debounce search/filter operations

4. **Bundle Size**
   - Standalone components for better tree-shaking
   - No heavy dependencies
   - Lazy load Material UI components if used

### 13.2 Caching Strategy

```typescript
export class ExchangeCredentialsService {
  private cache = new Map<string, ExchangeCredential[]>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  private getCachedCredentials(env: EnvironmentType): ExchangeCredential[] | null {
    const cached = this.cache.get(env);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }
}
```

---

## 14. Accessibility (a11y)

### 14.1 Requirements

1. **Keyboard Navigation**
   - All interactive elements accessible via keyboard
   - Logical tab order
   - Escape key closes dialogs

2. **Screen Reader Support**
   - ARIA labels on all form fields
   - ARIA live regions for loading/error states
   - Descriptive button text

3. **Visual Accessibility**
   - Sufficient color contrast (WCAG AA)
   - Focus indicators visible
   - Not relying solely on color for information

### 14.2 ARIA Implementation

```html
<!-- Example: Environment Switcher -->
<div role="radiogroup" aria-labelledby="env-label">
  <span id="env-label">Environment</span>
  <button
    role="radio"
    [attr.aria-checked]="isTestnet()"
    (click)="setEnvironment(EnvironmentType.TESTNET)">
    Testnet
  </button>
  <button
    role="radio"
    [attr.aria-checked]="!isTestnet()"
    (click)="setEnvironment(EnvironmentType.MAINNET)">
    Mainnet
  </button>
</div>

<!-- Example: Loading State -->
<div
  *ngIf="loading()"
  role="status"
  aria-live="polite">
  Loading credentials...
</div>
```

---

## 15. Migration Path

### 15.1 Migrating from Existing Implementation

If users currently have Bybit credentials stored via the old system:

1. **Backend Migration Script**
   - Migrate existing `BybitApiKey` records to `ExchangeCredential` format
   - Set `exchange = BYBIT`
   - Infer `environment` from `testnet` field
   - Set `isActive = true` for existing credentials

2. **Frontend Compatibility**
   - `BybitUserService` continues to work during migration
   - New credential system runs in parallel
   - Gradual migration: users can continue using old system while new system is being adopted

3. **Deprecation Timeline**
   - Phase 1 (v1.0): New system available, old system still works
   - Phase 2 (v1.1): UI prompts to migrate to new system
   - Phase 3 (v2.0): Old system removed, only new system supported

---

## 16. Monitoring & Observability

### 16.1 Metrics to Track

1. **User Engagement**
   - Number of credentials created/deleted
   - Environment switch frequency
   - Active exchange distribution

2. **Performance Metrics**
   - API response times
   - Component load times
   - Error rates

3. **Business Metrics**
   - Adoption rate of new credential system
   - Multi-exchange usage patterns
   - Environment preference distribution

### 16.2 Error Tracking

Integrate with error monitoring service (Sentry, Rollbar, etc.):

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  // Log to monitoring service
  errorTrackingService.logError({
    error,
    context: {
      service: 'ExchangeCredentialsService',
      environment: this.environmentService.currentEnvironment(),
      userId: this.authService.getUserId()
    }
  });

  // ... rest of error handling
}
```

---

## 17. Summary

This architecture provides a robust, scalable foundation for managing multiple cryptocurrency exchange credentials with environment switching. Key highlights:

**Strengths**:
- Clean separation of concerns
- Reactive state management with signals
- Type-safe implementation
- Extensible for multiple exchanges
- Security-conscious design
- Performance-optimized
- Testable architecture

**Next Steps**:
1. Review and approve architecture
2. Backend team implements API endpoints
3. Frontend team implements services (Phase 1)
4. Frontend team implements components (Phase 2)
5. Integration and testing (Phase 3)
6. User acceptance testing
7. Production deployment

**Estimated Effort**:
- Services: 2-3 days
- Components: 4-5 days
- Integration: 2 days
- Testing: 2-3 days
- **Total**: 10-13 days (2 weeks sprint)

---

## Appendix A: File Structure

```
/Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/

NEW FILES:
├── models/
│   └── exchange-credentials.models.ts
├── services/
│   ├── exchange-environment.service.ts
│   └── exchange-credentials.service.ts
├── components/
│   └── exchange-credentials/
│       ├── exchange-environment-switcher/
│       │   ├── exchange-environment-switcher.component.ts
│       │   ├── exchange-environment-switcher.component.html
│       │   └── exchange-environment-switcher.component.css
│       ├── exchange-credentials-list/
│       │   ├── exchange-credentials-list.component.ts
│       │   ├── exchange-credentials-list.component.html
│       │   └── exchange-credentials-list.component.css
│       ├── exchange-credential-form/
│       │   ├── exchange-credential-form.component.ts
│       │   ├── exchange-credential-form.component.html
│       │   └── exchange-credential-form.component.css
│       └── exchange-credential-card/
│           ├── exchange-credential-card.component.ts
│           ├── exchange-credential-card.component.html
│           └── exchange-credential-card.component.css

UPDATED FILES:
├── config/
│   └── app.config.ts (ADD exchangeCredentials endpoints)
├── services/
│   └── bybit-user.service.ts (ADD environment integration)
└── app.routes.ts (ADD credential management routes)
```

---

## Appendix B: References

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Author**: Angular Architecture Team
**Status**: Ready for Implementation
