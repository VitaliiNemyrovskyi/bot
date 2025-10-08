import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data store for notification settings
const mockNotificationSettings = new Map<string, {
  userId: string;
  email: boolean;
  push: boolean;
  priceAlerts: boolean;
  tradingAlerts: boolean;
  securityAlerts: boolean;
  marketUpdates: boolean;
  portfolioReports: boolean;
}>();

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

    // Get user notification settings
    let settings = mockNotificationSettings.get(authResult.user.userId);

    // If no settings exist, create default ones
    if (!settings) {
      settings = {
        userId: authResult.user.userId,
        email: true,
        push: true,
        priceAlerts: true,
        tradingAlerts: true,
        securityAlerts: true,
        marketUpdates: false,
        portfolioReports: false
      };
      mockNotificationSettings.set(authResult.user.userId, settings);
    }

    // Transform response to match frontend interface
    const response = {
      email: settings.email,
      push: settings.push,
      priceAlerts: settings.priceAlerts,
      tradingAlerts: settings.tradingAlerts,
      securityAlerts: settings.securityAlerts,
      marketUpdates: settings.marketUpdates,
      portfolioReports: settings.portfolioReports
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Extract notification settings
    const updateData: any = {};

    if (body.email !== undefined) updateData.email = body.email;
    if (body.push !== undefined) updateData.push = body.push;
    if (body.priceAlerts !== undefined) updateData.priceAlerts = body.priceAlerts;
    if (body.tradingAlerts !== undefined) updateData.tradingAlerts = body.tradingAlerts;
    if (body.securityAlerts !== undefined) updateData.securityAlerts = body.securityAlerts;
    if (body.marketUpdates !== undefined) updateData.marketUpdates = body.marketUpdates;
    if (body.portfolioReports !== undefined) updateData.portfolioReports = body.portfolioReports;

    // Update or create notification settings
    let settings = mockNotificationSettings.get(authResult.user.userId);
    if (!settings) {
      settings = {
        userId: authResult.user.userId,
        email: true,
        push: true,
        priceAlerts: true,
        tradingAlerts: true,
        securityAlerts: true,
        marketUpdates: false,
        portfolioReports: false,
        ...updateData
      };
    } else {
      settings = { ...settings, ...updateData };
    }
    mockNotificationSettings.set(authResult.user.userId, settings);

    // Transform response
    const response = {
      email: settings.email,
      push: settings.push,
      priceAlerts: settings.priceAlerts,
      tradingAlerts: settings.tradingAlerts,
      securityAlerts: settings.securityAlerts,
      marketUpdates: settings.marketUpdates,
      portfolioReports: settings.portfolioReports
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}