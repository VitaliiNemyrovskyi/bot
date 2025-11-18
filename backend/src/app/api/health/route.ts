import { NextRequest, NextResponse } from 'next/server';
import { redisService } from '@/lib/redis';

/**
 * Health Check Endpoint
 * Returns the status of critical backend services
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check Redis connection
    const redisStatus = redisService.isReady() ? 'connected' : 'disconnected';

    // Check database connection (Prisma)
    let dbStatus = 'unknown';
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (dbError: any) {
      dbStatus = `error: ${dbError.message}`;
    }

    // Calculate uptime
    const uptime = process.uptime();
    const responseTime = Date.now() - startTime;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      uptimeSeconds: uptime,
      responseTime: `${responseTime}ms`,
      services: {
        redis: redisStatus,
        database: dbStatus,
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      },
      nodejs: process.version,
    };

    // Return 503 if critical services are down
    const isHealthy = dbStatus === 'connected';

    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
