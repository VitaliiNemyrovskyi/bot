import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOpportunity() {
  const opportunityId = 'cmh1x34wu0008zqjml2iw9382';

  const opportunity = await prisma.triangularArbitrageOpportunity.findUnique({
    where: { id: opportunityId }
  });

  if (!opportunity) {
    console.log('Opportunity not found');
    return;
  }

  console.log('=== Opportunity Details ===');
  console.log('ID:', opportunity.id);
  console.log('Exchange:', opportunity.exchange);
  console.log('Symbol Path:', opportunity.symbol_path);
  console.log('Triangle:', `${opportunity.base_asset} → ${opportunity.quote_asset} → ${opportunity.bridge_asset} → ${opportunity.base_asset}`);
  console.log('Profit %:', opportunity.potential_profit_percent?.toFixed(4) + '%');
  console.log('Position Size:', opportunity.position_size, opportunity.base_asset);
  console.log('Status:', opportunity.status);
  console.log('Created:', opportunity.created_at);
  console.log('');
  console.log('Symbols:');
  console.log('  Symbol 1:', opportunity.symbol1);
  console.log('  Symbol 2:', opportunity.symbol2);
  console.log('  Symbol 3:', opportunity.symbol3);

  await prisma.$disconnect();
}

checkOpportunity().catch(console.error);
