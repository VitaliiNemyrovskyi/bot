/**
 * API Endpoint: Liquidation Price Calculation
 *
 * POST /api/liquidation/calculate
 *
 * Calculates liquidation price and proximity for crypto futures positions.
 * This is a CRITICAL SAFETY FEATURE to help users avoid liquidations.
 *
 * Request body:
 * - entryPrice: number (required) - Position entry price
 * - currentPrice: number (optional) - Current market price for proximity calculation
 * - leverage: number (required) - Leverage multiplier (1-125)
 * - side: 'long' | 'short' (required) - Position direction
 * - exchange: 'BYBIT' | 'BINGX' (required) - Exchange name
 * - maintenanceMarginRate: number (optional) - Custom MMR (0.001-0.1)
 * - positionSize: number (optional) - Position size for advanced calculation
 * - initialMargin: number (optional) - Initial margin for advanced calculation
 * - extraMargin: number (optional) - Extra margin added
 *
 * Response:
 * - liquidationPrice: number - Calculated liquidation price
 * - proximity: object (if currentPrice provided) - Proximity analysis
 *   - isInDanger: boolean - True if within 10% of liquidation
 *   - proximityRatio: number - 0.0-1.0+ ratio to liquidation
 *   - message: string - Human-readable status
 * - mmr: number - Maintenance margin rate used
 * - formula: string - Formula used for calculation
 * - warnings: string[] - Any warnings about the calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  liquidationCalculatorService,
  LiquidationCalculationParams,
} from '@/services/liquidation-calculator.service';

interface CalculateLiquidationRequest {
  entryPrice: number;
  currentPrice?: number;
  leverage: number;
  side: 'long' | 'short';
  exchange: 'BYBIT' | 'BINGX';
  maintenanceMarginRate?: number;
  positionSize?: number;
  initialMargin?: number;
  extraMargin?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateLiquidationRequest = await request.json();

    // Validate required fields
    if (!body.entryPrice || body.entryPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid entryPrice. Must be greater than 0.' },
        { status: 400 }
      );
    }

    if (!body.leverage || body.leverage < 1 || body.leverage > 125) {
      return NextResponse.json(
        { error: 'Invalid leverage. Must be between 1 and 125.' },
        { status: 400 }
      );
    }

    if (!body.side || !['long', 'short'].includes(body.side)) {
      return NextResponse.json(
        { error: 'Invalid side. Must be "long" or "short".' },
        { status: 400 }
      );
    }

    if (!body.exchange || !['BYBIT', 'BINGX'].includes(body.exchange)) {
      return NextResponse.json(
        { error: 'Invalid exchange. Must be "BYBIT" or "BINGX".' },
        { status: 400 }
      );
    }

    // Build calculation parameters
    const params: LiquidationCalculationParams = {
      entryPrice: body.entryPrice,
      leverage: body.leverage,
      side: body.side,
      exchange: body.exchange,
      maintenanceMarginRate: body.maintenanceMarginRate,
      positionSize: body.positionSize,
      initialMargin: body.initialMargin,
      extraMargin: body.extraMargin,
    };

    // Calculate liquidation price (and proximity if current price provided)
    if (body.currentPrice && body.currentPrice > 0) {
      // Calculate both liquidation price and proximity
      const result = liquidationCalculatorService.calculateLiquidationPriceAndProximity(
        params,
        body.currentPrice
      );

      const proximityMessage = liquidationCalculatorService.formatProximityMessage(
        result.proximity
      );

      return NextResponse.json({
        success: true,
        liquidationPrice: result.calculation.liquidationPrice,
        proximity: {
          currentPrice: result.proximity.currentPrice,
          entryPrice: result.proximity.entryPrice,
          distanceToLiquidation: result.proximity.distanceToLiquidation,
          distanceFromEntry: result.proximity.distanceFromEntry,
          proximityRatio: result.proximity.proximityRatio,
          isInDanger: result.proximity.isInDanger,
          percentToLiquidation: result.proximity.percentToLiquidation,
          message: proximityMessage,
        },
        mmr: result.calculation.mmr,
        formula: result.calculation.formula,
        warnings: result.calculation.warnings,
      });
    } else {
      // Calculate liquidation price only
      const result = liquidationCalculatorService.calculateLiquidationPrice(params);

      return NextResponse.json({
        success: true,
        liquidationPrice: result.liquidationPrice,
        mmr: result.mmr,
        formula: result.formula,
        warnings: result.warnings,
      });
    }
  } catch (error: any) {
    console.error('[Liquidation API] Error:', error);

    // Return error with details
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate liquidation price',
      },
      { status: 400 }
    );
  }
}
