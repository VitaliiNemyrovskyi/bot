# Time Synchronization Implementation

## Overview

This document describes the time synchronization implementation for BingX and Bybit exchanges. Accurate time synchronization is critical for funding arbitrage operations because:

1. **API Request Authentication**: Exchange APIs reject requests with timestamps outside acceptable ranges (typically ±5 seconds)
2. **Funding Rate Timing**: Funding fee collection happens at precise intervals (every 8 hours). Orders must be placed with accurate timestamps
3. **Order Execution**: Market orders need precise timing to capture funding rates at the exact settlement time

## Architecture

### Components

1. **BingXService** (`/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/bingx.ts`)
   - Time synchronization methods
   - Automatic offset calculation
   - Periodic re-sync

2. **BybitService** (`/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/lib/bybit.ts`)
   - Time synchronization methods
   - Automatic offset calculation
   - Periodic re-sync

3. **BingXConnector** (`/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/connectors/bingx.connector.ts`)
   - Initializes time sync on startup
   - Starts periodic sync

4. **BybitConnector** (`/Users/vnemyrovskyi/IdeaProjects/bot/backend/src/connectors/bybit.connector.ts`)
   - Initializes time sync on startup
   - Starts periodic sync

## Implementation Details

### Time Offset Calculation

The time offset is calculated using the following algorithm:

```typescript
const startTime = Date.now();
const serverTime = await getServerTime();
const endTime = Date.now();

// Calculate network latency and adjust
const latency = (endTime - startTime) / 2;
const adjustedServerTime = serverTime + latency;

// Calculate offset
const timeOffset = adjustedServerTime - endTime;
```

This accounts for network latency by:
1. Recording the time before the request
2. Fetching server time
3. Recording the time after the response
4. Estimating latency as half the round-trip time
5. Adjusting server time by adding half the latency
6. Calculating the offset between adjusted server time and local time

### Synced Time Usage

All API requests use synchronized time:

```typescript
// BingX
const timestamp = this.getSyncedTime();

// In makeRequest()
const requestParams = {
  ...params,
  timestamp
};
```

For Bybit, the official SDK handles timestamp generation internally, but having the synced time available allows for:
- Accurate funding time calculations
- Precise countdown timers
- Order scheduling

### Periodic Re-synchronization

Time sync is automatically refreshed every 5 minutes to handle:
- Clock drift on the local system
- NTP adjustments
- Server time changes

```typescript
// Auto-syncs every 5 minutes
private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000;

startPeriodicSync(): void {
  this.syncInterval = setInterval(async () => {
    await this.syncTime();
  }, this.SYNC_INTERVAL_MS);
}
```

## API Endpoints

### BingX

**Endpoint**: `GET /openApi/swap/v2/server/time`

**Request**: No parameters required (public endpoint)

**Response**:
```json
{
  "code": 0,
  "msg": "",
  "data": {
    "serverTime": 1696789234567
  }
}
```

### Bybit

**Endpoint**: `GET /v5/market/time`

**Request**: No parameters required (public endpoint)

**Response**:
```json
{
  "retCode": 0,
  "retMsg": "OK",
  "result": {
    "timeSecond": "1688639403",
    "timeNano": "1688639403423213947"
  }
}
```

**Note**: The SDK method `restClient.getServerTime()` is used, which internally calls this endpoint.

## Public API Methods

### BingXService & BybitService

#### `getServerTime(): Promise<number>`
Fetches the current server time from the exchange.

**Returns**: Server time in milliseconds

**Example**:
```typescript
const serverTime = await bingxService.getServerTime();
console.log(`Server time: ${new Date(serverTime).toISOString()}`);
```

#### `syncTime(): Promise<void>`
Synchronizes local time with exchange server time and calculates the offset.

**Side Effects**:
- Updates `timeOffset`
- Updates `lastSyncTime`
- Logs sync status
- Warns if offset > 1 second

**Example**:
```typescript
await bingxService.syncTime();
```

#### `getSyncedTime(): number`
Returns the current time adjusted with the server time offset.

**Returns**: Synchronized timestamp in milliseconds

**Example**:
```typescript
const syncedTime = bingxService.getSyncedTime();
const timestamp = syncedTime; // Use for API requests
```

#### `startPeriodicSync(): void`
Starts automatic time synchronization every 5 minutes.

**Example**:
```typescript
bingxService.startPeriodicSync();
```

#### `stopPeriodicSync(): void`
Stops the periodic synchronization.

**Example**:
```typescript
bingxService.stopPeriodicSync();
```

#### `getTimeSyncStatus(): { offset: number; lastSyncTime: number; syncAge: number }`
Returns the current synchronization status.

**Returns**:
- `offset`: Time offset in milliseconds
- `lastSyncTime`: Timestamp of last sync
- `syncAge`: How long ago the last sync occurred (in milliseconds)

**Example**:
```typescript
const status = bingxService.getTimeSyncStatus();
console.log(`Offset: ${status.offset}ms`);
console.log(`Last sync: ${new Date(status.lastSyncTime).toISOString()}`);
console.log(`Sync age: ${status.syncAge}ms`);
```

## Integration with Connectors

Both `BingXConnector` and `BybitConnector` automatically initialize time synchronization:

```typescript
async initialize(): Promise<void> {
  // Synchronize time with exchange server
  await this.bingxService.syncTime();

  // Start periodic time sync
  this.bingxService.startPeriodicSync();

  // Log time sync status
  const syncStatus = this.bingxService.getTimeSyncStatus();
  console.log('[BingXConnector] Time sync status:', syncStatus);

  // Test connection
  await this.bingxService.getAccountInfo();
  this.isInitialized = true;
}
```

## Error Handling

### Graceful Degradation

If time synchronization fails:
1. Error is logged
2. Service falls back to local time
3. Warning is displayed
4. Initialization continues

```typescript
try {
  await this.syncTime();
} catch (error) {
  console.error('[BingXService] Time sync failed:', error.message);
  console.warn('[BingXService] Falling back to local time');
  // Don't throw - continue with local time
}
```

### Large Offset Warnings

If the time offset exceeds 1 second, a warning is logged:

```typescript
if (Math.abs(newOffset) > this.LARGE_OFFSET_WARNING_MS) {
  console.warn(`[BingXService] WARNING: Large time offset detected: ${newOffset}ms`);
}
```

This indicates potential issues:
- System clock is significantly out of sync
- Network latency is very high
- Exchange server time may be incorrect

## Testing

### Manual Testing

Run the test script:

```bash
npx ts-node test-time-sync.ts
```

This tests:
1. Server time retrieval
2. Time synchronization
3. Synced time accuracy
4. Offset consistency
5. Periodic sync functionality

### Expected Output

```
========================================
Testing BingX Time Synchronization
========================================

Test 1: Getting BingX server time...
  Server time: 1696789234567 (2023-10-08T12:34:56.567Z)
  Local time:  1696789234123 (2023-10-08T12:34:56.123Z)
  Difference:  444ms

Test 2: Synchronizing time...
  Sync status: { offset: 444, lastSyncTime: 1696789234567, syncAge: 0 }

Test 3: Getting synced time...
  Synced time:  1696789235011 (2023-10-08T12:34:57.011Z)
  Current time: 1696789234567 (2023-10-08T12:34:56.567Z)
  Offset applied: 444ms

Test 4: Verifying offset consistency...
  New server time: 1696789235455
  Synced time:     1696789235011
  Difference:      444ms
  ✓ Offset is accurate (within 500ms)

✓ BingX time synchronization tests completed successfully
```

### Integration Testing

Test with actual API credentials:

```bash
export BINGX_API_KEY="your-api-key"
export BINGX_API_SECRET="your-api-secret"
export BYBIT_API_KEY="your-api-key"
export BYBIT_API_SECRET="your-api-secret"

npx ts-node test-time-sync.ts
```

## Production Considerations

### Monitoring

Monitor these metrics:
1. **Time Offset**: Should be < 1000ms typically
2. **Sync Age**: Should never exceed 10 minutes
3. **Sync Failures**: Should be rare

### Alerts

Set up alerts for:
- Time offset > 2000ms
- Sync age > 10 minutes
- Repeated sync failures

### Logging

All time sync operations are logged:
- Sync success/failure
- Offset values
- Large offset warnings
- Periodic sync events

## Troubleshooting

### Problem: "Timestamp is invalid" errors

**Possible Causes**:
- System clock is significantly out of sync
- Time sync hasn't been initialized
- Network latency is very high

**Solution**:
1. Check system clock: `date`
2. Verify sync status: `getTimeSyncStatus()`
3. Manually re-sync: `await syncTime()`
4. Check network latency

### Problem: Large time offsets (> 1 second)

**Possible Causes**:
- System clock is incorrect
- NTP service is not running
- High network latency

**Solution**:
1. Enable NTP: `sudo systemctl start systemd-timesyncd`
2. Sync system clock: `sudo ntpdate -s time.nist.gov`
3. Check network latency: `ping api.bybit.com`

### Problem: Funding arbitrage orders placed at wrong time

**Possible Causes**:
- Time offset is incorrect
- Sync hasn't been performed recently
- Periodic sync is not running

**Solution**:
1. Check sync status: `getTimeSyncStatus()`
2. Verify periodic sync is running
3. Manually trigger sync: `await syncTime()`

## Future Enhancements

Potential improvements:
1. **Multiple time samples**: Average multiple server time requests for better accuracy
2. **Network latency compensation**: More sophisticated latency estimation
3. **Sync on demand**: Trigger sync before critical operations (funding fee collection)
4. **Monitoring dashboard**: Real-time view of sync status across all exchanges
5. **Adaptive sync interval**: Adjust sync frequency based on offset stability

## References

- [BingX API Documentation](https://bingx-api.github.io/docs/#/en-us/swapV2/base-info.html)
- [Bybit API Documentation](https://bybit-exchange.github.io/docs/v5/market/time)
- [Time Synchronization Best Practices](https://en.wikipedia.org/wiki/Network_Time_Protocol)
