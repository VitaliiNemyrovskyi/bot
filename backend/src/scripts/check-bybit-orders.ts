import { PrismaClient } from '@prisma/client';
import { BybitService } from '../lib/bybit';

const prisma = new PrismaClient();

async function checkBybitOrders() {
  try {
    // Get the user's Bybit credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BYBIT',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!credentials) {
      console.log('No Bybit credentials found');
      return;
    }

    console.log(`Using Bybit credentials: ${credentials.label || credentials.id}`);
    console.log('');

    // Create Bybit service
    const bybit = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      userId: credentials.userId
    });

    // Get order history for PIGGYUSDT
    console.log('Fetching PIGGYUSDT order history...');
    const orders = await bybit.getOrderHistory('linear', 'PIGGYUSDT', 50);

    console.log(`\nFound ${orders.length} orders:\n`);
    console.log('═'.repeat(120));

    orders.forEach((order, index) => {
      const createdDate = new Date(parseInt(order.createdTime));
      const updatedDate = new Date(parseInt(order.updatedTime));
      
      console.log(`\nOrder #${index + 1}:`);
      console.log(`  Order ID: ${order.orderId}`);
      console.log(`  Side: ${order.side}`);
      console.log(`  Type: ${order.orderType}`);
      console.log(`  Quantity: ${order.qty}`);
      console.log(`  Price: ${order.price}`);
      console.log(`  Avg Fill Price: ${order.avgPrice}`);
      console.log(`  Status: ${order.orderStatus}`);
      console.log(`  Filled Qty: ${order.cumExecQty}`);
      console.log(`  Filled Value: ${order.cumExecValue}`);
      console.log(`  Fee: ${order.cumExecFee}`);
      console.log(`  Created: ${createdDate.toLocaleString()}`);
      console.log(`  Updated: ${updatedDate.toLocaleString()}`);
      console.log('─'.repeat(120));
    });

    // Get current position to see if it exists
    console.log('\nChecking current PIGGYUSDT position...');
    const position = await bybit.getPosition('linear', 'PIGGYUSDT');
    
    if (position && parseFloat(position.size) > 0) {
      console.log('\nCurrent Position:');
      console.log(`  Symbol: ${position.symbol}`);
      console.log(`  Side: ${position.side}`);
      console.log(`  Size: ${position.size}`);
      console.log(`  Entry Price: ${position.entryPrice}`);
      console.log(`  Mark Price: ${position.markPrice}`);
      console.log(`  Liquidation Price: ${position.liqPrice}`);
      console.log(`  Take Profit: ${position.takeProfit}`);
      console.log(`  Stop Loss: ${position.stopLoss}`);
      console.log(`  Unrealized PnL: ${position.unrealisedPnl}`);
    } else {
      console.log('\n⚠️ NO ACTIVE POSITION FOUND - Position was closed');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBybitOrders();
