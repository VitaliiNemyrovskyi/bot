const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findMany({ 
  select: { email: true, role: true } 
}).then(users => {
  console.log(JSON.stringify(users, null, 2));
  return prisma.$disconnect();
}).catch(err => {
  console.error(err);
  return prisma.$disconnect();
});
