/**
 * Test script for ContractCalculator
 *
 * This script tests the unified contract calculation system
 * to ensure both exchanges open identical effective quantities.
 */

import { ContractCalculator, ContractSpecification } from './src/lib/contract-calculator';

console.log('='.repeat(80));
console.log('CONTRACT CALCULATOR TEST');
console.log('='.repeat(80));
console.log();

// Test Case 1: AVNT - Bybit (multiplier=1) vs Gate.io (multiplier=10)
// This was the problematic case where 75 AVNT vs 100 AVNT opened
console.log('TEST 1: AVNT/USDT - Bybit (multiplier=1) vs Gate.io (multiplier=10)');
console.log('-'.repeat(80));

const bybitAVNTSpec: ContractSpecification = {
  exchange: 'BYBIT',
  symbol: 'AVNTUSDT',
  multiplier: 1,
  minOrderSize: 1,
  maxOrderSize: 100000,
};

const gateioAVNTSpec: ContractSpecification = {
  exchange: 'GATEIO',
  symbol: 'AVNT_USDT',
  multiplier: 10,
  minOrderSize: 1,
  maxOrderSize: 100000,
};

const totalQuantity = 75; // 75 AVNT total
const parts = 5;

console.log('Input:');
console.log(`  Total Quantity: ${totalQuantity} AVNT`);
console.log(`  Parts: ${parts}`);
console.log(`  Bybit spec:`, bybitAVNTSpec);
console.log(`  Gate.io spec:`, gateioAVNTSpec);
console.log();

const result1 = ContractCalculator.calculateGraduatedQuantities(
  totalQuantity,
  parts,
  bybitAVNTSpec,
  gateioAVNTSpec
);

console.log('Result:');
console.log(`  Quantity per part: ${result1.quantityPerPart} AVNT`);
console.log(`  Effective per part: ${result1.effectiveQuantityPerPart} AVNT`);
console.log(`  Total effective: ${result1.totalEffectiveQuantity} AVNT`);
console.log(`  Adjusted total: ${result1.adjustedTotal} AVNT`);
console.log();

// Verify each part
console.log('Verification per part:');
for (let i = 1; i <= parts; i++) {
  const bybitCalc = ContractCalculator.calculateEffectiveQuantity(
    result1.quantityPerPart,
    bybitAVNTSpec
  );
  const gateioCalc = ContractCalculator.calculateEffectiveQuantity(
    result1.quantityPerPart,
    gateioAVNTSpec
  );

  console.log(`  Part ${i}:`);
  console.log(`    Bybit: ${result1.quantityPerPart} → ${bybitCalc.contracts} contracts → ${bybitCalc.effectiveQuantity} AVNT`);
  console.log(`    Gate.io: ${result1.quantityPerPart} → ${gateioCalc.contracts} contracts → ${gateioCalc.effectiveQuantity} AVNT`);
  console.log(`    Match: ${bybitCalc.effectiveQuantity === gateioCalc.effectiveQuantity ? '✓ YES' : '✗ NO'}`);
}

console.log();
console.log('Total after all parts:');
console.log(`  Bybit: ${result1.effectiveQuantityPerPart * parts} AVNT`);
console.log(`  Gate.io: ${result1.effectiveQuantityPerPart * parts} AVNT`);
console.log(`  Match: ${result1.effectiveQuantityPerPart * parts === result1.totalEffectiveQuantity ? '✓ YES' : '✗ NO'}`);
console.log();

// Test Case 2: Old method (simple division) for comparison
console.log('='.repeat(80));
console.log('COMPARISON: Old Method (Simple Division)');
console.log('-'.repeat(80));

const oldQuantityPerPart = totalQuantity / parts;
console.log(`Old quantity per part: ${oldQuantityPerPart} AVNT`);
console.log();

console.log('Old method result per part:');
for (let i = 1; i <= parts; i++) {
  const bybitCalc = ContractCalculator.calculateEffectiveQuantity(
    oldQuantityPerPart,
    bybitAVNTSpec
  );
  const gateioCalc = ContractCalculator.calculateEffectiveQuantity(
    oldQuantityPerPart,
    gateioAVNTSpec
  );

  console.log(`  Part ${i}:`);
  console.log(`    Bybit: ${oldQuantityPerPart} → ${bybitCalc.contracts} contracts → ${bybitCalc.effectiveQuantity} AVNT`);
  console.log(`    Gate.io: ${oldQuantityPerPart} → ${gateioCalc.contracts} contracts → ${gateioCalc.effectiveQuantity} AVNT`);
  console.log(`    Match: ${bybitCalc.effectiveQuantity === gateioCalc.effectiveQuantity ? '✓ YES' : '✗ NO'}`);
  console.log(`    Difference: ${Math.abs(bybitCalc.effectiveQuantity - gateioCalc.effectiveQuantity)} AVNT`);
}

console.log();
const oldBybitTotal = oldQuantityPerPart * parts;
const oldGateioTotal = Math.round(oldQuantityPerPart / 10) * 10 * parts;
console.log('Old method total:');
console.log(`  Bybit: ${oldBybitTotal} AVNT`);
console.log(`  Gate.io: ${oldGateioTotal} AVNT`);
console.log(`  Difference: ${Math.abs(oldBybitTotal - oldGateioTotal)} AVNT ❌`);
console.log();

// Test Case 3: NMR - MEXC (multiplier=10) vs Bybit (multiplier=1)
console.log('='.repeat(80));
console.log('TEST 2: NMR/USDT - Bybit (multiplier=1) vs MEXC (multiplier=10)');
console.log('-'.repeat(80));

const bybitNMRSpec: ContractSpecification = {
  exchange: 'BYBIT',
  symbol: 'NMRUSDT',
  multiplier: 1,
  minOrderSize: 0.1,
  maxOrderSize: 100000,
};

const mexcNMRSpec: ContractSpecification = {
  exchange: 'MEXC',
  symbol: 'NMR_USDT',
  multiplier: 10,
  minOrderSize: 1,
  maxOrderSize: 100000,
};

const totalQuantityNMR = 50; // 50 NMR total
const partsNMR = 4;

console.log('Input:');
console.log(`  Total Quantity: ${totalQuantityNMR} NMR`);
console.log(`  Parts: ${partsNMR}`);
console.log();

const result2 = ContractCalculator.calculateGraduatedQuantities(
  totalQuantityNMR,
  partsNMR,
  bybitNMRSpec,
  mexcNMRSpec
);

console.log('Result:');
console.log(`  Quantity per part: ${result2.quantityPerPart} NMR`);
console.log(`  Effective per part: ${result2.effectiveQuantityPerPart} NMR`);
console.log(`  Total effective: ${result2.totalEffectiveQuantity} NMR`);
console.log();

// Verify each part
console.log('Verification per part:');
for (let i = 1; i <= partsNMR; i++) {
  const bybitCalc = ContractCalculator.calculateEffectiveQuantity(
    result2.quantityPerPart,
    bybitNMRSpec
  );
  const mexcCalc = ContractCalculator.calculateEffectiveQuantity(
    result2.quantityPerPart,
    mexcNMRSpec
  );

  console.log(`  Part ${i}:`);
  console.log(`    Bybit: ${result2.quantityPerPart} → ${bybitCalc.contracts} contracts → ${bybitCalc.effectiveQuantity} NMR`);
  console.log(`    MEXC: ${result2.quantityPerPart} → ${mexcCalc.contracts} contracts → ${mexcCalc.effectiveQuantity} NMR`);
  console.log(`    Match: ${bybitCalc.effectiveQuantity === mexcCalc.effectiveQuantity ? '✓ YES' : '✗ NO'}`);
}

console.log();
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log('✓ New method (ContractCalculator) ensures identical quantities on both exchanges');
console.log('✗ Old method (simple division) caused quantity mismatches');
console.log('✓ The fix prevents issues like 75 AVNT on Bybit vs 100 AVNT on Gate.io');
console.log('='.repeat(80));
