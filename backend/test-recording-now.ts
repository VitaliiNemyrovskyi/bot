/**
 * Test recording system with 2 pairs RIGHT NOW to verify it works
 */

import { PrismaClient } from '@prisma/client';
import { BybitService } from './src/lib/bybit';
import { FundingPaymentRecorderService, RecordingConfig } from './src/services/funding-payment-recorder.service';

const prisma = new PrismaClient();

async function testRecordingNow() {
  try {
    console.log('🧪 Testing recording system NOW...\n');

    // Get 2 pairs with best negative funding
    const opportunities = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'BYBIT',
        fundingRate: {
          lt: 0,
        },
      },
      orderBy: {
        fundingRate: 'asc',
      },
      take: 2,
    });

    if (opportunities.length === 0) {
      console.log('❌ No pairs with negative funding found');
      return;
    }

    console.log(`Found ${opportunities.length} pairs:\n`);
    opportunities.forEach((op, i) => {
      console.log(`${i + 1}. ${op.symbol}: ${(op.fundingRate * 100).toFixed(4)}%`);
    });

    console.log('\n🎬 Starting TEST recordings (30 second timer)...\n');

    // Get user credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BYBIT',
        isActive: true,
      },
    });

    if (!credentials) {
      console.log('❌ No Bybit credentials found');
      return;
    }

    const userId = credentials.userId;

    // Start recordings
    const recordings = [];
    for (const op of opportunities) {
      try {
        const bybitService = new BybitService({
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
          userId,
          credentialId: credentials.id,
        });

        await bybitService.syncTime();

        // TEST: 30 seconds from now
        const now = new Date();
        const fundingPaymentTime = new Date(now.getTime() + 30 * 1000);

        const config: RecordingConfig = {
          userId,
          symbol: op.symbol,
          exchange: 'BYBIT',
          fundingRate: op.fundingRate,
          fundingPaymentTime,
          fundingInterval: 8,
          preRecordingSeconds: 5,
          postRecordingSeconds: 30,
        };

        const recorder = await FundingPaymentRecorderService.startRecording(config, bybitService);
        const sessionData = recorder.getSessionData();

        console.log(`✅ ${op.symbol}: Recording started`);
        console.log(`   Session ID: ${sessionData.sessionId}`);
        console.log(`   Funding in: 30 seconds\n`);

        recordings.push({
          symbol: op.symbol,
          sessionId: sessionData.sessionId,
        });

      } catch (error: any) {
        console.error(`❌ ${op.symbol}: Failed - ${error.message}\n`);
      }
    }

    if (recordings.length > 0) {
      console.log(`\n🎉 Started ${recordings.length} test recordings!`);
      console.log('\n⏳ Waiting 40 seconds for recordings to complete...\n');

      await new Promise(resolve => setTimeout(resolve, 40000));

      console.log('📊 Checking results...\n');

      for (const rec of recordings) {
        const session = await prisma.fundingPaymentRecordingSession.findUnique({
          where: { id: rec.sessionId },
          select: {
            status: true,
            totalDataPoints: true,
          },
        });

        const icon = (session?.totalDataPoints || 0) > 0 ? '✅' : '❌';
        console.log(`${icon} ${rec.symbol}: ${session?.totalDataPoints || 0} points (${session?.status})`);
      }

      console.log('\n=== TEST RESULT ===');
      const successCount = recordings.filter(async (rec) => {
        const session = await prisma.fundingPaymentRecordingSession.findUnique({
          where: { id: rec.sessionId },
        });
        return (session?.totalDataPoints || 0) > 0;
      });

      if (recordings.length === 2 && recordings.every(async (rec) => {
        const session = await prisma.fundingPaymentRecordingSession.findUnique({
          where: { id: rec.sessionId },
        });
        return (session?.totalDataPoints || 0) > 0;
      })) {
        console.log('✅ Recording system works PERFECTLY!');
        console.log('✅ Ready for REAL funding payment recording at 19:00');
      } else {
        console.log('⚠️  Some recordings failed, check logs above');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRecordingNow();
