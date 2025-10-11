# MEXC Browser Session Token Setup

## Overview

MEXC does not officially support futures trading through their standard API. As a workaround, this application supports using a browser session token to authenticate with MEXC futures endpoints.

**⚠️ Important Notes:**
- This method uses reverse-engineered endpoints
- It may violate MEXC Terms of Service
- The token expires and must be refreshed periodically
- Use at your own risk

## How to Obtain Browser Session Token

### Step 1: Log into MEXC Futures

1. Open your web browser (Chrome, Firefox, or Edge)
2. Navigate to [https://futures.mexc.com/](https://futures.mexc.com/)
3. Log in to your MEXC account

### Step 2: Open Developer Tools

**Chrome/Edge:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Firefox:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

### Step 3: Navigate to Network Tab

1. Click on the **Network** tab in Developer Tools
2. Make sure **Preserve log** is enabled (checkbox at the top)
3. Clear existing requests by clicking the 🚫 icon (if needed)

### Step 4: Trigger an API Request

1. Navigate to any futures trading pair (e.g., BTC_USDT)
2. Perform any action (open a position, check balance, etc.)
3. Look for API requests to `contract.mexc.com` in the Network tab

### Step 5: Find the Authorization Header

1. Click on any request to `contract.mexc.com`
2. Go to the **Headers** tab
3. Scroll down to **Request Headers**
4. Find the `authorization` header
5. Copy the entire value (it should start with `WEB...`)

**Example:**
```
authorization: WEBeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 6: Add Token to Application

1. Go to your Profile → Trading Platforms
2. Click "Add New Credential"
3. Select **MEXC** as the exchange
4. Enter your API Key and Secret (can be dummy values like `placeholder`)
5. Paste the entire authorization header value into the **Browser Session Token** field
6. Click "Test Connection" to verify
7. Click "Save Credential"

## Token Expiration

Browser session tokens typically expire after:
- **24 hours** of inactivity
- **7 days** maximum (regardless of activity)
- When you log out from the browser

When the token expires, you'll see authentication errors. Simply repeat the steps above to obtain a new token.

## Security Considerations

1. **Never share your browser session token** - it has full access to your account
2. **Revoke tokens** when no longer needed by logging out
3. **Use IP whitelisting** if supported by MEXC
4. **Monitor your account** regularly for unauthorized activity
5. **Consider using a separate account** for bot trading

## Troubleshooting

### Token Not Working

- **Check token format**: Must start with `WEB` or similar prefix
- **Check for extra spaces**: Remove any leading/trailing whitespace
- **Verify token is fresh**: Tokens may expire quickly
- **Check MEXC status**: MEXC may have changed their API

### Connection Errors

- **Error 401/403**: Token expired or invalid - obtain a new token
- **Error 1002**: Contract not activated - activate the trading pair manually on MEXC
- **Error 600**: Leverage settings issue - adjust leverage on MEXC website first

## Alternative: Standard API (Not Supported)

MEXC's standard API **does not support** futures trading operations. The API documentation shows futures endpoints, but they return error code 1002 (Contract not activated) even with all permissions enabled. This is why the browser session token method is necessary.

## Support

If you encounter issues:
1. Verify the token is copied correctly
2. Check MEXC's website for any service updates
3. Try obtaining a fresh token
4. Check the application logs for detailed error messages

## Legal Disclaimer

Using browser session tokens to access API endpoints may violate MEXC's Terms of Service. This method is provided for educational purposes only. Users assume all responsibility and risk for their usage.
