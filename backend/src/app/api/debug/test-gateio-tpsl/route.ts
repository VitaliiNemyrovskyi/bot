/**
 * DEBUG: Test Gate.io TP/SL directly
 */

import { NextRequest, NextResponse } from 'next/server';
import { GateIOConnector } from '@/connectors/gateio.connector';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import prisma from '@/lib/prisma';

export async function POST(_request: NextRequest) {
  const logs: string[] = [];

  try {
    logs.push('Testing Gate.io TP/SL directly...');

    // Get position from DB to get credentials
    const position = await prisma.graduatedEntryPosition.findFirst({
      where: { positionId: 'arb_1_1761396931747' }
    });

    if (!position) {
      return NextResponse.json({ success: false, error: 'Position not found in DB', logs });
    }

    logs.push(`Position found: ${position.hedgeExchange}`);

    // Get credentials
    const cred = await ExchangeCredentialsService.getCredentialById(
      position.userId,
      position.hedgeCredentialId
    );

    if (!cred) {
      return NextResponse.json({ success: false, error: 'Credentials not found', logs });
    }

    logs.push('Credentials loaded');

    // Create connector
    const connector = new GateIOConnector(cred.apiKey, cred.apiSecret);
    await connector.initialize();
    logs.push('Connector initialized');

    // Get current position
    const gatePosition = await connector.getPosition(position.symbol);
    logs.push(`Current position: size=${gatePosition?.size}, entryPrice=${gatePosition?.entry_price}`);

    if (!gatePosition || gatePosition.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'No position on Gate.io',
        logs,
        position: gatePosition
      });
    }

    // Try to set TP/SL with test values appropriate for position direction
    logs.push('Attempting to set TP/SL...');

    const isShort = gatePosition.size < 0;
    const entryPrice = parseFloat(gatePosition.entry_price);

    // Use simple test prices that are clearly valid multiples
    // For SHORT: TP below entry, SL above entry
    // For LONG: TP above entry, SL below entry
    const takeProfit = isShort ? 0.019 : 0.021;  // Simple prices
    const stopLoss = isShort ? 0.021 : 0.019;     // Simple prices

    logs.push(`Position: ${isShort ? 'SHORT' : 'LONG'}, Entry: ${entryPrice}, TP: ${takeProfit}, SL: ${stopLoss}`);

    // Convert hedgeSide to OrderSide ('Buy' | 'Sell')
    const orderSide = position.hedgeSide === 'long' ? 'Buy' as const : 'Sell' as const;
    logs.push(`Converting hedgeSide '${position.hedgeSide}' to OrderSide '${orderSide}'`);

    const result = await connector.setTradingStop({
      symbol: position.symbol,
      side: orderSide,
      takeProfit,
      stopLoss,
    });

    logs.push(`✅ Success! Result: ${JSON.stringify(result)}`);

    return NextResponse.json({
      success: true,
      logs,
      result,
      position: {
        size: gatePosition.size,
        entryPrice: gatePosition.entry_price,
      }
    });

  } catch (error: any) {
    logs.push(`❌ Error: ${error.message}`);
    logs.push(`Stack: ${error.stack}`);

    return NextResponse.json({
      success: false,
      logs,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
