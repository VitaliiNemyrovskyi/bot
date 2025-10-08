# BingX Signature Fix - Implementation Guide

## Summary of Research Findings

After extensive research, I found **CONFLICTING** information about whether BingX uses HEX or BASE64 encoding:

- **Stack Overflow (2023):** Shows `.digest("base64")` working
- **Python examples:** Show `.hexdigest()` or `.digest().hex()`
- **Current implementation:** Uses `.digest('hex')`

## What I Found

### Issues in Current Implementation:

1. **Signature Encoding** - Using HEX, but conflicting sources suggest BASE64
2. **URL Encoding Logic** - Assumes hex (doesn't URL-encode signature), won't work with base64
3. **RecvWindow Handling** - Currently CORRECT (not in signature, but in query string)
4. **Parameter Sorting** - Currently CORRECT (alphabetical sorting)

## The Fix I Recommend

### Option 1: Try BASE64 First (Based on Stack Overflow)

**Change in `/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/bingx.ts` line 203-206:**

```typescript
// CURRENT (HEX):
const signature = crypto
  .createHmac('sha256', this.apiSecret)
  .update(queryString)
  .digest('hex');

// CHANGE TO (BASE64):
const signature = crypto
  .createHmac('sha256', this.apiSecret)
  .update(queryString)
  .digest('base64');
```

**Also change lines 258-266 (URL encoding):**

```typescript
// CURRENT (doesn't encode signature):
const queryString = Object.entries(requestParams)
  .map(([key, value]) => {
    // Don't URL encode the signature since it's hex (only 0-9, a-f)
    if (key === 'signature') {
      return `${key}=${value}`;
    }
    return `${key}=${encodeURIComponent(String(value))}`;
  })
  .join('&');

// CHANGE TO (encode everything):
const queryString = Object.entries(requestParams)
  .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
  .join('&');
```

### Option 2: If BASE64 Doesn't Work, Keep HEX

If BASE64 doesn't work, the issue might be something else:
- API key format
- Secret key format
- RecvWindow inclusion in signature
- Parameter naming (e.g., "signature" vs "sign")

---

## Complete Fixed Code

Here's the complete fixed `generateSignature()` method with BASE64:

```typescript
/**
 * Generate signature for BingX API requests
 * BingX uses HMAC SHA256 signature with BASE64 encoding
 *
 * IMPORTANT:
 * - Parameters must NOT be URL-encoded when generating signature
 * - The signature must be base64 encoded
 * - The signature is calculated on the raw query string before encoding
 */
private generateSignature(params: Record<string, any>): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  // Create query string WITHOUT URL encoding (required for signature calculation)
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  console.log('[BingXService] Signature calculation details:');
  console.log('  Query string:', queryString);
  console.log('  API Secret (first 8 chars):', this.apiSecret.substring(0, 8) + '...');

  // Generate HMAC SHA256 signature using BASE64 encoding
  const signature = crypto
    .createHmac('sha256', this.apiSecret)
    .update(queryString)
    .digest('base64'); // ← CHANGED FROM 'hex' TO 'base64'

  console.log('  Generated signature (base64):', signature);
  console.log('  Signature length:', signature.length);

  return signature;
}
```

And the fixed query string building:

```typescript
// Build URL - URL encode ALL parameter values including signature
const queryString = Object.entries(requestParams)
  .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
  .join('&');

const url = `${this.baseUrl}${endpoint}?${queryString}`;
```

---

## Testing Procedure

1. **Make the changes above**
2. **Run your application** (the one that was getting error 100001)
3. **Check the logs:**
   - Look for `[BingXService] Signature calculation details:`
   - Compare the signature format
4. **Check the API response:**
   - If you get error 100001 again → try HEX
   - If you get a different error → might be progress!
   - If it works → SUCCESS!

---

## Alternative: Test Script

If you can provide API credentials, run:
```bash
npx tsx test-bingx-signature.ts YOUR_API_KEY YOUR_API_SECRET
```

This will test BOTH hex and base64 and tell you which one works.

---

## What to Report Back

After testing, please report:

1. **Which encoding worked** (hex or base64)?
2. **Error code and message** if neither worked
3. **The exact query string** from logs (with timestamp redacted)
4. **The generated signature** from logs

This will help me determine if there are other issues beyond the encoding.

---

## Additional Checks

If neither encoding works, check these:

### 1. API Key Format
- Is your API key the correct one for Perpetual Futures?
- BingX has different keys for Spot vs Futures

### 2. Secret Key Format
- Is the secret correctly stored?
- No extra spaces or newlines?

### 3. Timestamp
- Check if timestamp sync is working
- Current code uses `this.getSyncedTime()`

### 4. RecvWindow
- Current: NOT in signature, but in query string
- Try including it in signature if BASE64 fails

### 5. Parameter Names
- Current: using "signature"
- Some exchanges use "sign" instead

---

## My Recommendation

Based on the Stack Overflow evidence (which showed a working solution), I recommend trying **BASE64 first**. The Stack Overflow answer from 2023 explicitly shows:

```javascript
const crypto = require("crypto");

function sign(message, secretKey){
    return crypto.createHmac('sha256', secretKey).update(message).digest("base64");
}
```

This suggests BASE64 is correct for BingX.

---

**Author:** Claude Code
**Date:** 2025-10-08
**Files:**
- `/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/bingx.ts` (line 203-206, 258-266)
- `/Users/vnemyrovskyi/IdeaProjects/bot/backend/test-bingx-signature.ts` (test script)
- `/Users/vnemyrovskyi/IdeaProjects/bot/backend/BINGX_SIGNATURE_ANALYSIS.md` (full analysis)
