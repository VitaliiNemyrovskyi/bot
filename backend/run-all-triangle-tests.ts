#!/usr/bin/env tsx
/**
 * Test Runner для всіх тестів трикутного арбітражу
 *
 * Запуск: npx tsx run-all-triangle-tests.ts
 */

import { execSync } from 'child_process';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║     ТЕСТИ ВИПРАВЛЕНЬ ТРИКУТНОГО АРБІТРАЖУ                         ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('');

const tests = [
  {
    name: '1. Тест буферів (Old vs New Strategy)',
    file: 'test-buffer-comparison.ts',
    critical: true,
    description: 'Демонструє як нові буфери вирішують проблему Gate.io'
  },
  {
    name: '2. Тест калькулятора з прибутком',
    file: 'test-clear-profit.ts',
    critical: true,
    description: 'Перевіряє що калькулятор знаходить profitable можливості'
  },
  {
    name: '3. Детальний debug symbol matching',
    file: 'test-triangle-debug.ts',
    critical: false,
    description: 'Показує як працює symbol matching і BUY/SELL визначення'
  },
  {
    name: '4. Тест з різними position sizes',
    file: 'test-profitable-triangle.ts',
    critical: false,
    description: 'Тестує різні position sizes та minimum order checks'
  },
];

let passedTests = 0;
let failedTests = 0;
const results: Array<{ name: string; status: 'PASS' | 'FAIL'; error?: string }> = [];

for (const test of tests) {
  console.log('─'.repeat(70));
  console.log(`\n${test.critical ? '⭐' : '📋'} ${test.name}`);
  console.log(`   ${test.description}`);
  console.log('');

  try {
    // Run test
    execSync(`npx tsx ${test.file}`, { stdio: 'inherit' });

    console.log('\n✅ ТЕСТ ПРОЙДЕНО\n');
    passedTests++;
    results.push({ name: test.name, status: 'PASS' });
  } catch (error) {
    console.log('\n❌ ТЕСТ НЕ ПРОЙДЕНО\n');
    failedTests++;
    results.push({
      name: test.name,
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Summary
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                        РЕЗУЛЬТАТИ ТЕСТІВ                          ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('');

for (const result of results) {
  const icon = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${result.name}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
}

console.log('');
console.log('─'.repeat(70));
console.log(`Всього тестів: ${tests.length}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);
console.log('─'.repeat(70));

if (failedTests === 0) {
  console.log('\n🎉 ВСІ ТЕСТИ ПРОЙДЕНО! Виправлення працюють коректно.\n');
  console.log('Наступні кроки:');
  console.log('  1. Перевір compilation: npm run build');
  console.log('  2. Задеплой на тестове середовище');
  console.log('  3. Протестуй з невеликою сумою на Gate.io (10-20 USDT)');
  console.log('  4. Моніторь логи на наявність помилок');
  console.log('');
} else {
  console.log('\n⚠️  ДЕЯКІ ТЕСТИ НЕ ПРОЙДЕНО. Перевір помилки вище.\n');
  process.exit(1);
}
