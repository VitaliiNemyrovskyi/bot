# Gate.io Quanto Multiplier Fix

## Problem

The `/api/exchange/symbol-info` endpoint was not correctly handling Gate.io's `quanto_multiplier` parameter, causing incorrect minimum order quantities to be returned to the frontend.

### Example: AIA_USDT

- **Raw contract data from Gate.io API:**
  - `order_size_min`: 1 (contract)
  - `quanto_multiplier`: 10
  - This means: 1 contract = 10 AIA

- **BEFORE (incorrect):**
  - API returned: `minOrderQty: 1`, `qtyStep: 1`
  - User tried to open position with 5 AIA
  - Backend rejected with error: "Quantity 5 AIA cannot be converted to whole contracts. Quanto multiplier is 10. Use multiple of 10."

- **AFTER (correct):**
  - API returns: `minOrderQty: 10`, `qtyStep: 10`
  - Frontend now shows correct minimum: 10 AIA
  - User cannot enter invalid quantities < 10 AIA

## Root Cause

The `getGateIOSymbolInfo()` function in `/api/exchange/symbol-info/route.ts` was returning raw contract sizes without multiplying by `quanto_multiplier`, while the `/api/arbitrage/graduated-entry/route.ts` endpoint was correctly applying the multiplier.

## Solution

Applied the same quanto multiplier logic to `/api/exchange/symbol-info/route.ts`:

```typescript
// BEFORE (wrong)
minOrderQty: parseFloat(contract.order_size_min || '1'),  // = 1
qtyStep: parseFloat(contract.order_size_min || '1'),      // = 1

// AFTER (correct)
const quantoMultiplier = parseFloat(contract.quanto_multiplier || '1');
const minOrderQtyInBaseCurrency = parseFloat(contract.order_size_min || '1') * quantoMultiplier;  // = 10
const qtyStepInBaseCurrency = parseFloat(contract.order_size_min || '1') * quantoMultiplier;      // = 10
```

## Affected Symbols

This fix applies to all Gate.io futures contracts with `quanto_multiplier > 1`:
- AIA_USDT (quanto_multiplier: 10)
- AVNT_USDT (quanto_multiplier: 10)
- And any other contracts with non-1 quanto multipliers

## Testing

Run `npx tsx test-aia-symbol-info.ts` to verify the fix.

## Related Files

- Fixed: `backend/src/app/api/exchange/symbol-info/route.ts`
- Reference: `backend/src/app/api/arbitrage/graduated-entry/route.ts` (already correct)
- Frontend validation: `frontend/src/app/services/symbol-info.service.ts` (lines 134-150)
