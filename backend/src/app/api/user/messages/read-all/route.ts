import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data store for messages
const mockMessages = new Map<string, {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
  actions?: any;
  metadata?: any;
}>();

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

    // Mark all user's messages as read
    let updatedCount = 0;
    for (const [messageId, message] of mockMessages) {
      if (message.userId === authResult.user.userId && !message.read) {
        message.read = true;
        mockMessages.set(messageId, message);
        updatedCount++;
      }
    }
    const result = { count: updatedCount };

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