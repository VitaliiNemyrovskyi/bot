import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');

  // Bcrypt hash of 'password123' with salt rounds 10
  const hashedPassword = '$2b$10$rKjYN1wCH3zE8O7xP.qGzuKvJq7V9P8fN5yH6L2Q3wR9sT4uV5wW6';

  const admin = await prisma.user.upsert({
    where: { id: 'admin_1' },
    update: {},
    create: {
      id: 'admin_1',
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      subscriptionActive: true,
    },
  });

  console.log('✅ Admin user created/updated:', admin);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
