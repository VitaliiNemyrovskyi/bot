import prisma from './src/lib/prisma';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    console.log('\n=== Users in database ===');
    console.log(`Found ${users.length} users:\n`);

    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name || 'N/A'}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has password: ${user.password ? 'Yes' : 'No'}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Last login: ${user.lastLoginAt || 'Never'}`);
      console.log('---');
    });

    if (users.length === 0) {
      console.log('\nNo users found in database!');
      console.log('You need to create a user first.');
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
