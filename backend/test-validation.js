#!/usr/bin/env node

/**
 * Standalone validation test script
 * Tests the validateOrderQuantity logic without Angular dependencies
 */

// Validation logic (copy from SymbolInfoService)
function validateOrderQuantity(symbolInfo, totalQuantity, graduatedParts = 1) {
  if (!symbolInfo) {
    return { valid: false, error: 'Symbol information not available' };
  }

  const qtyPerPart = totalQuantity / graduatedParts;

  if (qtyPerPart < symbolInfo.minOrderQty) {
    const minTotalQty = symbolInfo.minOrderQty * graduatedParts;
    const maxParts = Math.floor(totalQuantity / symbolInfo.minOrderQty);

    let suggestion;
    if (graduatedParts === 1 || maxParts === 0) {
      suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)}`;
    } else {
      suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)} or reduce graduated parts to ${maxParts}`;
    }

    return {
      valid: false,
      error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)}) is below minimum (${symbolInfo.minOrderQty})`,
      suggestion
    };
  }

  if (symbolInfo.maxOrderQty && qtyPerPart > symbolInfo.maxOrderQty) {
    return {
      valid: false,
      error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)}) exceeds maximum (${symbolInfo.maxOrderQty})`,
      suggestion: `Decrease quantity or increase graduated parts`
    };
  }

  // Check quantity step
  // Round to avoid floating point precision issues
  const roundedQtyPerPart = Math.round(qtyPerPart / symbolInfo.qtyStep) * symbolInfo.qtyStep;
  const difference = Math.abs(qtyPerPart - roundedQtyPerPart);

  // If difference is significant (more than 0.1% of step size), quantity is not valid
  if (difference > symbolInfo.qtyStep * 0.001) {
    return {
      valid: false,
      error: `Quantity per part must be a multiple of ${symbolInfo.qtyStep}`,
      suggestion: `Adjust total quantity to ${(roundedQtyPerPart * graduatedParts).toFixed(symbolInfo.qtyPrecision)}`
    };
  }

  return { valid: true };
}

// Test data
const symbolInfo = {
  symbol: 'MERL-USDT',
  exchange: 'BINGX',
  minOrderQty: 5.292,
  minOrderValue: 10,
  qtyStep: 0.001,
  pricePrecision: 2,
  qtyPrecision: 3,
  maxOrderQty: 10000
};

// Test suite
const tests = [
  {
    name: 'should validate successfully when quantity per part meets minimum',
    input: { qty: 30, parts: 5 },
    expected: { valid: true }
  },
  {
    name: 'should fail when quantity per part is below minimum',
    input: { qty: 10, parts: 5 },
    expected: { valid: false, errorContains: 'below minimum', suggestionContains: '26.460' }
  },
  {
    name: 'should fail when single order is below minimum',
    input: { qty: 5, parts: 1 },
    expected: { valid: false, errorContains: 'below minimum', suggestionContains: '5.292', suggestionNotContains: 'reduce graduated parts' }
  },
  {
    name: 'should suggest reducing parts when possible',
    input: { qty: 15, parts: 3 },
    expected: { valid: false, suggestionContains: 'reduce graduated parts to 2' }
  },
  {
    name: 'should not suggest reducing parts below 1',
    input: { qty: 3, parts: 1 },
    expected: { valid: false, suggestionNotContains: 'reduce graduated parts' }
  },
  {
    name: 'should validate exactly at minimum quantity',
    input: { qty: 5.292, parts: 1 },
    expected: { valid: true }
  },
  {
    name: 'should validate with multiple parts at minimum per part',
    input: { qty: 26.46, parts: 5 },
    expected: { valid: true }
  },
  {
    name: 'should fail when quantity per part exceeds maximum',
    input: { qty: 50000, parts: 1 },
    expected: { valid: false, errorContains: 'exceeds maximum' }
  },
  {
    name: 'should handle BingX MERL-USDT original failing case',
    input: { qty: 10, parts: 5 },
    expected: { valid: false, errorContains: '2.000', suggestionContains: '26.460' }
  },
  {
    name: 'should allow corrected quantity for original failing case',
    input: { qty: 26.46, parts: 5 },
    expected: { valid: true }
  },
  {
    name: 'should allow reducing parts for original failing case',
    input: { qty: 10, parts: 1 },
    expected: { valid: true }
  },
  {
    name: 'should handle zero quantity',
    input: { qty: 0, parts: 1 },
    expected: { valid: false }
  },
  {
    name: 'should handle very large graduated parts',
    input: { qty: 100, parts: 20 },
    expected: { valid: false, errorContains: 'below minimum' }
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running validation tests...\n');

tests.forEach((test, index) => {
  const result = validateOrderQuantity(symbolInfo, test.input.qty, test.input.parts);
  let success = true;
  let failureReason = '';

  // Check valid flag
  if (result.valid !== test.expected.valid) {
    success = false;
    failureReason = `Expected valid=${test.expected.valid}, got valid=${result.valid}`;
  }

  // Check error contains
  if (test.expected.errorContains && (!result.error || !result.error.includes(test.expected.errorContains))) {
    success = false;
    failureReason = `Expected error to contain "${test.expected.errorContains}", got "${result.error}"`;
  }

  // Check suggestion contains
  if (test.expected.suggestionContains && (!result.suggestion || !result.suggestion.includes(test.expected.suggestionContains))) {
    success = false;
    failureReason = `Expected suggestion to contain "${test.expected.suggestionContains}", got "${result.suggestion}"`;
  }

  // Check suggestion not contains
  if (test.expected.suggestionNotContains && result.suggestion && result.suggestion.includes(test.expected.suggestionNotContains)) {
    success = false;
    failureReason = `Expected suggestion NOT to contain "${test.expected.suggestionNotContains}", but it does: "${result.suggestion}"`;
  }

  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.name}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Reason: ${failureReason}`);
    console.log(`   Input: qty=${test.input.qty}, parts=${test.input.parts}`);
    console.log(`   Result:`, result);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`Total: ${tests.length} tests`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`${'='.repeat(60)}`);

process.exit(failed > 0 ? 1 : 0);
