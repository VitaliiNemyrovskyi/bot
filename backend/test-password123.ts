import prisma from './src/lib/prisma';
import { AuthService } from './src/lib/auth';

async function testPassword123() {
  try {
    const user = await AuthService.findUserByEmail('admin@test.com');

    if (!user || !user.password) {
      console.log('User not found or has no password');
      return;
    }

    console.log('Testing password: password123');
    const isValid = await AuthService.comparePasswords('password123', user.password);
    console.log(`Result: ${isValid ? '✓ MATCH' : '✗ NO MATCH'}`);

    if (!isValid) {
      console.log('\nThe password in the database does not match password123.');
      console.log('Let me reset it for you...\n');

      // Hash the new password
      const newPassword = 'admin123';
      const hashedPassword = await AuthService.hashPassword(newPassword);

      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      console.log('✓ Password has been reset!');
      console.log(`\nYou can now log in with:`);
      console.log(`Email: admin@test.com`);
      console.log(`Password: admin123`);
    } else {
      console.log(`\nYou can log in with:`);
      console.log(`Email: admin@test.com`);
      console.log(`Password: password123`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword123();
