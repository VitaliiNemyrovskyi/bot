/**
 * GET /api/kucoin/ws-token
 * Get KuCoin WebSocket connection token (public endpoint)
 *
 * This endpoint proxies the KuCoin token request to avoid CORS issues in the frontend
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('[KuCoin WS Token] Fetching WebSocket token from KuCoin API...');

    const response = await fetch('https://api-futures.kucoin.com/api/v1/bullet-public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KuCoin WS Token] API error:', errorText);
      return NextResponse.json(
        { success: false, error: `KuCoin API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.code !== '200000' || !data.data) {
      console.error('[KuCoin WS Token] Invalid response:', data);
      return NextResponse.json(
        { success: false, error: data.msg || 'Failed to get WebSocket token' },
        { status: 400 }
      );
    }

    console.log('[KuCoin WS Token] Successfully fetched token');

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error: any) {
    console.error('[KuCoin WS Token] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch WebSocket token' },
      { status: 500 }
    );
  }
}
