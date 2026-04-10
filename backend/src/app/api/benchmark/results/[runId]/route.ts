/**
 * GET /api/benchmark/results/:runId
 *
 * Get detailed analysis for a specific benchmark run.
 * Returns aggregate statistics grouped by exchange and event type,
 * with full percentile distributions.
 *
 * Authentication required. Only ADMIN users can access benchmark data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { analyzeBenchmarkRun } from '@/services/latency-benchmark.service';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Only ADMIN users can view benchmark data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });

    if (dbUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: ADMIN role required' },
        { status: 403 },
      );
    }

    const { runId } = await params;

    const analysis = await analyzeBenchmarkRun(runId);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API Benchmark] Error analyzing benchmark run:', message);

    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status },
    );
  }
}
