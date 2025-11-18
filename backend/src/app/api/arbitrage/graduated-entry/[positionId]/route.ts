/**
 * DELETE /api/arbitrage/graduated-entry/[positionId]
 * Delete a graduated entry position (only for ERROR status positions)
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  try {
    const { positionId } = await params;

    console.log(`[API] DELETE request for position: ${positionId}`);

    // Find the position
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId },
    });

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          error: 'Position not found',
        },
        { status: 404 }
      );
    }

    // Only allow deletion of ERROR positions (positions that never opened or failed)
    if (position.status !== 'ERROR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Can only delete positions with ERROR status. Active positions must be closed first.',
        },
        { status: 400 }
      );
    }

    // Verify that no actual positions were opened (safety check)
    if (position.primaryFilledQty > 0 || position.hedgeFilledQty > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete position - trades were executed. Please close positions on exchanges first.',
        },
        { status: 400 }
      );
    }

    // Delete the position from database
    await prisma.graduatedEntryPosition.delete({
      where: { positionId },
    });

    console.log(`[API] Position ${positionId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] Error deleting position:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete position',
      },
      { status: 500 }
    );
  }
}
