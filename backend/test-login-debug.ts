import prisma from './src/lib/prisma';
import { AuthService } from './src/lib/auth';

async function testLogin() {
  try {
    console.log('=== Testing Login Debug ===\n');

    // Check database connection
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`   Found ${userCount} users in database\n`);

    // List all users
    console.log('2. Listing all users:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });

    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Has password: ${!!user.password}`);
    });
    console.log('');

    // Test with first user if exists
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`3. Testing login with user: ${testUser.email}`);

      // Try to find user by email
      const foundUser = await AuthService.findUserByEmail(testUser.email);
      console.log(`   User found: ${!!foundUser}`);
      console.log(`   User has password: ${!!foundUser?.password}\n`);

      if (foundUser && foundUser.password) {
        // Test password comparison with a test password
        console.log('4. Testing password hashing:');
        const testPassword = 'test123';
        const hashedPassword = await AuthService.hashPassword(testPassword);
        console.log(`   Test password: ${testPassword}`);
        console.log(`   Hashed: ${hashedPassword.substring(0, 20)}...`);

        const isMatch = await AuthService.comparePasswords(testPassword, hashedPassword);
        console.log(`   Comparison result: ${isMatch}\n`);

        // Try comparing with stored password
        console.log('5. Testing with stored password:');
        console.log(`   Stored password hash: ${foundUser.password.substring(0, 20)}...`);

        // Test with common passwords
        const commonPasswords = ['password', 'admin', 'test123', '123456'];
        for (const pwd of commonPasswords) {
          const match = await AuthService.comparePasswords(pwd, foundUser.password);
          if (match) {
            console.log(`   ✓ Password matches: ${pwd}`);
          }
        }
      }
    } else {
      console.log('3. No users found in database!');
      console.log('   Creating a test user...');

      const testEmail = 'test@example.com';
      const testPassword = 'test123';
      const hashedPassword = await AuthService.hashPassword(testPassword);

      const newUser = await AuthService.createUser({
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'ADMIN'
      });

      console.log(`   Created user: ${newUser.email}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   Role: ${newUser.role}\n`);
    }

    // Test JWT_SECRET
    console.log('6. Checking environment variables:');
    console.log(`   JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
    console.log(`   DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
