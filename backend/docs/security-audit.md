# Security Audit Report

**Date**: 2026-04-10
**Scope**: Full application security audit of the crypto trading platform
**Auditor**: Security Engineer (automated)
**Version**: 1.0

---

## Executive Summary

This audit identified **4 CRITICAL**, **6 HIGH**, **5 MEDIUM**, and **4 LOW** severity issues across the codebase. The most urgent findings involve **production secrets committed to the Git repository**, a **hardcoded JWT fallback secret** that bypasses authentication entirely, **unauthenticated admin and debug endpoints** that allow arbitrary operations, and a **deprecated encryption function** that could compromise API keys.

The platform handles real money via 13 exchange connectors. The findings below are ordered by risk of capital loss or credential exposure.

---

## CRITICAL Findings

### C1. Production Secrets Committed to Git Repository

**Severity**: CRITICAL
**File**: `/.env` (root of repository)
**Impact**: Full compromise of all exchange accounts, user data, and billing system

The root `.env` file contains live production secrets and is tracked in Git:

- `ENCRYPTION_KEY=892bf25f979460bf917c710d3f197f082edc76d25a5b3124a4bfc9669ef32639` (AES-256 master key for all exchange API keys)
- `BYBIT_API_KEY='MPfWgNT9mCtC9VyPQS'`
- `BYBIT_API_SECRET='0IQTvUWCbnVT3jERFLIO3JsNx80KzgdCvz8k'`
- `MEXC_API_KEY='mx0vglOmmUJBmCbI0V'`
- `MEXC_API_SECRET='f6eb32705d104bc9b8d0d22ab946611b'`
- `NOWPAYMENTS_API_KEY` and `NOWPAYMENTS_IPN_SECRET` (both sandbox and production commented but visible)
- `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production` (the default placeholder value)

**Why this is critical**: Anyone with read access to this repository can:
1. Decrypt every stored exchange API key using the ENCRYPTION_KEY
2. Trade directly on Bybit and MEXC using the exposed API keys
3. Forge JWT tokens for any user (the JWT_SECRET is a known placeholder)
4. Manipulate billing webhooks using the IPN secret

**Remediation**:
1. **IMMEDIATELY** rotate ALL secrets listed above: ENCRYPTION_KEY, all exchange API keys/secrets, JWT_SECRET, NOWPAYMENTS secrets
2. Re-encrypt all stored exchange credentials with the new ENCRYPTION_KEY
3. Remove `.env` from Git history using `git filter-repo` or BFG Repo-Cleaner
4. Verify `.env` is in `.gitignore` (it is listed, but the file was still committed)
5. Consider using a secrets manager (HashiCorp Vault, AWS Secrets Manager) instead of `.env` files

---

### C2. Hardcoded JWT Fallback Secret Enables Authentication Bypass

**Severity**: CRITICAL
**File**: `/backend/src/lib/auth.ts`, line 25
**Impact**: Complete authentication bypass for all users

```typescript
private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
```

If `JWT_SECRET` is not set in the environment (or is empty), the application silently falls back to the string `'fallback-secret'`. Any attacker who knows this (it is in the source code) can forge valid JWT tokens for any user, including ADMIN.

Combined with finding C1 (the `.env` file has `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`), the actual production secret may be this weak placeholder value.

**Remediation**:
The application MUST refuse to start if `JWT_SECRET` is not set. Remove the fallback:

```typescript
private static getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }
  return secret;
}
```

---

### C3. Unauthenticated Admin and Debug Endpoints

**Severity**: CRITICAL
**Files**:
- `/backend/src/app/api/admin/sync-symbols/route.ts` (lines 10, 34) - no auth check
- `/backend/src/app/api/admin/update-funding-intervals/route.ts` (lines 14, 60) - no auth check, comment on line 13 says "NO AUTH REQUIRED (but should add in production)"
- `/backend/src/app/api/debug/test-tpsl/route.ts` (line 8) - no auth, accepts arbitrary positionId and userId
- `/backend/src/app/api/debug/test-gateio-tpsl/route.ts` (line 10) - no auth, accesses exchange credentials directly

**Impact**: Any unauthenticated user can:
- Trigger mass symbol syncing (DoS potential)
- Manipulate funding interval data
- Execute TP/SL operations on arbitrary positions via debug endpoints
- Access exchange credentials for any user through the debug/test-gateio-tpsl endpoint (which calls `ExchangeCredentialsService.getCredentialById` with position data from the DB, bypassing user ownership checks)

**Remediation**:
1. Delete the debug endpoints entirely from production builds
2. Add `requireRole(['ADMIN'])` guard to all admin endpoints
3. Add a build-time or startup check that prevents debug routes from loading in production

---

### C4. Deprecated Encryption in Legacy API Keys Route

**Severity**: CRITICAL
**File**: `/backend/src/app/api/trading/api-keys/route.ts`, lines 58-68
**Impact**: Broken encryption, potential credential exposure

```typescript
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production';

function encryptApiKey(text: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  // const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  ...
  return iv.toString('hex') + ':' + encrypted;
}
```

Multiple issues:
1. `crypto.createCipher()` is deprecated since Node.js 10 and uses a weak key derivation (MD5-based EVP_BytesToKey)
2. The IV generation is commented out (`// const iv = crypto.randomBytes(16)`) but `iv` is referenced on line 67 -- this code would throw a `ReferenceError` at runtime
3. Uses a hardcoded fallback key `'default-key-change-in-production'`
4. Uses a static salt `'salt'` for scrypt
5. Uses CBC mode without authentication (vulnerable to padding oracle attacks)

The production `ExchangeCredentialsService` uses the proper `EncryptionService` (AES-256-GCM). This legacy route appears to be dead code but is still deployed and reachable.

**Remediation**: Remove this entire file or replace with the proper `EncryptionService`. The mock data stores in this file suggest it was prototype code that should never have reached production.

---

## HIGH Findings

### H1. Password Hashes Returned in User Objects

**Severity**: HIGH
**File**: `/backend/src/lib/auth.ts`, lines 68, 89, 110, 139
**Impact**: Password hash leakage through any endpoint that serializes User objects

Every method that returns a `User` object includes the password hash:

```typescript
return {
  id: user.id,
  email: user.email,
  password: user.password || undefined,  // <-- bcrypt hash returned
  role: user.role,
  ...
};
```

While the login/register routes explicitly select which fields to return, any service that calls `findUserById()`, `findUserByEmail()`, or `updateUser()` and passes the result without filtering will leak the password hash.

**Remediation**: Never include `password` in the returned User type. Create a separate `UserWithPassword` type only for internal authentication use:

```typescript
// Public user type - never includes password
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  // ... other non-sensitive fields
}

// Internal auth type - only used in comparePasswords
interface UserWithCredentials extends User {
  password?: string;
}
```

---

### H2. Google OAuth Route Uses In-Memory Mock Store Instead of Database

**Severity**: HIGH
**File**: `/backend/src/app/api/auth/google/route.ts`, lines 6-16, 50-70
**Impact**: User impersonation, data loss on restart, inconsistent state

The Google OAuth handler uses an in-memory `mockUsers` Map instead of the database:

```typescript
const mockUsers = new Map<string, { ... }>();
```

This means:
1. All Google-authenticated users are lost on every server restart
2. Google auth creates users that do not exist in the database, but JWTs reference a `userId` that may collide with or not exist in the real user table
3. The `generateMockId()` function uses `Math.random()` which is not cryptographically secure for user IDs

**Remediation**: Replace the mock store with actual database calls using `AuthService.findUserByEmail()` and `AuthService.createUser()`, matching the pattern used in the login/register routes.

---

### H3. API Key Secrets Logged to Console in Test/Script Files

**Severity**: HIGH
**Files**:
- `/backend/src/test-precise-timing-strategy.ts`, lines 30-31
- `/backend/src/scripts/test-bybit-funding-history.ts`, line 23
- `/backend/src/scripts/check-all-bingx-creds.ts`, lines 24-25
- `/backend/src/scripts/check-bingx-credentials.ts`, line 36

**Impact**: Exchange API keys and secrets visible in container logs

```typescript
console.log('  API Key:', BYBIT_API_KEY.substring(0, 8) + '...');
console.log('  API Secret:', BYBIT_API_SECRET.substring(0, 8) + '...');
```

Even partial key logging can aid brute-force attacks. In the `check-all-bingx-creds.ts` script, 15 characters of both the API key and secret are logged.

**Remediation**: Remove all credential logging. If debugging is needed, log only a 4-character suffix:
```typescript
console.log('  API Key: ...', apiKey.slice(-4));
```

---

### H4. No Rate Limiting on Authentication Endpoints

**Severity**: HIGH
**Files**:
- `/backend/src/app/api/auth/login/route.ts`
- `/backend/src/app/api/auth/register/route.ts`
- `/backend/src/app/api/auth/google/route.ts`

**Impact**: Credential stuffing, brute-force password attacks, account enumeration

There is no rate limiting on any API endpoint. The login endpoint returns different error messages for "user not found" vs "wrong password" (both return "Invalid credentials", which is correct), but without rate limiting an attacker can attempt unlimited password guesses.

The register endpoint also lacks rate limiting, enabling mass account creation.

**Remediation**: Add rate limiting middleware. Example using a simple in-memory rate limiter:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxAttempts: number, windowMs: number) {
  return (request: NextRequest): NextResponse | null => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const record = attempts.get(ip);

    if (!record || record.resetAt < now) {
      attempts.set(ip, { count: 1, resetAt: now + windowMs });
      return null;
    }

    if (record.count >= maxAttempts) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)) } }
      );
    }

    record.count++;
    return null;
  };
}
```

For production, use Redis-backed rate limiting.

---

### H5. Fixed Salt in Encryption Key Derivation

**Severity**: HIGH
**File**: `/backend/src/lib/encryption.ts`, line 39
**Impact**: Reduced cryptographic strength, identical keys across all installations

```typescript
const salt = 'bybit-api-key-encryption-salt';
```

The scrypt salt is hardcoded and identical for every installation. This means:
1. Two installations with the same `ENCRYPTION_KEY` environment variable will derive identical AES keys
2. An attacker who obtains the ciphertext and knows the code can precompute rainbow tables against common ENCRYPTION_KEY values

**Remediation**: Generate a random salt per installation and store it alongside the encrypted data, or use a per-record random salt:

```typescript
private static deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, this.KEY_LENGTH);
}

static encrypt(plaintext: string): string {
  const salt = randomBytes(this.SALT_LENGTH);
  const key = this.deriveKey(this.getSecret(), salt);
  const iv = randomBytes(this.IV_LENGTH);
  // ...
  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}
```

---

### H6. CORS Wildcard on SSE/Streaming Endpoints

**Severity**: HIGH
**Files**:
- `/backend/src/app/api/trading/stream/route.ts`, line 113
- `/backend/src/app/api/arbitrage/prices/stream/route.ts`, line 299
- `/backend/src/app/api/arbitrage/funding-rates/stream/route.ts`, line 325

**Impact**: Cross-origin data exfiltration, CSRF-like attacks on streaming endpoints

```typescript
'Access-Control-Allow-Origin': '*',
```

Multiple SSE (Server-Sent Events) endpoints set `Access-Control-Allow-Origin: *`, allowing any website to open a connection and read real-time trading data. If the SSE endpoint relies on cookie-based auth, this is a direct data exfiltration vector.

The main CORS middleware is disabled (`middleware.ts.disabled`), leaving CORS handling inconsistent across endpoints.

**Remediation**: Replace `*` with the actual frontend origin:

```typescript
'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:4200',
```

Enable and properly configure the CORS middleware globally.

---

## MEDIUM Findings

### M1. Docker Compose Exposes Database and Redis Ports to Host

**Severity**: MEDIUM
**File**: `/docker-compose.yml`, lines 13-14, 31-32
**Impact**: Direct access to database and cache from outside the container network

```yaml
postgres:
  ports:
    - "${POSTGRES_PORT:-5432}:5432"

redis:
  ports:
    - "${REDIS_PORT:-6379}:6379"
```

PostgreSQL and Redis are exposed to the host (and potentially the network). The default PostgreSQL password is `postgres` (line 12: `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}`).

**Remediation**: Remove the port mappings for postgres and redis. They should only be accessible within the Docker network. If local development access is needed, use a separate `docker-compose.override.yml`:

```yaml
# docker-compose.yml (production)
postgres:
  # No ports: section
  networks:
    - bot-network

# docker-compose.override.yml (development only, gitignored)
postgres:
  ports:
    - "5432:5432"
```

---

### M2. No Session Validation on JWT Token Use

**Severity**: MEDIUM
**File**: `/backend/src/lib/auth.ts`, lines 182-191, and `/backend/src/middleware/auth.ts`
**Impact**: Logged-out tokens remain valid until JWT expiry

The `getUserFromToken()` method verifies the JWT signature and checks if the user exists, but does NOT check if the session is still valid:

```typescript
static async getUserFromToken(token: string): Promise<User | null> {
  const payload = this.verifyToken(token);
  if (!payload) return null;
  const user = await this.findUserById(payload.userId);
  return user;
}
```

The `isSessionValid()` method exists but is never called in the auth middleware. After logout (which calls `invalidateSession`), the JWT remains valid for its entire TTL (7 days per config).

**Remediation**: Add session validation to `getUserFromToken`:

```typescript
static async getUserFromToken(token: string): Promise<User | null> {
  const payload = this.verifyToken(token);
  if (!payload) return null;
  const sessionValid = await this.isSessionValid(token);
  if (!sessionValid) return null;
  return this.findUserById(payload.userId);
}
```

---

### M3. Health Endpoint Leaks Internal Error Details

**Severity**: MEDIUM
**File**: `/backend/src/app/api/health/route.ts`, lines 22, 44, 56
**Impact**: Information disclosure of internal architecture

The health endpoint:
1. Exposes database error messages (`error: ${dbError.message}`)
2. Exposes Node.js version (`nodejs: process.version`)
3. Exposes memory usage details
4. Is unauthenticated (by design for health checks, but should not leak internals)

**Remediation**: Return only status codes for health checks. Move detailed diagnostics to an authenticated admin endpoint.

---

### M4. Missing Content Security Policy Header

**Severity**: MEDIUM
**File**: `/frontend/nginx.conf`, lines 33-37
**Impact**: No protection against XSS via injected scripts

The nginx config includes `X-Frame-Options`, `X-Content-Type-Options`, and `X-XSS-Protection`, but is missing:
- `Content-Security-Policy` header
- `Strict-Transport-Security` (HSTS) header
- `Permissions-Policy` header

**Remediation**: Add security headers to nginx.conf:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss:; img-src 'self' data: https:;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

### M5. No Input Validation on Register Endpoint

**Severity**: MEDIUM
**File**: `/backend/src/app/api/auth/register/route.ts`
**Impact**: Weak passwords, invalid emails, potential injection

The register endpoint only checks that email and password are non-empty. There is no validation for:
- Email format
- Password complexity (minimum length, character requirements)
- Name field sanitization

**Remediation**: Add input validation:

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
}
if (password.length < 8) {
  return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
}
```

---

## LOW Findings

### L1. UDS Socket File Permissions Not Restricted

**Severity**: LOW
**File**: `/backend/src/execution-engine/uds-transport.ts`, line 175
**Impact**: Other processes on the host could connect to the execution engine

The UDS server does not set file permissions on the socket after creation. The default umask determines who can connect. In a Docker environment this is mitigated by container isolation, but on a shared host any local process could send commands to the execution engine.

**Remediation**: Set restrictive permissions after socket creation:

```typescript
this.server.listen(this.socketPath, () => {
  fs.chmodSync(this.socketPath, 0o600); // owner read/write only
  resolve();
});
```

---

### L2. Frontend Nginx Runs as Root

**Severity**: LOW
**File**: `/frontend/Dockerfile`
**Impact**: Container escape risk if nginx is compromised

The frontend Dockerfile uses `nginx:alpine` base image and does not switch to a non-root user. The backend Dockerfile correctly creates and uses a `nextjs` user (line 28-29).

**Remediation**: Use nginx unprivileged image or add user switching:

```dockerfile
FROM nginxinc/nginx-unprivileged:alpine AS runner
```

---

### L3. Prisma `--accept-data-loss` Flag in Production

**Severity**: LOW
**File**: `/docker-compose.yml`, lines 91, 124
**Impact**: Schema migrations could silently drop data

```yaml
command: sh -c "npx prisma db push --accept-data-loss --skip-generate && node server.js"
```

The `--accept-data-loss` flag allows Prisma to perform destructive schema changes (dropping columns, tables) without confirmation. In production, this could cause irreversible data loss during deployments.

**Remediation**: Use `prisma migrate deploy` for production instead of `db push`:

```yaml
command: sh -c "npx prisma migrate deploy && node server.js"
```

---

### L4. Engine Recovery Does Not Actually Verify Exchange State

**Severity**: LOW (currently, but HIGH when positions go live)
**File**: `/backend/src/execution-engine/engine-process.ts`, lines 388-405
**Impact**: On crash recovery, positions may not be reconciled correctly

The recovery procedure creates mock `ExchangePositionVerification` objects with `exchangeReachable: false` and static data. The comment says "Exchange verification not yet implemented in recovery". This means crash recovery will ALWAYS escalate to operator intervention rather than automatically closing orphaned positions.

**Remediation**: Implement actual exchange position verification before enabling production trading through the execution engine.

---

## INFO Findings

### I1. Encryption Service Validates on Module Load in Development Only

**File**: `/backend/src/lib/encryption.ts`, lines 141-146

The encryption validation only runs in development mode. Consider adding a startup check in production to catch misconfiguration early.

### I2. IPC Protocol Uses Zod Validation

**File**: `/backend/src/execution-engine/ipc-protocol.ts`

Positive finding: The IPC protocol properly validates all message envelopes with Zod schemas (`MessageEnvelopeSchema`), which prevents malformed messages from being processed by the execution engine.

### I3. WAL Implementation Design is Sound

**Files**: `/backend/src/execution-engine/position-state-machine.ts`, `/backend/src/execution-engine/wal-repository.ts`

Positive finding: The write-ahead log design with explicit state transitions, recovery decision matrix, and capital-at-risk tracking is well-architected. The state machine correctly prevents invalid transitions.

### I4. Billing Webhook Has Proper HMAC Verification

**File**: `/backend/src/app/api/billing/webhook/route.ts`

Positive finding: The NOWPayments webhook properly verifies HMAC signatures and handles idempotency via `paymentId` deduplication.

---

## Prioritized Remediation Checklist

| Priority | Finding | Action | Effort |
|----------|---------|--------|--------|
| P0 - NOW | C1 | Rotate ALL secrets, remove `.env` from Git history | 2h |
| P0 - NOW | C2 | Remove JWT fallback secret, fail on missing env var | 15min |
| P0 - NOW | C3 | Add auth to admin routes, delete debug endpoints | 1h |
| P0 - NOW | C4 | Remove legacy `/api/trading/api-keys` route | 15min |
| P1 - This week | H1 | Remove password from User return type | 30min |
| P1 - This week | H2 | Replace Google OAuth mock store with database | 2h |
| P1 - This week | H3 | Remove credential logging from scripts | 30min |
| P1 - This week | H4 | Add rate limiting to auth endpoints | 2h |
| P1 - This week | H5 | Use random per-record salt in encryption | 4h (+ re-encryption migration) |
| P1 - This week | H6 | Fix CORS wildcards on SSE endpoints | 30min |
| P2 - This sprint | M1 | Remove external port mappings for DB/Redis | 15min |
| P2 - This sprint | M2 | Add session validation to token verification | 30min |
| P2 - This sprint | M3 | Sanitize health endpoint responses | 30min |
| P2 - This sprint | M4 | Add CSP and HSTS headers | 1h |
| P2 - This sprint | M5 | Add input validation to register endpoint | 30min |
| P3 - Next sprint | L1-L4 | Socket permissions, nginx user, prisma migrate, recovery impl | 4h |

---

## Summary

The platform has a well-designed execution engine architecture with proper state machines and WAL-based recovery. However, the application layer has several critical security gaps that must be addressed before handling real money in production:

1. **Secrets management is the top priority** -- production credentials are in the Git history
2. **Authentication hardening** -- the JWT fallback and missing session validation must be fixed
3. **Access control** -- admin and debug endpoints are fully open
4. **Rate limiting** -- no brute-force protection exists on any endpoint

Until C1-C4 are resolved, the platform should NOT be exposed to the public internet with real exchange credentials.
