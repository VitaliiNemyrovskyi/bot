import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data store for user preferences
const mockUserPreferences = new Map<string, {
  userId: string;
  language: string;
  theme: string;
  currency: string;
  emailNotifications: boolean;
  priceAlerts: boolean;
  tradingAlerts: boolean;
  pushNotifications: boolean;
  defaultAmount: number;
  riskLevel: string;
  autoTrade: boolean;
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

    // Get user preferences
    let preferences = mockUserPreferences.get(authResult.user.userId);

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = {
        userId: authResult.user.userId,
        language: 'en',
        theme: 'light',
        currency: 'USD',
        emailNotifications: true,
        priceAlerts: true,
        tradingAlerts: true,
        pushNotifications: false,
        defaultAmount: 100,
        riskLevel: 'medium',
        autoTrade: false
      };
      mockUserPreferences.set(authResult.user.userId, preferences);
    }

    // Transform response to match frontend interface
    const response = {
      language: preferences.language,
      theme: preferences.theme,
      currency: preferences.currency,
      notifications: {
        email: preferences.emailNotifications,
        priceAlerts: preferences.priceAlerts,
        tradingAlerts: preferences.tradingAlerts,
        push: preferences.pushNotifications
      },
      trading: {
        defaultAmount: preferences.defaultAmount,
        riskLevel: preferences.riskLevel,
        autoTrade: preferences.autoTrade
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
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

    // Extract preferences data
    const updateData: any = {};

    if (body.language) updateData.language = body.language;
    if (body.theme) updateData.theme = body.theme;
    if (body.currency) updateData.currency = body.currency;

    if (body.notifications) {
      if (body.notifications.email !== undefined) updateData.emailNotifications = body.notifications.email;
      if (body.notifications.priceAlerts !== undefined) updateData.priceAlerts = body.notifications.priceAlerts;
      if (body.notifications.tradingAlerts !== undefined) updateData.tradingAlerts = body.notifications.tradingAlerts;
      if (body.notifications.push !== undefined) updateData.pushNotifications = body.notifications.push;
    }

    if (body.trading) {
      if (body.trading.defaultAmount !== undefined) updateData.defaultAmount = body.trading.defaultAmount;
      if (body.trading.riskLevel) updateData.riskLevel = body.trading.riskLevel;
      if (body.trading.autoTrade !== undefined) updateData.autoTrade = body.trading.autoTrade;
    }

    // Update or create preferences
    let preferences = mockUserPreferences.get(authResult.user.userId);
    if (!preferences) {
      preferences = {
        userId: authResult.user.userId,
        language: 'en',
        theme: 'light',
        currency: 'USD',
        emailNotifications: true,
        priceAlerts: true,
        tradingAlerts: true,
        pushNotifications: false,
        defaultAmount: 100,
        riskLevel: 'medium',
        autoTrade: false,
        ...updateData
      };
    } else {
      preferences = { ...preferences, ...updateData };
    }
    mockUserPreferences.set(authResult.user.userId, preferences);

    // Transform response
    const response = {
      language: preferences.language,
      theme: preferences.theme,
      currency: preferences.currency,
      notifications: {
        email: preferences.emailNotifications,
        priceAlerts: preferences.priceAlerts,
        tradingAlerts: preferences.tradingAlerts,
        push: preferences.pushNotifications
      },
      trading: {
        defaultAmount: preferences.defaultAmount,
        riskLevel: preferences.riskLevel,
        autoTrade: preferences.autoTrade
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}