import prisma from './src/lib/prisma';
import { AuthService } from './src/lib/auth';

async function testEndpointError() {
  try {
    console.log('=== Testing endpoint issues ===\n');

    // Step 1: Login and get a token
    const user = await AuthService.findUserByEmail('admin@test.com');
    if (!user) {
      console.error('User not found');
      return;
    }

    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('✓ Got auth token\n');

    // Step 2: Try to call ExchangeCredentialsService
    console.log('Testing ExchangeCredentialsService...');

    try {
      const { ExchangeCredentialsService } = await import('./src/lib/exchange-credentials-service');
      console.log('✓ ExchangeCredentialsService imported');

      // Try to get credentials
      const credentials = await ExchangeCredentialsService.getCredentials(user.id);
      console.log(`✓ Got ${credentials.length} credentials`);

    } catch (error: any) {
      console.error('✗ Error with ExchangeCredentialsService:');
      console.error('  Message:', error.message);
      console.error('  Stack:', error.stack);
    }

    // Step 3: Check database connection
    console.log('\nTesting database connection...');
    try {
      const count = await prisma.exchangeCredentials.count();
      console.log(`✓ Database OK - found ${count} exchange credentials`);
    } catch (error: any) {
      console.error('✗ Database error:', error.message);
    }

  } catch (error: any) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpointError();
