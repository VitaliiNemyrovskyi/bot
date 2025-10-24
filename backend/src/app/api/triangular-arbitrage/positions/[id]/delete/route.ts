import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/triangular-arbitrage/positions/[id]/delete
 * Delete a triangular arbitrage position from history
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.userId;

    const positionId = params.id;

    console.log('[TriArb Delete] Deleting position:', {
      positionId,
      userId,
    });

    // Verify the position belongs to this user
    const position = await prisma.triangularArbitragePosition.findUnique({
      where: {
        positionId: positionId,
      },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    if (position.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - position belongs to another user' },
        { status: 403 }
      );
    }

    // Don't allow deletion of active positions
    if (['EXECUTING_LEG1', 'EXECUTING_LEG2', 'EXECUTING_LEG3'].includes(position.status)) {
      return NextResponse.json(
        { error: 'Cannot delete an active position. Cancel it first.' },
        { status: 400 }
      );
    }

    // Delete the position
    await prisma.triangularArbitragePosition.delete({
      where: {
        positionId: positionId,
      },
    });

    console.log('[TriArb Delete] Position deleted successfully:', positionId);

    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully',
    });
  } catch (error: any) {
    console.error('[TriArb Delete] Error deleting position:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete position' },
      { status: 500 }
    );
  }
}
