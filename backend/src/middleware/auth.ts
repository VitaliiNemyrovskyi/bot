import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const user = await AuthService.getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Add user to request context (this would need to be implemented with a proper context system)
  return NextResponse.next();
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await AuthService.getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Pass user to the handler
    return handler(request, { ...context, user });
  };
}

export function requireRole(roles: string[]) {
  return function (handler: Function) {
    return async (request: NextRequest, context: any) => {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }

      const user = await AuthService.getUserFromToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      return handler(request, { ...context, user });
    };
  };
}

export async function validateUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await AuthService.getUserFromToken(token);
  return user;
}
