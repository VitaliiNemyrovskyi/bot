/**
 * API Route: Export Recording Data
 *
 * GET /api/funding-payment/recordings/[sessionId]/export?format=json|csv
 * Export recorded data points to JSON or CSV format
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/funding-payment/recordings/[sessionId]/export
 * Export recording data in JSON or CSV format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Authenticate user
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const { sessionId } = params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "json" or "csv"' },
        { status: 400 }
      );
    }

    // Fetch session from database
    const recording = await prisma.fundingPaymentRecordingSession.findUnique({
      where: { id: sessionId },
      include: {
        dataPoints: {
          orderBy: { relativeTimeMs: 'asc' },
        },
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (recording.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this recording session' },
        { status: 403 }
      );
    }

    // Check if recording is completed
    if (recording.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Recording is not completed yet. Only completed recordings can be exported.' },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = new Date(recording.fundingPaymentTime).toISOString().replace(/[:.]/g, '-');
    const filename = `recording_${recording.symbol}_${timestamp}.${format}`;

    // Export as JSON
    if (format === 'json') {
      const exportData = {
        metadata: {
          sessionId: recording.id,
          symbol: recording.symbol,
          exchange: recording.exchange,
          fundingRate: recording.fundingRate,
          fundingPaymentTime: recording.fundingPaymentTime,
          fundingInterval: recording.fundingInterval,
          preRecordingSeconds: recording.preRecordingSeconds,
          postRecordingSeconds: recording.postRecordingSeconds,
          totalDataPoints: recording.totalDataPoints,
          status: recording.status,
          createdAt: recording.createdAt,
          startedAt: recording.startedAt,
          completedAt: recording.completedAt,
        },
        timeSync: {
          bybitServerTime: recording.bybitServerTime,
          localTime: recording.localTime,
          networkLatencyMs: recording.networkLatencyMs,
          timeSyncAccuracy: recording.timeSyncAccuracy,
        },
        analytics: {
          priceDropPercent: recording.priceDropPercent,
          priceDropStartTimeMs: recording.priceDropStartTimeMs,
          priceDropDuration: recording.priceDropDuration,
          maxPriceDropPercent: recording.maxPriceDropPercent,
          priceRecoveryTimeMs: recording.priceRecoveryTimeMs,
          optimalEntryTimeMs: recording.optimalEntryTimeMs,
          optimalEntryPrice: recording.optimalEntryPrice,
          optimalTakeProfitPrice: recording.optimalTakeProfitPrice,
        },
        dataPoints: recording.dataPoints.map(dp => ({
          bybitTimestamp: dp.bybitTimestamp.toString(),
          localTimestamp: dp.localTimestamp.toString(),
          relativeTimeMs: dp.relativeTimeMs,
          lastPrice: dp.lastPrice,
          markPrice: dp.markPrice,
          indexPrice: dp.indexPrice,
          bid1Price: dp.bid1Price,
          ask1Price: dp.ask1Price,
          bidAskSpread: dp.bidAskSpread,
          volume24h: dp.volume24h,
          turnover24h: dp.turnover24h,
          openInterest: dp.openInterest,
          bid1Size: dp.bid1Size,
          ask1Size: dp.ask1Size,
          updateType: dp.updateType,
          sequence: dp.sequence?.toString(),
        })),
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Export as CSV
    if (format === 'csv') {
      // Build CSV header
      const headers = [
        'bybitTimestamp',
        'localTimestamp',
        'relativeTimeMs',
        'lastPrice',
        'markPrice',
        'indexPrice',
        'bid1Price',
        'ask1Price',
        'bidAskSpread',
        'volume24h',
        'turnover24h',
        'openInterest',
        'bid1Size',
        'ask1Size',
        'updateType',
        'sequence',
      ];

      // Build CSV rows
      const rows = recording.dataPoints.map(dp => [
        dp.bybitTimestamp.toString(),
        dp.localTimestamp.toString(),
        dp.relativeTimeMs,
        dp.lastPrice,
        dp.markPrice ?? '',
        dp.indexPrice ?? '',
        dp.bid1Price ?? '',
        dp.ask1Price ?? '',
        dp.bidAskSpread ?? '',
        dp.volume24h ?? '',
        dp.turnover24h ?? '',
        dp.openInterest ?? '',
        dp.bid1Size ?? '',
        dp.ask1Size ?? '',
        dp.updateType ?? '',
        dp.sequence?.toString() ?? '',
      ]);

      // Generate CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown format' }, { status: 500 });

  } catch (error: any) {
    console.error('[GET /recordings/:id/export] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export recording' },
      { status: 500 }
    );
  }
}
