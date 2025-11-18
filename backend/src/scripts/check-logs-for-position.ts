import prisma from '../lib/prisma';

async function checkLogs() {
  try {
    // Get monitoring logs for this position
    const logs = await prisma.positionMonitoringLog.findMany({
      where: {
        positionId: 'arb_1_1761815638197'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 30
    });

    console.log(`\nFound ${logs.length} monitoring logs for position arb_1_1761815638197:\n`);
    console.log('═'.repeat(120));

    logs.forEach((log, index) => {
      console.log(`\n[${index + 1}] ${log.timestamp.toLocaleString()}`);
      console.log(`Event: ${log.eventType}`);
      console.log(`Message: ${log.message}`);
      if (log.metadata) {
        console.log('Metadata:', JSON.stringify(log.metadata, null, 2));
      }
      console.log('─'.repeat(120));
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogs();
