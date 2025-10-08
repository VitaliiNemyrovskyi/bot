/**
 * Test script for encryption service
 *
 * Run with: npx tsx src/lib/test-encryption.ts
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { EncryptionService } from './encryption';

console.log('Testing Encryption Service...\n');

// Test 1: Basic encryption/decryption
console.log('Test 1: Basic Encryption/Decryption');
const testData = 'my-secret-api-key-123456';
console.log('Original:', testData);

const encrypted = EncryptionService.encrypt(testData);
console.log('Encrypted:', encrypted);
console.log('Format check:', encrypted.split(':').length === 3 ? 'PASS' : 'FAIL');

const decrypted = EncryptionService.decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', testData === decrypted ? 'PASS' : 'FAIL');
console.log();

// Test 2: Different data produces different encrypted values
console.log('Test 2: Randomization Check');
const encrypted1 = EncryptionService.encrypt(testData);
const encrypted2 = EncryptionService.encrypt(testData);
console.log('Same input, different output:', encrypted1 !== encrypted2 ? 'PASS' : 'FAIL');
console.log('Both decrypt correctly:',
  EncryptionService.decrypt(encrypted1) === testData &&
  EncryptionService.decrypt(encrypted2) === testData ? 'PASS' : 'FAIL'
);
console.log();

// Test 3: Configuration validation
console.log('Test 3: Configuration Validation');
const isValid = EncryptionService.validateConfiguration();
console.log('Encryption configured correctly:', isValid ? 'PASS' : 'FAIL');
console.log();

// Test 4: Generate new encryption key
console.log('Test 4: Generate Encryption Key');
const newKey = EncryptionService.generateEncryptionKey();
console.log('Generated key (64 chars):', newKey);
console.log('Length check:', newKey.length === 64 ? 'PASS' : 'FAIL');
console.log('Hex format:', /^[0-9a-f]{64}$/.test(newKey) ? 'PASS' : 'FAIL');
console.log();

// Test 5: Error handling
console.log('Test 5: Error Handling');
try {
  EncryptionService.decrypt('invalid-data');
  console.log('Invalid data handling: FAIL (should have thrown error)');
} catch (error) {
  console.log('Invalid data handling: PASS (correctly threw error)');
}

console.log('\nAll tests completed!');
