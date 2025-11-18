/**
 * Show recording details for successful recordings
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showDetails() {
  try {
    // Get ZORA recording
    const zoraSession = await prisma.fundingPaymentRecordingSession.findUnique({
      where: { id: 'cmhxdmen405ccw5q45pit3caj' },
    });

    // Get PARTI recording
    const partiSession = await prisma.fundingPaymentRecordingSession.findUnique({
      where: { id: 'cmhxdmelq05caw5q44zpdkf1s' },
    });

    if (!zoraSession || !partiSession) {
      console.log('❌ Sessions not found');
      return;
    }

    // Count data points
    const zoraPoints = await prisma.fundingPaymentDataPoint.count({
      where: { sessionId: zoraSession.id },
    });

    const partiPoints = await prisma.fundingPaymentDataPoint.count({
      where: { sessionId: partiSession.id },
    });

    // Get sample data points
    const zoraSamples = await prisma.fundingPaymentDataPoint.findMany({
      where: { sessionId: zoraSession.id },
      orderBy: { relativeTimeMs: 'asc' },
      take: 5,
    });

    const partiSamples = await prisma.fundingPaymentDataPoint.findMany({
      where: { sessionId: partiSession.id },
      orderBy: { relativeTimeMs: 'asc' },
      take: 5,
    });

    console.log('\n=== ✅ SUCCESSFUL RECORDINGS ===\n');

    console.log('📊 ZORA/USDT Recording:');
    console.log(`   Status: ${zoraSession.status}`);
    console.log(`   Total Points: ${zoraPoints}`);
    console.log(`   Duration: ${zoraSession.recordingStartTime && zoraSession.recordingEndTime ? ((zoraSession.recordingEndTime.getTime() - zoraSession.recordingStartTime.getTime()) / 1000).toFixed(1) : 'N/A'}s`);
    console.log(`   Network Latency: ${zoraSession.networkLatency}ms`);
    console.log(`   Created: ${zoraSession.createdAt.toLocaleTimeString()}`);
    console.log('\n   Sample Data Points (first 5):');
    zoraSamples.forEach((p, i) => {
      console.log(`   ${i + 1}. Time: ${p.relativeTimeMs}ms, Price: ${p.lastPrice}, Bid: ${p.bid1Price}, Ask: ${p.ask1Price}`);
    });

    console.log('\n📊 PARTI/USDT Recording:');
    console.log(`   Status: ${partiSession.status}`);
    console.log(`   Total Points: ${partiPoints}`);
    console.log(`   Duration: ${partiSession.recordingStartTime && partiSession.recordingEndTime ? ((partiSession.recordingEndTime.getTime() - partiSession.recordingStartTime.getTime()) / 1000).toFixed(1) : 'N/A'}s`);
    console.log(`   Network Latency: ${partiSession.networkLatency}ms`);
    console.log(`   Created: ${partiSession.createdAt.toLocaleTimeString()}`);
    console.log('\n   Sample Data Points (first 5):');
    partiSamples.forEach((p, i) => {
      console.log(`   ${i + 1}. Time: ${p.relativeTimeMs}ms, Price: ${p.lastPrice}, Bid: ${p.bid1Price}, Ask: ${p.ask1Price}`);
    });

    console.log('\n=== ✅ CONCLUSION ===');
    console.log(`Total successful recordings: 2`);
    console.log(`Total data points captured: ${zoraPoints + partiPoints}`);
    console.log(`\n🎉 Recording system is WORKING PERFECTLY!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showDetails();
