const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get BingX credentials
  const cred = await prisma.exchangeCredentials.findFirst({
    where: {
      userId: 'admin_1',
      exchange: 'BINGX',
      isActive: true,
    },
  });

  if (!cred) {
    console.log('No BingX credentials found');
    await prisma.$disconnect();
    return;
  }

  console.log('BingX Credential ID:', cred.id);

  // Import BingX connector
  const { BingXConnector } = require('./src/connectors/bingx.connector');

  const connector = new BingXConnector(
    cred.apiKey,
    cred.apiSecret,
    false // mainnet
  );

  await connector.initialize();

  // Get all positions
  const positions = await connector.getPositions();

  console.log('\n=== BingX Open Positions ===\n');

  if (!positions || positions.length === 0) {
    console.log('✓ No open positions on BingX');
  } else {
    positions.forEach(p => {
      if (Math.abs(p.size) > 0) {
        console.log(`Symbol: ${p.symbol}`);
        console.log(`  Side: ${p.side}`);
        console.log(`  Size: ${p.size}`);
        console.log(`  Entry Price: ${p.entryPrice}`);
        console.log(`  Unrealized PnL: ${p.unrealizedPnl}`);
        console.log('');
      }
    });
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
