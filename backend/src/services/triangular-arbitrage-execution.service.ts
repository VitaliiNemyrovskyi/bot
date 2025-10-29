/**
 * Triangular Arbitrage Execution Service
 *
 * Executes triangular arbitrage trades atomically with error recovery.
 */

import prisma from '@/lib/prisma';
import { ExchangeConnectorFactory } from '@/connectors/exchange.factory';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';
import type { TriangularArbitragePosition, TriangularArbStatus } from '@prisma/client';
import { ArbitrageResult, TriangularArbitrageCalculator, TrianglePrices, TriangleConfig } from '@/lib/triangular-arbitrage-calculator';

export interface ExecutionConfig {
  userId: string;
  credentialId: string;
  exchange: string;
  positionSize: number;
  maxSlippagePercent: number;
  executionTimeoutMs: number;
  connector?: BaseExchangeConnector; // Optional: use existing connector from scanner
}

export interface SymbolLimits {
  symbol: string;
  minOrderQty: number;
  qtyPrecision: number;
  minOrderValue?: number;
}

export interface ExecutionResult {
  success: boolean;
  positionId: string;
  status: TriangularArbStatus;
  error?: string;
}

enum RecoveryStrategy {
  RETRY_LEG = 'RETRY_LEG',
  REVERSE_COMPLETED = 'REVERSE_COMPLETED',
  HOLD_POSITION = 'HOLD_POSITION',
}

/**
 * Execution Service
 * Handles trade execution with error recovery
 */
export class TriangularArbitrageExecutionService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly ORDER_SIZE_BUFFER = 0.995; // Use 99.5% of calculated amount to stay within limits and account for rounding
  private symbolLimitsCache = new Map<string, SymbolLimits>(); // Cache symbol limits

  /**
   * Get symbol limits from exchange API
   */
  private async getSymbolLimits(symbol: string, exchange: string): Promise<SymbolLimits | null> {
    const cacheKey = `${exchange}:${symbol}`;

    // Check cache first
    if (this.symbolLimitsCache.has(cacheKey)) {
      return this.symbolLimitsCache.get(cacheKey)!;
    }

    try {
      // Normalize symbol: convert "BONDETH" to "BOND/ETH" if needed
      let normalizedSymbol = symbol;
      if (!symbol.includes('/')) {
        // Try to split the symbol using common quote currencies
        const quoteCurrencies = ['USDT', 'USDC', 'USD1', 'USD', 'ETH', 'BTC'];
        for (const quote of quoteCurrencies) {
          if (symbol.endsWith(quote)) {
            const base = symbol.slice(0, -quote.length);
            normalizedSymbol = `${base}/${quote}`;
            console.log(`[TriArb Execution] Normalized symbol: ${symbol} → ${normalizedSymbol}`);
            break;
          }
        }
      }

      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/exchange/symbol-info`);
      url.searchParams.set('exchange', exchange);
      url.searchParams.set('symbol', normalizedSymbol);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!data.success || !data.data) {
        console.warn(`[TriArb Execution] Failed to get symbol limits for ${symbol} on ${exchange}`);
        return null;
      }

      const limits: SymbolLimits = {
        symbol: data.data.symbol,
        minOrderQty: data.data.minOrderQty,
        qtyPrecision: data.data.qtyPrecision,
        minOrderValue: data.data.minOrderValue,
      };

      // Cache for future use
      this.symbolLimitsCache.set(cacheKey, limits);

      return limits;
    } catch (error: any) {
      console.error(`[TriArb Execution] Error getting symbol limits:`, error.message);
      return null;
    }
  }

  /**
   * Validate if order quantity meets minimum requirements
   */
  private validateOrderQuantity(
    symbol: string,
    quantity: number,
    limits: SymbolLimits | null
  ): { valid: boolean; reason?: string; minRequired?: number } {
    if (!limits) {
      // If we can't get limits, allow the order (exchange will reject if invalid)
      return { valid: true };
    }

    if (quantity < limits.minOrderQty) {
      // Extract base asset from symbol
      let baseAsset = symbol;
      if (symbol.includes('/')) {
        // CCXT format: "ETH/USDT" -> "ETH"
        baseAsset = symbol.split('/')[0];
      } else {
        // Parse symbol like "ETHUSDT" -> "ETH"
        const quoteCurrencies = ['USDT', 'USDC', 'BUSD', 'USD1', 'USD0', 'USD', 'BTC', 'ETH', 'BNB'];
        for (const quote of quoteCurrencies) {
          if (symbol.endsWith(quote)) {
            baseAsset = symbol.slice(0, -quote.length);
            break;
          }
        }
      }

      // Format quantity to show actual value (use 8 decimals to avoid rounding to "0")
      const formattedQty = quantity < 0.00000001 ? quantity.toExponential(2) : quantity.toFixed(8);

      return {
        valid: false,
        reason: `Order size ${formattedQty} ${baseAsset} is below minimum ${limits.minOrderQty} ${baseAsset}`,
        minRequired: limits.minOrderQty,
      };
    }

    return { valid: true };
  }

  /**
   * Get exchange connector for execution
   * Uses the provided connector from config if available, otherwise creates a new one
   */
  private async getConnector(config: ExecutionConfig): Promise<BaseExchangeConnector> {
    // Use existing connector from scanner if provided
    if (config.connector) {
      // console.log('[TriArb Execution] Using existing connector from scanner');
      return config.connector;
    }

    // console.log('[TriArb Execution] Creating new connector (no scanner connector provided)');

    // Get credentials from database
    const credentials = await ExchangeCredentialsService.getCredentialsById(config.credentialId);

    if (!credentials) {
      throw new Error(`Credentials not found: ${config.credentialId}`);
    }

    // Create and initialize connector
    const connector = ExchangeConnectorFactory.create(
      config.exchange,
      credentials.apiKey,
      credentials.apiSecret,
      undefined, // userId not needed for connector
      config.credentialId,
      credentials.authToken
    );

    await connector.initialize();
    return connector;
  }

  /**
   * Get current prices and recalculate with actual position size
   */
  private async recalculateWithActualSize(
    opportunityId: string,
    config: ExecutionConfig
  ): Promise<ArbitrageResult> {
    // Get opportunity data
    const opportunity = await prisma.triangularArbitrageOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    // Get exchange connector
    const connector = await this.getConnector(config);

    // Fetch current prices for all three symbols
    const [price1, price2, price3] = await Promise.all([
      connector.getMarketPrice(opportunity.symbol1),
      connector.getMarketPrice(opportunity.symbol2),
      connector.getMarketPrice(opportunity.symbol3),
    ]);

    const prices: TrianglePrices = {
      symbol1: opportunity.symbol1,
      symbol2: opportunity.symbol2,
      symbol3: opportunity.symbol3,
      price1,
      price2,
      price3,
    };

    console.log(`[TriArb Execution] Fetched prices:`, {
      [opportunity.symbol1]: price1,
      [opportunity.symbol2]: price2,
      [opportunity.symbol3]: price3,
    });

    const triangleConfig: TriangleConfig = {
      baseAsset: opportunity.baseAsset,
      quoteAsset: opportunity.quoteAsset,
      bridgeAsset: opportunity.bridgeAsset,
      makerFeeRate: config.connector?.takerFee || 0.0006,
      takerFeeRate: config.connector?.takerFee || 0.0006,
    };

    // Recalculate with actual position size
    const result = TriangularArbitrageCalculator.calculateOptimalProfit(
      config.positionSize,
      prices,
      triangleConfig
    );

    if (!result) {
      throw new Error('Opportunity no longer profitable with current prices');
    }

    console.log(`[TriArb Execution] Recalculated with actual size ${config.positionSize} USDT:`, {
      profit: result.profitPercent.toFixed(4) + '%',
      direction: result.direction,
      leg1Input: result.legs[0]?.inputAmount,
      leg1Output: result.legs[0]?.outputAmount,
      leg2Input: result.legs[1]?.inputAmount,
      leg2Output: result.legs[1]?.outputAmount,
      leg3Input: result.legs[2]?.inputAmount,
      leg3Output: result.legs[2]?.outputAmount,
    });

    return result;
  }

  /**
   * Validate that all order sizes meet exchange minimums
   * Prevents execution of triangles that would fail due to order size limits
   *
   * IMPORTANT: This validation accounts for slippage in previous legs
   * to ensure subsequent legs will still meet minimum requirements
   */
  private async validateOrderSizes(
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<void> {
    const connector = await this.getConnector(config);

    // Assume worst-case slippage for each leg
    // This ensures that even if previous legs have slippage + fees, subsequent legs will still be valid
    // 3% buffer = 0.97 multiplier accounts for:
    // - Trading fees (0.2-0.6%)
    // - Slippage (0.5-1%)
    // - Price movement (0.5-1%)
    // - Rounding errors
    const SLIPPAGE_BUFFER = 0.97; // 3% buffer per leg

    // Track accumulated slippage effect through the triangle
    let accumulatedSlippage = 1.0;

    for (let i = 0; i < result.legs.length; i++) {
      const leg = result.legs[i];

      // Get symbol limits from exchange
      const limits = await connector.getSymbolLimits(leg.symbol);

      if (!limits) {
        console.warn(`[TriArb Validation] Could not fetch limits for ${leg.symbol}, skipping validation`);
        continue;
      }

      // Calculate the actual quantity that will be used for the order
      // For BUY orders: quantity is the base currency amount we're buying (outputAmount)
      // For SELL orders: quantity is the base currency amount we're selling (inputAmount)
      let quantity = leg.side === 'Buy' ? leg.outputAmount : leg.inputAmount;

      // For Leg 2 and Leg 3, apply accumulated slippage from previous legs
      // This simulates the worst-case scenario where previous legs had slippage
      if (i > 0) {
        quantity *= accumulatedSlippage;
      }

      const adjustedAmount = quantity * this.ORDER_SIZE_BUFFER;

      console.log(`[TriArb Validation] Checking Leg ${i + 1} (${leg.symbol}):`, {
        side: leg.side,
        expectedQuantity: leg.side === 'Buy' ? leg.outputAmount : leg.inputAmount,
        quantityWithSlippage: quantity,
        adjustedAmount,
        minOrderSize: limits.minOrderSize,
        minNotional: limits.minNotional,
        accumulatedSlippage: (1 - accumulatedSlippage) * 100 + '%'
      });

      // Check minimum order size (base currency)
      if (limits.minOrderSize) {
        // Use a 150% safety margin above minimum to account for:
        // - Actual vs expected output from previous leg (up to 20%)
        // - Price differences between ticker and orderbook (5-10%)
        // - Unexpected slippage (10-15%)
        // - ORDER_SIZE_BUFFER reduction (0.5%)
        // - Precision rounding losses (up to 1 step)
        // - Fee accumulation across legs (5-10%)
        // Total conservative margin: 150% = 2.5x minimum
        const safeMinimum = limits.minOrderSize * 2.5;

        if (adjustedAmount < limits.minOrderSize) {
          const missingFactor = limits.minOrderSize / adjustedAmount;
          const requiredPositionSize = config.positionSize * missingFactor;
          throw new Error(
            `Leg ${i + 1} (${leg.symbol}) order size ${adjustedAmount.toFixed(8)} ${leg.symbol.split('/')[0]} ` +
            `is below exchange minimum ${limits.minOrderSize} (accounting for ${((1-accumulatedSlippage)*100).toFixed(1)}% potential slippage). ` +
            `Try increasing position size to at least ${requiredPositionSize.toFixed(2)} USDT or choose a different triangle.`
          );
        } else if (adjustedAmount < safeMinimum) {
          const missingFactor = safeMinimum / adjustedAmount;
          const requiredPositionSize = config.positionSize * missingFactor;
          throw new Error(
            `Leg ${i + 1} (${leg.symbol}) order size ${adjustedAmount.toFixed(8)} ${leg.symbol.split('/')[0]} ` +
            `is too close to exchange minimum ${limits.minOrderSize} (only ${((adjustedAmount/limits.minOrderSize - 1) * 100).toFixed(1)}% above). ` +
            `This leaves insufficient margin for slippage/fees. ` +
            `Try increasing position size to at least ${requiredPositionSize.toFixed(2)} USDT or choose a different triangle.`
          );
        }
      }

      // Check minimum notional value (quote currency)
      if (limits.minNotional) {
        // Calculate notional value (amount * price)
        const notionalValue = adjustedAmount * leg.price;
        if (notionalValue < limits.minNotional) {
          const missingFactor = limits.minNotional / notionalValue;
          const requiredPositionSize = config.positionSize * missingFactor;
          throw new Error(
            `Leg ${i + 1} (${leg.symbol}) notional value ${notionalValue.toFixed(2)} ${leg.symbol.split('/')[1]} ` +
            `is below exchange minimum ${limits.minNotional} (accounting for ${((1-accumulatedSlippage)*100).toFixed(1)}% potential slippage). ` +
            `Try increasing position size to at least ${requiredPositionSize.toFixed(2)} USDT or choose a different triangle.`
          );
        }
      }

      console.log(`[TriArb Validation] ✓ Leg ${i + 1} (${leg.symbol}) passed validation`);

      // Update accumulated slippage for next leg
      accumulatedSlippage *= SLIPPAGE_BUFFER;
    }

    console.log(`[TriArb Validation] ✓ All legs validated successfully (with ${((1-accumulatedSlippage)*100).toFixed(1)}% total slippage buffer)`);
  }

  /**
   * Validate that user has sufficient balance for the first leg
   * This prevents execution attempts when there are insufficient funds
   */
  private async validateBalance(
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<void> {
    const connector = await this.getConnector(config);
    const leg1 = result.legs[0];

    // Parse the symbol to extract base and quote assets
    // Symbols can be in different formats: "ETH/USDT" (CCXT) or "ETHUSDT" (Gate.io)
    let baseAsset: string;
    let quoteAsset: string;

    if (leg1.symbol.includes('/')) {
      // CCXT format: "ETH/USDT"
      [baseAsset, quoteAsset] = leg1.symbol.split('/');
    } else {
      // Gate.io format: "ETHUSDT" - try to parse using connector's market info
      try {
        const normalizedSymbol = connector.normalizeSymbol ?
          connector.normalizeSymbol(leg1.symbol) : leg1.symbol;

        if (normalizedSymbol.includes('/')) {
          [baseAsset, quoteAsset] = normalizedSymbol.split('/');
        } else {
          // Fallback: assume common quote currencies
          const commonQuotes = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];
          quoteAsset = commonQuotes.find(q => leg1.symbol.endsWith(q)) || 'USDT';
          baseAsset = leg1.symbol.replace(quoteAsset, '');
        }
      } catch {
        // Last resort fallback
        console.warn(`[TriArb Validation] Could not parse symbol ${leg1.symbol}, skipping balance check`);
        return;
      }
    }

    // Determine which asset we need for Leg 1
    // For BUY orders: need quote currency (e.g., BUY ETH/USDT needs USDT)
    // For SELL orders: need base currency (e.g., SELL ETH/USDT needs ETH)
    const requiredAsset = leg1.side === 'Buy' ? quoteAsset : baseAsset;

    // Calculate required amount
    // For BUY orders: we spend quote currency (inputAmount)
    // For SELL orders: we spend base currency (inputAmount as well, but it's the base being sold)
    let requiredAmount = leg1.side === 'Buy' ? leg1.inputAmount : leg1.inputAmount;

    // CRITICAL: For Gate.io BUY orders, account for 0.5% cost buffer
    // Gate.io charges more than the theoretical amount for market BUY orders
    // We need to ensure we have enough balance to cover this extra cost
    if (config.exchange === 'GATEIO' && leg1.side === 'Buy') {
      requiredAmount = requiredAmount * 1.005;
      console.log(`[TriArb Validation] Added 0.5% Gate.io cost buffer to required amount`);
    }

    const adjustedAmount = requiredAmount * this.ORDER_SIZE_BUFFER;

    console.log(`[TriArb Validation] Checking balance for ${requiredAsset}:`, {
      requiredAsset,
      requiredAmount: adjustedAmount,
      leg1Side: leg1.side,
      leg1Symbol: leg1.symbol,
      exchange: config.exchange,
    });

    try {
      // Fetch account balance
      const balances = await connector.getBalance();

      // CCXT returns balance structure with 'free', 'used', 'total' for each asset
      const assetBalance = balances[requiredAsset];

      if (!assetBalance) {
        throw new Error(
          `No ${requiredAsset} balance found. You need ${adjustedAmount.toFixed(8)} ${requiredAsset} for Leg 1.`
        );
      }

      const availableBalance = assetBalance.free || 0;

      console.log(`[TriArb Validation] Balance check:`, {
        asset: requiredAsset,
        available: availableBalance,
        required: adjustedAmount,
        sufficient: availableBalance >= adjustedAmount,
      });

      if (availableBalance < adjustedAmount) {
        // Calculate maximum safe position size
        // Use 95% of available balance to account for fees and price slippage
        const maxSafePositionSize = availableBalance * 0.95;

        throw new Error(
          `Insufficient ${requiredAsset} balance. ` +
          `Available: ${availableBalance.toFixed(2)}, Required: ${adjustedAmount.toFixed(2)}. ` +
          `Recommended max position size: ${maxSafePositionSize.toFixed(2)} ${requiredAsset} ` +
          `(95% of available balance to account for fees and slippage).`
        );
      }

      console.log(`[TriArb Validation] ✓ Balance check passed`);
    } catch (error: any) {
      // If it's our validation error, re-throw it
      if (error.message.includes('Insufficient') || error.message.includes('No ')) {
        throw error;
      }

      // For other errors (e.g., API errors), log warning but don't block execution
      console.warn(`[TriArb Validation] Could not verify balance, continuing anyway:`, error.message);
    }
  }

  /**
   * Execute triangular arbitrage opportunity
   */
  async executeOpportunity(
    opportunityId: string,
    arbitrageResult: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<ExecutionResult> {
    console.log(`[TriArb Execution] Starting execution for opportunity ${opportunityId}`, {
      positionSize: config.positionSize,
      exchange: config.exchange,
    });

    let position: TriangularArbitragePosition | null = null;

    try {
      // Recalculate with actual position size and current prices
      // Note: The arbitrageResult parameter is ignored - we always recalculate with fresh prices
      console.log(`[TriArb Execution] Recalculating with fresh prices and position size ${config.positionSize} USDT...`);
      const recalculatedResult = await this.recalculateWithActualSize(opportunityId, config);

      // Validate that all order sizes meet exchange minimums
      console.log(`[TriArb Execution] Validating order sizes against exchange limits...`);
      await this.validateOrderSizes(recalculatedResult, config);

      // Validate that user has sufficient balance for the first leg
      console.log(`[TriArb Execution] Validating account balance...`);
      await this.validateBalance(recalculatedResult, config);

      // Create position in database
      position = await this.createPosition(opportunityId, recalculatedResult, config);

      // Execute all three legs sequentially in one function
      await this.executeAllLegs(position, recalculatedResult, config);

      // Calculate final results
      await this.calculateFinalResults(position);

      // Update position status to COMPLETED
      await prisma.triangularArbitragePosition.update({
        where: { id: position.id },
        data: {
          status: 'COMPLETED',
          executionCompletedAt: new Date(),
          totalExecutionTimeMs: position.executionStartedAt
            ? Date.now() - position.executionStartedAt.getTime()
            : null,
        },
      });

      console.log(`[TriArb Execution] Successfully completed position ${position.positionId}`);

      return {
        success: true,
        positionId: position.positionId,
        status: 'COMPLETED',
      };
    } catch (error: any) {
      console.error(`[TriArb Execution] Error executing opportunity:`, error);

      if (position) {
        // Handle error recovery
        await this.handleExecutionError(position, error);

        // Fetch current status from database to return accurate status
        const updatedPosition = await prisma.triangularArbitragePosition.findUnique({
          where: { id: position.id },
          select: { status: true },
        });

        return {
          success: false,
          positionId: position.positionId,
          status: updatedPosition?.status || 'ERROR',
          error: error.message,
        };
      }

      return {
        success: false,
        positionId: position?.positionId || '',
        status: 'ERROR',
        error: error.message,
      };
    }
  }

  /**
   * Create position in database
   */
  private async createPosition(
    opportunityId: string,
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<TriangularArbitragePosition> {
    const positionId = `tri_arb_${Date.now()}`;

    // Get opportunity data for triangle info
    const opportunity = await prisma.triangularArbitrageOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    const position = await prisma.triangularArbitragePosition.create({
      data: {
        userId: config.userId,
        positionId,
        exchange: config.exchange,
        credentialId: config.credentialId,
        symbol1: opportunity.symbol1,
        symbol2: opportunity.symbol2,
        symbol3: opportunity.symbol3,
        baseAsset: opportunity.baseAsset,
        quoteAsset: opportunity.quoteAsset,
        bridgeAsset: opportunity.bridgeAsset,
        entryQuantity: config.positionSize,
        expectedReturnQuantity: result.finalAmount,
        expectedProfitPercent: result.profitPercent,
        expectedProfitAmount: result.profitAmount,
        maxSlippagePercent: config.maxSlippagePercent,
        executionTimeoutMs: config.executionTimeoutMs,
        status: 'EXECUTING_LEG1',
        executionStartedAt: new Date(),
        opportunityDetectedAt: opportunity.detectedAt,
      },
    });

    // Mark opportunity as executed
    await prisma.triangularArbitrageOpportunity.update({
      where: { id: opportunityId },
      data: {
        wasExecuted: true,
        executedPositionId: position.positionId,
      },
    });

    return position;
  }

  /**
   * Execute all three legs sequentially
   * Each leg uses the actual filled quantity from the previous leg
   */
  private async executeAllLegs(
    position: TriangularArbitragePosition,
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<void> {
    console.log(`[TriArb Execution] Starting execution of all legs for ${position.positionId}`);

    const connector = await this.getConnector(config);
    let currentQuantity = config.positionSize; // Start with initial USDT amount

    // Execute all 3 legs
    for (let legIndex = 0; legIndex < 3; legIndex++) {
      const leg = result.legs[legIndex];
      const legNumber = legIndex + 1;

      console.log(`[TriArb Execution] Executing Leg ${legNumber} for ${position.positionId}`);
      console.log(`[TriArb Execution] Leg ${legNumber} input: ${currentQuantity} ${legIndex === 0 ? 'USDT' : ''}`);

      let retries = 0;
      let success = false;

      while (retries < this.MAX_RETRIES && !success) {
        try {
          // Calculate order quantity
          let orderQuantity: number;

          if (legIndex === 0) {
            // Leg 1: Use position size (USDT)
            orderQuantity = leg.side === 'Buy' ? leg.outputAmount : leg.inputAmount;

            // CRITICAL: For Gate.io market BUY orders, reduce quantity by 0.5% cost buffer
            if (config.exchange === 'GATEIO' && leg.side === 'Buy') {
              orderQuantity = orderQuantity / 1.005;
              console.log(`[TriArb Execution] Leg ${legNumber}: Reduced quantity by 0.5% for Gate.io cost buffer`);
            }
          } else {
            // Leg 2 & 3: Use actual filled quantity from previous leg
            // For BUY orders, need to convert quote currency to base currency
            if (leg.side === 'Buy') {
              // BUY order: currentQuantity is in quote currency, need to convert to base currency
              // Calculate price from leg's expected input/output ratio
              // For BUY: price = inputAmount / outputAmount (quote per base)
              const calculatedPrice = leg.inputAmount / leg.outputAmount;

              // Example: Have 0.000457 BTC, buying KDA/BTC at 0.00068, need 0.000457 / 0.00068 = 0.672 KDA
              orderQuantity = currentQuantity / calculatedPrice;
              console.log(`[TriArb Execution] Leg ${legNumber}: Converting ${currentQuantity} (quote) to ${orderQuantity} (base) using calculated price ${calculatedPrice}`);
            } else {
              // SELL order: currentQuantity is already in base currency
              orderQuantity = currentQuantity;
            }

            // For BUY orders on Gate.io, apply cost buffer
            if (config.exchange === 'GATEIO' && leg.side === 'Buy') {
              orderQuantity = orderQuantity / 1.005;
              console.log(`[TriArb Execution] Leg ${legNumber}: Reduced quantity by 0.5% for Gate.io cost buffer`);
            }
          }

          // Apply order size buffer ONLY on Leg 1 to stay within balance limits
          // For Leg 2 & 3, use exact filled quantity from previous leg (already validated)
          const adjustedQuantity = legIndex === 0
            ? orderQuantity * this.ORDER_SIZE_BUFFER
            : orderQuantity;

          console.log(`[TriArb Execution] Leg ${legNumber} order:`, {
            symbol: leg.symbol,
            side: leg.side,
            originalQuantity: orderQuantity,
            adjustedQuantity,
            bufferApplied: legIndex === 0,
          });

          // Validate order quantity against exchange limits
          const limits = await this.getSymbolLimits(leg.symbol, config.exchange);
          const validation = this.validateOrderQuantity(leg.symbol, adjustedQuantity, limits);

          if (!validation.valid) {
            throw new Error(
              `Leg ${legNumber} validation failed: ${validation.reason}. ` +
              `Suggested minimum: ${Math.ceil((validation.minRequired! / adjustedQuantity) * config.positionSize * 1.1)} USDT`
            );
          }

          // Place order
          const order = await connector.placeMarketOrder(
            leg.symbol,
            leg.side,
            adjustedQuantity
          );

          console.log(`[TriArb Execution] Leg ${legNumber} RAW ORDER:`, JSON.stringify(order, null, 2));

          // Parse order response (support both CCXT and custom formats)
          let filledQty: number;
          let avgPrice: number;
          let fees: number;

          if (order.cumExecQty !== undefined) {
            // Custom format (Bybit, BingX)
            filledQty = typeof order.cumExecQty === 'number'
              ? order.cumExecQty
              : parseFloat(order.cumExecQty || '0');
            avgPrice = typeof order.avgPrice === 'number'
              ? order.avgPrice
              : parseFloat(order.avgPrice || '0');
            fees = typeof order.cumExecFee === 'number'
              ? order.cumExecFee
              : parseFloat(order.cumExecFee || '0');
          } else {
            // CCXT format (Gate.io)
            filledQty = typeof order.filled === 'number'
              ? order.filled
              : parseFloat(order.filled || '0');
            avgPrice = typeof order.average === 'number'
              ? order.average
              : parseFloat(order.average || '0');

            // Calculate total fees from CCXT fees array
            fees = 0;
            if (Array.isArray(order.fees) && order.fees.length > 0) {
              fees = order.fees.reduce((sum: number, fee: any) => {
                return sum + (typeof fee.cost === 'number' ? fee.cost : parseFloat(fee.cost || '0'));
              }, 0);
            }
          }

          console.log(`[TriArb Execution] Leg ${legNumber} PARSED:`, {
            filledQty,
            avgPrice,
            fees,
          });

          // Validate filled quantity
          if (!filledQty || filledQty === 0 || isNaN(filledQty)) {
            throw new Error(
              `Leg ${legNumber} filled quantity is invalid: ${filledQty}. ` +
              `Order: ${JSON.stringify(order)}`
            );
          }

          // Update database with this leg's execution data
          const updateData: any = {
            [`leg${legNumber}Symbol`]: leg.symbol,
            [`leg${legNumber}Side`]: leg.side,
            [`leg${legNumber}Quantity`]: orderQuantity,
            [`leg${legNumber}Price`]: avgPrice,
            [`leg${legNumber}OrderId`]: order.id || order.orderId,
            [`leg${legNumber}FilledQty`]: filledQty,
            [`leg${legNumber}AvgPrice`]: avgPrice,
            [`leg${legNumber}Fees`]: fees,
            [`leg${legNumber}ExecutedAt`]: new Date(),
            status: legNumber === 3 ? 'COMPLETED' : `EXECUTING_LEG${legNumber + 1}`,
          };

          await prisma.triangularArbitragePosition.update({
            where: { id: position.id },
            data: updateData,
          });

          console.log(`[TriArb Execution] Leg ${legNumber} completed: filled ${filledQty} at ${avgPrice}`);

          // Calculate actual output for next leg
          // CRITICAL: Must account for fees to get the actual available balance
          // For BUY orders: filledQty is the base currency we bought, fees are typically in base currency
          // For SELL orders: filledQty is base currency sold, multiply by price to get quote currency, fees are typically in quote currency
          if (leg.side === 'Buy') {
            // BUY: we got filledQty of base currency, but fees reduce our balance
            // Apply 99.5% buffer to account for fees and ensure we stay within available balance
            currentQuantity = filledQty * 0.995; // BUY: subtract ~0.5% for fees/rounding
            console.log(`[TriArb Execution] Leg ${legNumber} BUY: gross=${filledQty}, net after fees=${currentQuantity} (0.5% buffer applied)`);
          } else {
            // SELL: we got (filledQty * price) of quote currency, but fees reduce our balance
            // Apply 99.5% buffer to account for fees
            currentQuantity = (filledQty * avgPrice) * 0.995; // SELL: subtract ~0.5% for fees/rounding
            console.log(`[TriArb Execution] Leg ${legNumber} SELL: gross=${filledQty * avgPrice}, net after fees=${currentQuantity} (0.5% buffer applied)`);
          }

          console.log(`[TriArb Execution] Leg ${legNumber} output for next leg: ${currentQuantity}`);
          success = true;

        } catch (error: any) {
          retries++;
          console.error(`[TriArb Execution] Leg ${legNumber} attempt ${retries} failed:`, error.message);

          if (retries >= this.MAX_RETRIES) {
            throw new Error(`Leg ${legNumber} failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
          }

          // Wait before retry
          await this.delay(this.RETRY_DELAY_MS);
        }
      }
    }

    console.log(`[TriArb Execution] All legs completed successfully. Final amount: ${currentQuantity}`);
  }

  /**
   * Execute Leg 1 (OLD - keeping for reference, will be removed)
   */
  private async executeLeg1(
    position: TriangularArbitragePosition,
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<void> {
    console.log(`[TriArb Execution] Executing Leg 1 for ${position.positionId}`);

    const leg = result.legs[0];
    let retries = 0;

    while (retries < this.MAX_RETRIES) {
      try {
        // Get exchange connector
        const connector = await this.getConnector(config);

        // For market orders, quantity must be in BASE currency
        // BUY orders: we're buying the base currency → use outputAmount
        // SELL orders: we're selling the base currency → use inputAmount
        let quantity = leg.side === 'Buy' ? leg.outputAmount : leg.inputAmount;

        // CRITICAL: For Gate.io market BUY orders, reduce quantity to account for 0.5% cost buffer
        // Gate.io charges: quantity * price * 1.005 for BUY orders
        // So we reduce quantity by 0.5% to stay within available balance
        if (config.exchange === 'GATEIO' && leg.side === 'Buy') {
          quantity = quantity / 1.005;
          console.log(`[TriArb Execution] Reduced Leg 1 quantity by 0.5% for Gate.io cost buffer`);
        }

        const adjustedAmount = quantity * this.ORDER_SIZE_BUFFER;

        console.log(`[TriArb Execution] Leg 1 order details:`, {
          symbol: leg.symbol,
          side: leg.side,
          inputAmount: leg.inputAmount,
          outputAmount: leg.outputAmount,
          quantity,
          adjustedAmount,
          exchange: config.exchange,
        });

        // Validate order quantity against exchange limits
        const limits = await this.getSymbolLimits(leg.symbol, config.exchange);
        const validation = this.validateOrderQuantity(leg.symbol, adjustedAmount, limits);

        if (!validation.valid) {
          console.error(`[TriArb Execution] Leg 1 validation failed:`, validation.reason);
          throw new Error(
            `${validation.reason}. ` +
            `Current position size: ${config.positionSize} USDT. ` +
            `Suggested minimum: ${Math.ceil((validation.minRequired! / adjustedAmount) * config.positionSize * 1.1)} USDT`
          );
        }

        // Place market order
        const order = await connector.placeMarketOrder(
          leg.symbol,
          leg.side,
          adjustedAmount
        );

        // Update position with leg 1 data
        // Log full order object for debugging
        console.log(`[TriArb Execution] RAW LEG 1 ORDER OBJECT:`, JSON.stringify(order, null, 2));

        // Support both CCXT format (Gate.io, etc.) and custom format (Bybit, BingX)
        // CCXT format: { filled, average, fees }
        // Custom format: { cumExecQty, avgPrice, cumExecFee }
        let filledQty: number;
        let avgPrice: number;
        let fees: number;

        if (order.cumExecQty !== undefined) {
          // Custom format (Bybit, BingX)
          filledQty = typeof order.cumExecQty === 'number'
            ? order.cumExecQty
            : parseFloat(order.cumExecQty || '0');
          avgPrice = typeof order.avgPrice === 'number'
            ? order.avgPrice
            : parseFloat(order.avgPrice || '0');
          fees = typeof order.cumExecFee === 'number'
            ? order.cumExecFee
            : parseFloat(order.cumExecFee || '0');
        } else {
          // CCXT format (Gate.io, standard CCXT)
          filledQty = typeof order.filled === 'number'
            ? order.filled
            : parseFloat(order.filled || '0');
          avgPrice = typeof order.average === 'number'
            ? order.average
            : parseFloat(order.average || '0');

          // Calculate total fees from CCXT fees array
          fees = 0;
          if (Array.isArray(order.fees) && order.fees.length > 0) {
            fees = order.fees.reduce((sum: number, fee: any) => {
              return sum + (typeof fee.cost === 'number' ? fee.cost : parseFloat(fee.cost || '0'));
            }, 0);
          }
        }

        console.log(`[TriArb Execution] Leg 1 PARSED VALUES:`, {
          orderId: order.orderId,
          filledQty: filledQty,
          avgPrice: avgPrice,
          fees: fees,
          filledQtyType: typeof filledQty,
          filledQtyIsZero: filledQty === 0,
          filledQtyIsNaN: isNaN(filledQty)
        });

        // CRITICAL: Validate filled quantity is not zero
        if (!filledQty || filledQty === 0 || isNaN(filledQty)) {
          throw new Error(
            `Leg 1 order filled quantity is invalid: ${filledQty}. ` +
            `Order: ${JSON.stringify(order)}. ` +
            `This indicates the exchange did not fill the order or response is incomplete.`
          );
        }

        await prisma.triangularArbitragePosition.update({
          where: { id: position.id },
          data: {
            leg1Symbol: leg.symbol,
            leg1Side: leg.side,
            leg1Quantity: leg.inputAmount,
            leg1Price: avgPrice,
            leg1OrderId: order.id || order.orderId,
            leg1FilledQty: filledQty,
            leg1AvgPrice: avgPrice,
            leg1Fees: fees,
            leg1ExecutedAt: new Date(),
            status: 'EXECUTING_LEG2',
          },
        });

        console.log(`[TriArb Execution] Leg 1 completed: ${order.orderId}`);
        return; // Success
      } catch (error: any) {
        retries++;
        console.error(`[TriArb Execution] Leg 1 attempt ${retries} failed:`, error.message);

        if (retries >= this.MAX_RETRIES) {
          throw new Error(`Leg 1 failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
        }

        // Wait before retry
        await this.delay(this.RETRY_DELAY_MS);
      }
    }
  }

  /**
   * Execute Leg 2
   */
  private async executeLeg2(
    position: TriangularArbitragePosition,
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<void> {
    console.log(`[TriArb Execution] Executing Leg 2 for ${position.positionId}`);

    const leg = result.legs[1];
    let retries = 0;

    // Use actual output from Leg 1
    const leg1Output = position.leg1FilledQty;

    while (retries < this.MAX_RETRIES) {
      try {
        const connector = await this.getConnector(config);

        // Calculate quantity based on actual Leg 1 output
        // For BUY orders, we need to adjust the expected output proportionally
        // For SELL orders, we use the actual input (leg1Output)
        let quantity: number;
        if (leg.side === 'Buy') {
          // Adjust Leg 2 output based on actual vs expected Leg 1 output
          const adjustmentFactor = leg1Output / result.legs[0].outputAmount;
          quantity = leg.outputAmount * adjustmentFactor;

          // CRITICAL: For Gate.io market BUY orders, we convert quantity to cost with buffer
          // But we only have leg1Output of quote currency available!
          // So we need to reduce the quantity to account for the 0.5% buffer (optimized)
          // This ensures: quantity * price * 1.005 <= leg1Output
          if (config.exchange === 'GATEIO') {
            quantity = quantity / 1.005;
            console.log(`[TriArb Execution] Reduced quantity by 0.5% for Gate.io cost buffer (optimized)`);
          }
        } else {
          // SELL: use actual amount we have from Leg 1 (base currency)
          quantity = leg1Output;
        }

        const adjustedAmount = quantity * this.ORDER_SIZE_BUFFER;

        console.log(`[TriArb Execution] Leg 2 order details:`, {
          symbol: leg.symbol,
          side: leg.side,
          leg1ActualOutput: leg1Output,
          leg1ExpectedOutput: result.legs[0].outputAmount,
          calculatedQuantity: quantity,
          adjustedAmount,
        });

        // Validate order quantity against exchange limits
        const limits = await this.getSymbolLimits(leg.symbol, config.exchange);
        const validation = this.validateOrderQuantity(leg.symbol, adjustedAmount, limits);

        if (!validation.valid) {
          console.error(`[TriArb Execution] Leg 2 validation failed:`, validation.reason);
          throw new Error(
            `${validation.reason}. ` +
            `Current position size: ${config.positionSize} USDT. ` +
            `Suggested minimum: ${Math.ceil((validation.minRequired! / adjustedAmount) * config.positionSize * 1.1)} USDT`
          );
        }

        const order = await connector.placeMarketOrder(
          leg.symbol,
          leg.side,
          adjustedAmount
        );

        // Support both CCXT format (Gate.io, etc.) and custom format (Bybit, BingX)
        let filledQty: number;
        let avgPrice: number;
        let fees: number;

        if (order.cumExecQty !== undefined) {
          // Custom format (Bybit, BingX)
          filledQty = typeof order.cumExecQty === 'number'
            ? order.cumExecQty
            : parseFloat(order.cumExecQty || '0');
          avgPrice = typeof order.avgPrice === 'number'
            ? order.avgPrice
            : parseFloat(order.avgPrice || '0');
          fees = typeof order.cumExecFee === 'number'
            ? order.cumExecFee
            : parseFloat(order.cumExecFee || '0');
        } else {
          // CCXT format (Gate.io, standard CCXT)
          filledQty = typeof order.filled === 'number'
            ? order.filled
            : parseFloat(order.filled || '0');
          avgPrice = typeof order.average === 'number'
            ? order.average
            : parseFloat(order.average || '0');

          // Calculate total fees from CCXT fees array
          fees = 0;
          if (Array.isArray(order.fees) && order.fees.length > 0) {
            fees = order.fees.reduce((sum: number, fee: any) => {
              return sum + (typeof fee.cost === 'number' ? fee.cost : parseFloat(fee.cost || '0'));
            }, 0);
          }
        }

        console.log(`[TriArb Execution] Leg 2 order response:`, {
          orderId: order.id || order.orderId,
          filled: filledQty,
          average: avgPrice,
          fees: fees
        });

        await prisma.triangularArbitragePosition.update({
          where: { id: position.id },
          data: {
            leg2Symbol: leg.symbol,
            leg2Side: leg.side,
            leg2Quantity: leg1Output,
            leg2Price: avgPrice,
            leg2OrderId: order.id || order.orderId,
            leg2FilledQty: filledQty,
            leg2AvgPrice: avgPrice,
            leg2Fees: fees,
            leg2ExecutedAt: new Date(),
            status: 'EXECUTING_LEG3',
          },
        });

        console.log(`[TriArb Execution] Leg 2 completed: ${order.orderId}`);
        return;
      } catch (error: any) {
        retries++;
        console.error(`[TriArb Execution] Leg 2 attempt ${retries} failed:`, error.message);

        if (retries >= this.MAX_RETRIES) {
          // Leg 2 failed - need to reverse Leg 1
          await this.reverseLeg1(position, config);
          throw new Error(`Leg 2 failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
        }

        await this.delay(this.RETRY_DELAY_MS);
      }
    }
  }

  /**
   * Execute Leg 3
   */
  private async executeLeg3(
    position: TriangularArbitragePosition,
    result: ArbitrageResult,
    config: ExecutionConfig
  ): Promise<void> {
    console.log(`[TriArb Execution] Executing Leg 3 for ${position.positionId}`);

    const leg = result.legs[2];
    let retries = 0;

    // Use actual output from Leg 2
    const leg2Output = position.leg2FilledQty;

    while (retries < this.MAX_RETRIES) {
      try {
        const connector = await this.getConnector(config);

        // Calculate quantity based on actual Leg 2 output
        // For BUY orders, we need to adjust the expected output proportionally
        // For SELL orders, we use the actual input (leg2Output)
        let quantity: number;
        if (leg.side === 'Buy') {
          // Adjust Leg 3 output based on actual vs expected Leg 2 output
          const adjustmentFactor = leg2Output / result.legs[1].outputAmount;
          quantity = leg.outputAmount * adjustmentFactor;

          // CRITICAL: For Gate.io market BUY orders, we convert quantity to cost with buffer
          // But we only have leg2Output of quote currency available!
          // So we need to reduce the quantity to account for the 0.5% buffer (optimized)
          // This ensures: quantity * price * 1.005 <= leg2Output
          if (config.exchange === 'GATEIO') {
            quantity = quantity / 1.005;
            console.log(`[TriArb Execution] Reduced quantity by 0.5% for Gate.io cost buffer (optimized)`);
          }
        } else {
          // SELL: use actual amount we have from Leg 2 (base currency)
          quantity = leg2Output;
        }

        const adjustedAmount = quantity * this.ORDER_SIZE_BUFFER;

        console.log(`[TriArb Execution] Leg 3 order details:`, {
          symbol: leg.symbol,
          side: leg.side,
          leg2ActualOutput: leg2Output,
          leg2ExpectedOutput: result.legs[1].outputAmount,
          calculatedQuantity: quantity,
          adjustedAmount,
        });

        // Validate order quantity against exchange limits
        const limits = await this.getSymbolLimits(leg.symbol, config.exchange);
        const validation = this.validateOrderQuantity(leg.symbol, adjustedAmount, limits);

        if (!validation.valid) {
          console.error(`[TriArb Execution] Leg 3 validation failed:`, validation.reason);
          // Leg 3 failed - need to reverse Legs 1 and 2
          await this.reverseLeg1(position, config);
          await this.reverseLeg2(position, config);
          throw new Error(
            `${validation.reason}. ` +
            `Current position size: ${config.positionSize} USDT. ` +
            `Suggested minimum: ${Math.ceil((validation.minRequired! / adjustedAmount) * config.positionSize * 1.1)} USDT`
          );
        }

        const order = await connector.placeMarketOrder(
          leg.symbol,
          leg.side,
          adjustedAmount
        );

        // Support both CCXT format (Gate.io, etc.) and custom format (Bybit, BingX)
        let filledQty: number;
        let avgPrice: number;
        let fees: number;

        if (order.cumExecQty !== undefined) {
          // Custom format (Bybit, BingX)
          filledQty = typeof order.cumExecQty === 'number'
            ? order.cumExecQty
            : parseFloat(order.cumExecQty || '0');
          avgPrice = typeof order.avgPrice === 'number'
            ? order.avgPrice
            : parseFloat(order.avgPrice || '0');
          fees = typeof order.cumExecFee === 'number'
            ? order.cumExecFee
            : parseFloat(order.cumExecFee || '0');
        } else {
          // CCXT format (Gate.io, standard CCXT)
          filledQty = typeof order.filled === 'number'
            ? order.filled
            : parseFloat(order.filled || '0');
          avgPrice = typeof order.average === 'number'
            ? order.average
            : parseFloat(order.average || '0');

          // Calculate total fees from CCXT fees array
          fees = 0;
          if (Array.isArray(order.fees) && order.fees.length > 0) {
            fees = order.fees.reduce((sum: number, fee: any) => {
              return sum + (typeof fee.cost === 'number' ? fee.cost : parseFloat(fee.cost || '0'));
            }, 0);
          }
        }

        console.log(`[TriArb Execution] Leg 3 order response:`, {
          orderId: order.id || order.orderId,
          filled: filledQty,
          average: avgPrice,
          fees: fees
        });

        await prisma.triangularArbitragePosition.update({
          where: { id: position.id },
          data: {
            leg3Symbol: leg.symbol,
            leg3Side: leg.side,
            leg3Quantity: leg2Output,
            leg3Price: avgPrice,
            leg3OrderId: order.id || order.orderId,
            leg3FilledQty: filledQty,
            leg3AvgPrice: avgPrice,
            leg3Fees: fees,
            leg3ExecutedAt: new Date(),
          },
        });

        console.log(`[TriArb Execution] Leg 3 completed: ${order.orderId}`);
        return;
      } catch (error: any) {
        retries++;
        console.error(`[TriArb Execution] Leg 3 attempt ${retries} failed:`, error.message);

        if (retries >= this.MAX_RETRIES) {
          // Leg 3 failed - need to reverse Legs 2 and 1
          await this.reverseLeg2(position, config);
          await this.reverseLeg1(position, config);
          throw new Error(`Leg 3 failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
        }

        await this.delay(this.RETRY_DELAY_MS);
      }
    }
  }

  /**
   * Calculate final results
   */
  private async calculateFinalResults(position: TriangularArbitragePosition): Promise<void> {
    const finalQuantity = position.leg3FilledQty;
    const totalFees = position.leg1Fees + position.leg2Fees + position.leg3Fees;
    const actualProfitAmount = finalQuantity - position.entryQuantity;
    const actualProfitPercent = (actualProfitAmount / position.entryQuantity) * 100;

    // Calculate slippage per leg
    const leg1Slippage = position.leg1AvgPrice && position.leg1Price
      ? ((position.leg1AvgPrice - position.leg1Price) / position.leg1Price) * 100
      : 0;

    const leg2Slippage = position.leg2AvgPrice && position.leg2Price
      ? ((position.leg2AvgPrice - position.leg2Price) / position.leg2Price) * 100
      : 0;

    const leg3Slippage = position.leg3AvgPrice && position.leg3Price
      ? ((position.leg3AvgPrice - position.leg3Price) / position.leg3Price) * 100
      : 0;

    const totalSlippage = Math.abs(leg1Slippage) + Math.abs(leg2Slippage) + Math.abs(leg3Slippage);

    await prisma.triangularArbitragePosition.update({
      where: { id: position.id },
      data: {
        finalQuantity,
        actualProfitAmount,
        actualProfitPercent,
        totalFees,
        leg1Slippage,
        leg2Slippage,
        leg3Slippage,
        totalSlippage,
      },
    });
  }

  /**
   * Reverse Leg 1 (sell back what we bought)
   */
  private async reverseLeg1(
    position: TriangularArbitragePosition,
    config: ExecutionConfig
  ): Promise<void> {
    console.log(`[TriArb Execution] Reversing Leg 1 for ${position.positionId}`);

    try {
      const connector = await this.getConnector(config);

      // Reverse the trade (opposite side)
      const reverseSide = position.leg1Side === 'Buy' ? 'Sell' : 'Buy';

      await connector.placeMarketOrder(
        position.leg1Symbol!,
        reverseSide,
        position.leg1FilledQty
      );

      console.log(`[TriArb Execution] Leg 1 reversed successfully`);
    } catch (error) {
      console.error(`[TriArb Execution] Failed to reverse Leg 1:`, error);
    }
  }

  /**
   * Reverse Leg 2
   */
  private async reverseLeg2(
    position: TriangularArbitragePosition,
    config: ExecutionConfig
  ): Promise<void> {
    console.log(`[TriArb Execution] Reversing Leg 2 for ${position.positionId}`);

    try {
      const connector = await this.getConnector(config);

      const reverseSide = position.leg2Side === 'Buy' ? 'Sell' : 'Buy';

      await connector.placeMarketOrder(
        position.leg2Symbol!,
        reverseSide,
        position.leg2FilledQty
      );

      console.log(`[TriArb Execution] Leg 2 reversed successfully`);
    } catch (error) {
      console.error(`[TriArb Execution] Failed to reverse Leg 2:`, error);
    }
  }

  /**
   * Handle execution error with recovery strategy
   */
  private async handleExecutionError(
    position: TriangularArbitragePosition,
    error: Error
  ): Promise<void> {
    console.error(`[TriArb Execution] Handling error for ${position.positionId}:`, error.message);

    await prisma.triangularArbitragePosition.update({
      where: { id: position.id },
      data: {
        status: 'ERROR',
        errorMessage: error.message,
      },
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cancel position (emergency stop)
   */
  async cancelPosition(positionId: string, userId: string): Promise<void> {
    console.log(`[TriArb Execution] Cancelling position ${positionId}`);

    const position = await prisma.triangularArbitragePosition.findFirst({
      where: { positionId, userId },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    // TODO: Cancel any pending orders and reverse completed legs

    await prisma.triangularArbitragePosition.update({
      where: { id: position.id },
      data: {
        status: 'CANCELLED',
        errorMessage: 'Cancelled by user',
      },
    });

    console.log(`[TriArb Execution] Position ${positionId} cancelled`);
  }
}

// Export singleton instance
export const triangularArbitrageExecutionService = new TriangularArbitrageExecutionService();
