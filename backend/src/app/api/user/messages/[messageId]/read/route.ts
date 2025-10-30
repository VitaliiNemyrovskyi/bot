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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messageId } = await params;

    // Find and verify message belongs to user
    const message = mockMessages.get(messageId);

    if (!message || message.userId !== authResult.user.userId) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Mark message as read
    message.read = true;
    mockMessages.set(messageId, message);

    return NextResponse.json({ message: 'Message marked as read' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error marking message as read:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}