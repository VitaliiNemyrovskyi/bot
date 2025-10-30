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
    const body = await request.json();

    // Find and verify message belongs to user
    const message = mockMessages.get(messageId);

    if (!message || message.userId !== authResult.user.userId) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Update message
    if (body.read !== undefined) {
      message.read = body.read;
    }
    mockMessages.set(messageId, message);
    const updatedMessage = message;

    return NextResponse.json({
      id: updatedMessage.id,
      type: updatedMessage.type.toLowerCase(),
      title: updatedMessage.title,
      content: updatedMessage.content,
      timestamp: updatedMessage.createdAt,
      read: updatedMessage.read,
      actions: updatedMessage.actions as any,
      metadata: updatedMessage.metadata as any
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error updating message:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete message
    mockMessages.delete(messageId);

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error deleting message:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}