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

// Generate mock messages for demo
function generateMockId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function GET(request: NextRequest) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId: authResult.user.userId
    };

    if (unreadOnly) {
      whereClause.read = false;
    }

    // Get messages from mock data
    const allUserMessages = Array.from(mockMessages.values())
      .filter(msg => msg.userId === authResult.user.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const filteredMessages = unreadOnly
      ? allUserMessages.filter(msg => !msg.read)
      : allUserMessages;

    const messages = filteredMessages.slice(skip, skip + limit);
    const totalCount = allUserMessages.length;
    const unreadCount = allUserMessages.filter(msg => !msg.read).length;

    // Transform response to match frontend interface
    const transformedMessages = messages.map(message => ({
      id: message.id,
      type: message.type.toLowerCase(),
      title: message.title,
      content: message.content,
      timestamp: message.createdAt,
      read: message.read,
      actions: message.actions as any,
      metadata: message.metadata as any
    }));

    return NextResponse.json({
      messages: transformedMessages,
      total: totalCount,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, title, content, actions, metadata } = await request.json();

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Type, title, and content are required' },
        { status: 400 }
      );
    }

    // Create new message
    const messageId = generateMockId();
    const message = {
      id: messageId,
      userId: authResult.user.userId,
      type: type.toUpperCase(),
      title,
      content,
      read: false,
      createdAt: new Date(),
      actions: actions || null,
      metadata: metadata || null
    };
    mockMessages.set(messageId, message);

    // Transform response
    const response = {
      id: message.id,
      type: message.type.toLowerCase(),
      title: message.title,
      content: message.content,
      timestamp: message.createdAt,
      read: message.read,
      actions: message.actions as any,
      metadata: message.metadata as any
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}