/**
 * Start test recordings on pairs with best negative funding rates
 */

import { PrismaClient } from '@prisma/client';
import { BybitService } from './src/lib/bybit';
import { FundingPaymentRecorderService, RecordingConfig } from './src/services/funding-payment-recorder.service';

const prisma = new PrismaClient();

async function startBestRecordings() {
  try {
    console.log('🔍 Finding pairs with best negative funding rates...\n');

    // Get latest funding rates from Bybit with negative rates, sorted by most negative
    const opportunities = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'BYBIT',
        fundingRate: {
          lt: 0, // Only negative rates
        },
      },
      orderBy: {
        fundingRate: 'asc', // Most negative first
      },
      take: 5,
      select: {
        symbol: true,
        fundingRate: true,
        nextFundingTime: true,
      },
    });

    if (opportunities.length === 0) {
      console.log('❌ No pairs with negative funding found');
      return;
    }

    console.log(`Found ${opportunities.length} pairs with negative funding:\n`);
    opportunities.forEach((op, i) => {
      console.log(`${i + 1}. ${op.symbol}: ${(op.fundingRate * 100).toFixed(4)}%`);
    });

    console.log('\n🎬 Starting test recordings...\n');

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

    // Start recordings for each pair
    const recordings = [];
    for (const op of opportunities) {
      try {
        // Create BybitService instance
        const bybitService = new BybitService({
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
          userId,
          credentialId: credentials.id,
        });

        // Initialize
        await bybitService.syncTime();

        // Calculate test funding payment time (now + 30 seconds)
        const now = new Date();
        const fundingPaymentTime = new Date(now.getTime() + 30 * 1000);

        // Create recording configuration
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

        // Start recording
        const recorder = await FundingPaymentRecorderService.startRecording(config, bybitService);
        const sessionData = recorder.getSessionData();

        console.log(`✅ ${op.symbol}: Recording started (${(op.fundingRate * 100).toFixed(4)}%)`);
        console.log(`   Session ID: ${sessionData.sessionId}`);
        console.log(`   Funding in: 30 seconds\n`);

        recordings.push({
          symbol: op.symbol,
          sessionId: sessionData.sessionId,
          fundingRate: op.fundingRate,
        });

      } catch (error: any) {
        console.error(`❌ ${op.symbol}: Failed to start - ${error.message}\n`);
      }
    }

    if (recordings.length > 0) {
      console.log(`\n🎉 Started ${recordings.length} test recordings!`);
      console.log('\nRecordings will complete in ~35 seconds...');

      // Wait for recordings to complete
      console.log('\nWaiting for recordings to finish...');
      await new Promise(resolve => setTimeout(resolve, 40000)); // Wait 40 seconds

      console.log('\n📊 Checking results...\n');

      // Check results
      for (const rec of recordings) {
        const session = await prisma.fundingPaymentRecordingSession.findUnique({
          where: { id: rec.sessionId },
          select: {
            status: true,
            totalDataPoints: true,
          },
        });

        const icon = (session?.totalDataPoints || 0) > 0 ? '✅' : '❌';
        console.log(`${icon} ${rec.symbol}: ${session?.totalDataPoints || 0} data points (${session?.status})`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

startBestRecordings();
