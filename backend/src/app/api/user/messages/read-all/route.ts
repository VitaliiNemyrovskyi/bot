import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark all user's messages as read in database
    const result = await prisma.message.updateMany({
      where: {
        userId: authResult.user.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      message: 'All messages marked as read',
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}