import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking users in database...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  console.log(`Found ${users.length} users:\n`);
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created: ${user.createdAt}`);
    console.log('---');
  });

  // Update first user to admin if needed
  if (users.length > 0 && users[0].role !== 'admin') {
    console.log(`\n🔧 Updating ${users[0].email} to admin role...`);

    const updated = await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'admin' }
    });

    console.log(`✅ Successfully updated ${updated.email} to role: ${updated.role}\n`);
    console.log('🔄 Please refresh your browser (Ctrl+Shift+R) to see the Recordings link!\n');
  } else if (users.length > 0 && users[0].role === 'admin') {
    console.log(`\n✅ User ${users[0].email} is already an admin\n`);
    console.log('If you dont see the Recordings link, please refresh your browser (Ctrl+Shift+R)\n');
  }

  // Check if the logged-in user exists
  console.log('Note: Your JWT token contains userId from in-memory auth.');
  console.log('You need to log in with a user that exists in the database.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
