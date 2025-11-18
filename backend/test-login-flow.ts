import prisma from './src/lib/prisma';
import { AuthService } from './src/lib/auth';

async function testLoginFlow() {
  try {
    console.log('=== Testing Complete Login Flow ===\n');

    const email = 'admin@test.com';
    const password = 'test123';

    // Step 1: Find user
    console.log('Step 1: Finding user by email...');
    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      console.error('   ✗ User not found!');
      return;
    }
    console.log(`   ✓ User found: ${user.email}`);

    // Step 2: Check password
    console.log('\nStep 2: Checking password...');
    if (!user.password) {
      console.error('   ✗ User has no password!');
      return;
    }

    // Try with test password
    const isValidTest = await AuthService.comparePasswords('test123', user.password);
    console.log(`   Password 'test123' matches: ${isValidTest}`);

    // Try with admin
    const isValidAdmin = await AuthService.comparePasswords('admin', user.password);
    console.log(`   Password 'admin' matches: ${isValidAdmin}`);

    // Try with password
    const isValidPassword = await AuthService.comparePasswords('password', user.password);
    console.log(`   Password 'password' matches: ${isValidPassword}`);

    if (!isValidTest && !isValidAdmin && !isValidPassword) {
      console.log('\n   None of the test passwords worked. Let me check the hash...');
      console.log(`   Stored hash: ${user.password}`);
      console.log(`   Hash starts with $2a$ (bcrypt): ${user.password.startsWith('$2a$')}`);
      return;
    }

    const validPassword = isValidTest ? 'test123' : isValidAdmin ? 'admin' : 'password';
    console.log(`   ✓ Valid password found: ${validPassword}`);

    // Step 3: Generate token
    console.log('\nStep 3: Generating JWT token...');
    try {
      const token = AuthService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      console.log(`   ✓ Token generated: ${token.substring(0, 20)}...`);
    } catch (error) {
      console.error('   ✗ Token generation failed:', error);
      return;
    }

    // Step 4: Create session
    console.log('\nStep 4: Creating session...');
    try {
      const testToken = AuthService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      await AuthService.createSession(user.id, testToken);
      console.log('   ✓ Session created');

      // Clean up test session
      await AuthService.invalidateSession(testToken);
      console.log('   ✓ Test session cleaned up');
    } catch (error) {
      console.error('   ✗ Session creation failed:', error);
      return;
    }

    // Step 5: Update last login
    console.log('\nStep 5: Updating last login...');
    try {
      const updated = await AuthService.updateUser(user.id, {
        lastLoginAt: new Date()
      });
      console.log('   ✓ Last login updated');
      console.log(`   Last login at: ${updated?.lastLoginAt}`);
    } catch (error) {
      console.error('   ✗ Update user failed:', error);
      console.error('   Error details:', error);
      return;
    }

    console.log('\n=== All steps passed! ===');
    console.log(`\nYou can log in with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${validPassword}`);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginFlow();
