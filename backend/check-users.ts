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

  // Check if the logged-in user exists
  console.log('\nNote: Your JWT token contains userId from in-memory auth.');
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
