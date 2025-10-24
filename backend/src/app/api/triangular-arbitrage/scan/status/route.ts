import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { OpportunityDetectionService } from '@/services/triangular-arbitrage-opportunity.service';

/**
 * GET /api/triangular-arbitrage/scan/status
 * Get current scanner status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.userId;

    // Get all scanner instances for this user (supports multiple exchanges)
    const scanners = OpportunityDetectionService.getAllInstancesForUser(userId);

    if (scanners.length === 0) {
      // No scanners running
      return NextResponse.json({
        success: true,
        isScanning: false,
        scanners: [],
        stats: {
          opportunitiesDetectedToday: 0,
          totalProfitToday: 0,
          runningFor: 0,
          trianglesMonitored: 0,
        },
      });
    }

    // Return status for all active scanners
    const scannersStatus = scanners.map(scanner => {
      const status = scanner.getStatus();
      return {
        exchange: status.config.exchange,
        isScanning: status.isScanning,
        config: status.config,
        stats: status.stats,
      };
    });

    return NextResponse.json({
      success: true,
      isScanning: true,
      scanners: scannersStatus,
      // Aggregate stats across all scanners
      stats: {
        opportunitiesDetectedToday: scanners.reduce((sum, s) => sum + s.getStatus().stats.opportunitiesDetectedToday, 0),
        totalProfitToday: scanners.reduce((sum, s) => sum + s.getStatus().stats.totalProfitToday, 0),
        runningFor: Math.max(...scanners.map(s => s.getStatus().stats.runningFor)),
        trianglesMonitored: scanners.reduce((sum, s) => sum + s.getStatus().stats.trianglesMonitored, 0),
      },
    });
  } catch (error: any) {
    console.error('[TriArb] Error getting scanner status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get scanner status' },
      { status: 500 }
    );
  }
}
