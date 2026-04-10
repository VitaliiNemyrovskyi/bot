/**
 * GET /api/benchmark/results
 *
 * List all benchmark runs with summary statistics.
 * Supports pagination and filtering by date range or settlement time.
 *
 * Authentication required. Only ADMIN users can access benchmark data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const since = searchParams.get('since');
    const until = searchParams.get('until');

    const where: Record<string, unknown> = {};
    if (since || until) {
      const startedAt: Record<string, Date> = {};
      if (since) {
        startedAt['gte'] = new Date(since);
      }
      if (until) {
        startedAt['lte'] = new Date(until);
      }
      where['startedAt'] = startedAt;
    }

    const [runs, total] = await Promise.all([
      prisma.benchmarkRun.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          runLabel: true,
          startedAt: true,
          completedAt: true,
          durationMs: true,
          exchanges: true,
          symbols: true,
          settlementTime: true,
          windowSeconds: true,
          totalEvents: true,
          errorCount: true,
          createdAt: true,
        },
      }),
      prisma.benchmarkRun.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        runs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API Benchmark] Error listing benchmark runs:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
