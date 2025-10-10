import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './src/lib/encryption';

const prisma = new PrismaClient();

async function testDecryption() {
  try {
    // Fetch BingX credentials
    const cred = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BINGX',
        userId: 'admin_1'
      }
    });

    if (!cred) {
      console.log('❌ No BingX credentials found');
      return;
    }

    console.log('=== BingX Credentials ===');
    console.log('Encrypted API Key length:', cred.apiKey.length);
    console.log('Encrypted API Secret length:', cred.apiSecret.length);
    console.log('');

    // Decrypt credentials
    const decryptedKey = EncryptionService.decrypt(cred.apiKey);
    const decryptedSecret = EncryptionService.decrypt(cred.apiSecret);

    console.log('=== Decrypted Values ===');
    console.log('API Key length:', decryptedKey.length);
    console.log('API Secret length:', decryptedSecret.length);
    console.log('');

    // Check for whitespace issues
    const keyHasWhitespace = decryptedKey !== decryptedKey.trim();
    const secretHasWhitespace = decryptedSecret !== decryptedSecret.trim();

    console.log('=== Whitespace Check ===');
    console.log('API Key has whitespace:', keyHasWhitespace ? '❌ YES' : '✅ NO');
    console.log('API Secret has whitespace:', secretHasWhitespace ? '❌ YES' : '✅ NO');
    console.log('');

    // Show first/last chars (for debugging)
    console.log('=== Character Analysis ===');
    console.log('API Key first 10 chars:', decryptedKey.substring(0, 10));
    console.log('API Key last 10 chars:', decryptedKey.substring(decryptedKey.length - 10));
    console.log('API Secret first 10 chars:', decryptedSecret.substring(0, 10));
    console.log('API Secret last 10 chars:', decryptedSecret.substring(decryptedSecret.length - 10));
    console.log('');

    // Check for special characters
    const keyHasSpecialChars = /[^a-zA-Z0-9-_]/.test(decryptedKey);
    const secretHasSpecialChars = /[^a-zA-Z0-9-_]/.test(decryptedSecret);

    console.log('=== Special Characters ===');
    console.log('API Key has special chars:', keyHasSpecialChars ? '⚠️  YES' : '✅ NO');
    console.log('API Secret has special chars:', secretHasSpecialChars ? '⚠️  YES' : '✅ NO');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDecryption();
