import prisma from '../lib/prisma';
import { BingXService } from '../lib/bingx';

async function checkBingXFunding() {
  try {
    // Get BingX credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BINGX',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!credentials) {
      console.log('No BingX credentials found');
      return;
    }

    console.log(`Using BingX credentials: ${credentials.label || credentials.id}\n`);

    // Create BingX service
    const bingx = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId: credentials.userId,
      credentialId: credentials.id,
    });

    await bingx.syncTime();

    // Try different symbol formats
    const symbols = ['ENSO-USDT', 'ENSOUSDT'];

    for (const symbol of symbols) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Checking symbol: ${symbol}`);
      console.log('='.repeat(80));

      // Get income history (funding fees)
      console.log('\n--- FUNDING FEE HISTORY ---');
      const fundingHistory = await bingx.getIncomeHistory({
        symbol,
        incomeType: 'FUNDING_FEE',
        limit: 50,
      });

      console.log(`Response code: ${fundingHistory.code}, msg: "${fundingHistory.msg}"`);
      console.log(`Records count: ${fundingHistory.data?.length || 0}\n`);

      if (fundingHistory.data && fundingHistory.data.length > 0) {
        console.log('Found funding payments:');
        fundingHistory.data.forEach((payment: any, index: number) => {
          const paymentTime = new Date(payment.time);
          console.log(`\n[${index + 1}] Time: ${paymentTime.toISOString()}`);
          console.log(`    Symbol: ${payment.symbol}`);
          console.log(`    Income: ${payment.income} USDT`);
          console.log(`    Type: ${payment.incomeType}`);
        });
      } else {
        console.log('No funding payments found');
      }

      // Get all income types
      console.log('\n--- ALL INCOME TYPES ---');
      const allIncome = await bingx.getIncomeHistory({
        symbol,
        // No incomeType filter - get all types
        limit: 50,
      });

      console.log(`Response code: ${allIncome.code}, msg: "${allIncome.msg}"`);
      console.log(`Records count: ${allIncome.data?.length || 0}\n`);

      if (allIncome.data && allIncome.data.length > 0) {
        console.log('All income records:');
        allIncome.data.forEach((income: any, index: number) => {
          const incomeTime = new Date(income.time);
          console.log(`\n[${index + 1}] Time: ${incomeTime.toISOString()}`);
          console.log(`    Symbol: ${income.symbol}`);
          console.log(`    Income: ${income.income} USDT`);
          console.log(`    Type: ${income.incomeType}`);
          if (income.tradeId) console.log(`    Trade ID: ${income.tradeId}`);
        });
      } else {
        console.log('No income records found');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBingXFunding();
