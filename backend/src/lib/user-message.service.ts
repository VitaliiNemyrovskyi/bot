import { PrismaClient, MessageType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMessageInput {
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  actions?: any;
  metadata?: any;
}

/**
 * User Message Service
 *
 * Manages user notifications and messages
 */
export class UserMessageService {
  /**
   * Create a new message for a user
   */
  static async createMessage(input: CreateMessageInput): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          content: input.content,
          actions: input.actions || null,
          metadata: input.metadata || null,
          read: false,
        },
      });

      console.log(`[UserMessage] Message created for user ${input.userId}: ${input.title}`);
    } catch (error: any) {
      console.error(`[UserMessage] Failed to create message:`, error.message);
      // Don't throw - message creation should not break the main flow
    }
  }

  /**
   * Create a position closed message
   */
  static async createPositionClosedMessage(
    userId: string,
    positionId: string,
    reason: string,
    symbol: string,
    isEmergency: boolean = false
  ): Promise<void> {
    const title = isEmergency
      ? `🚨 Emergency Position Closure`
      : `Position Closed`;

    const content = isEmergency
      ? `Your arbitrage position ${positionId} for ${symbol} was automatically closed due to: ${reason}`
      : `Your arbitrage position ${positionId} for ${symbol} has been closed. Reason: ${reason}`;

    await this.createMessage({
      userId,
      type: isEmergency ? MessageType.WARNING : MessageType.INFO,
      title,
      content,
      metadata: {
        positionId,
        symbol,
        reason,
        isEmergency,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a position error message
   */
  static async createPositionErrorMessage(
    userId: string,
    positionId: string,
    error: string,
    symbol: string
  ): Promise<void> {
    await this.createMessage({
      userId,
      type: MessageType.ERROR,
      title: `❌ Position Error`,
      content: `Error occurred for position ${positionId} (${symbol}): ${error}`,
      metadata: {
        positionId,
        symbol,
        error,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a liquidation warning message
   */
  static async createLiquidationWarningMessage(
    userId: string,
    positionId: string,
    symbol: string,
    liquidationRisk: number
  ): Promise<void> {
    await this.createMessage({
      userId,
      type: MessageType.WARNING,
      title: `⚠️ Liquidation Warning`,
      content: `Your position ${positionId} for ${symbol} is approaching liquidation (${liquidationRisk.toFixed(2)}% risk). Consider closing or adjusting the position.`,
      actions: [
        {
          label: 'Close Position',
          type: 'close_position',
          positionId,
        },
        {
          label: 'View Details',
          type: 'view_position',
          positionId,
        },
      ],
      metadata: {
        positionId,
        symbol,
        liquidationRisk,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a trade success message
   */
  static async createTradeSuccessMessage(
    userId: string,
    positionId: string,
    symbol: string,
    profit: number
  ): Promise<void> {
    const isProfit = profit > 0;
    const title = isProfit
      ? `✅ Position Closed with Profit`
      : `Position Closed`;

    const content = isProfit
      ? `Your arbitrage position ${positionId} for ${symbol} was closed with a profit of ${profit.toFixed(2)} USDT`
      : `Your arbitrage position ${positionId} for ${symbol} was closed with a result of ${profit.toFixed(2)} USDT`;

    await this.createMessage({
      userId,
      type: isProfit ? MessageType.SUCCESS : MessageType.INFO,
      title,
      content,
      metadata: {
        positionId,
        symbol,
        profit,
        timestamp: new Date().toISOString(),
      },
    });
  }
}