import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MessageType, Message } from '@prisma/client';

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

    // Get messages from database
    const [messages, totalCount, unreadCount] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { userId: authResult.user.userId },
      }),
      prisma.message.count({
        where: { userId: authResult.user.userId, read: false },
      }),
    ]);

    // Transform response to match frontend interface
    const transformedMessages = messages.map((message: Message) => ({
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

    // Validate message type
    const messageType = type.toUpperCase() as MessageType;
    if (!Object.values(MessageType).includes(messageType)) {
      return NextResponse.json(
        { error: 'Invalid message type. Must be one of: INFO, WARNING, SUCCESS, ERROR, TRADE' },
        { status: 400 }
      );
    }

    // Create new message in database
    const message = await prisma.message.create({
      data: {
        userId: authResult.user.userId,
        type: messageType,
        title,
        content,
        read: false,
        actions: actions || null,
        metadata: metadata || null,
      },
    });

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