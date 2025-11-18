import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSetAdminRole() {
  // Get the user (assuming this is your user from the recordings)
  const userId = 'cmhei0kew0000w50wbl1bxhcf'; // Your userId from earlier check

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    }
  });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  console.log('\n👤 Current user:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);

  if (user.role !== 'ADMIN') {
    console.log('\n🔧 Updating role to ADMIN...');
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    });
    console.log('✅ Role updated to ADMIN!');
  } else {
    console.log('\n✅ Already an ADMIN!');
  }

  await prisma.$disconnect();
}

checkAndSetAdminRole().catch(console.error);
