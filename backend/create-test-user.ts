import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser.id);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionActive: true,
        googleLinked: false,
      }
    });

    console.log('Test user created successfully:', user.id);
    console.log('Email: admin@test.com');
    console.log('Password: password123');

    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
