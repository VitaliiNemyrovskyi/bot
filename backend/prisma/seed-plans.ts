import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds the Subscription table with the catalog of available billing plans.
 * Run with: npx tsx backend/prisma/seed-plans.ts
 */
async function main() {
  console.log('Seeding subscription plans...');

  const plans = [
    {
      name: 'Premium Monthly',
      description: 'Full access to funding-rate and price arbitrage strategies, billed monthly.',
      price: 29,
      duration: 30,
      features: [
        'Funding rate arbitrage',
        'Price arbitrage / graduated entry',
        'Unlimited exchange connections',
        'Priority support'
      ],
      role: Role.PREMIUM,
      isActive: true
    },
    {
      name: 'Premium Yearly',
      description: 'Full access to funding-rate and price arbitrage strategies, billed annually (2 months free).',
      price: 290,
      duration: 365,
      features: [
        'Funding rate arbitrage',
        'Price arbitrage / graduated entry',
        'Unlimited exchange connections',
        'Priority support',
        '2 months free vs monthly'
      ],
      role: Role.PREMIUM,
      isActive: true
    }
  ];

  for (const plan of plans) {
    const result = await prisma.subscription.upsert({
      where: { name: plan.name },
      update: {
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features,
        role: plan.role,
        isActive: plan.isActive
      },
      create: plan
    });
    console.log(`  ✓ ${result.name} ($${result.price} / ${result.duration}d)`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error('Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
