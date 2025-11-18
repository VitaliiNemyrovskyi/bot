import prisma from './src/lib/prisma';
import { AuthService } from './src/lib/auth';

async function findPassword() {
  try {
    const user = await AuthService.findUserByEmail('admin@test.com');

    if (!user || !user.password) {
      console.log('User not found or has no password');
      return;
    }

    console.log('Testing common passwords for admin@test.com...\n');

    const commonPasswords = [
      'password123',
      'admin123',
      'admin',
      'test123',
      'password',
      '123456',
      'Admin123',
      'admin@test.com',
      'Test123',
      'Password123',
      'qwerty',
      'letmein',
      '12345678',
      'adminpass',
      'root',
      'toor',
      'changeme',
      'P@ssw0rd',
      'Welcome123',
    ];

    for (const pwd of commonPasswords) {
      const isValid = await AuthService.comparePasswords(pwd, user.password);
      if (isValid) {
        console.log(`✓ FOUND! Password is: ${pwd}`);
        return;
      }
    }

    console.log('✗ Password not found in common password list.');
    console.log('\nPlease check if you know the password or we may need to reset it.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findPassword();
