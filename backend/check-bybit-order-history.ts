import prisma from './src/lib/prisma';
import { BybitService } from './src/lib/bybit';
import { EncryptionService } from './src/lib/encryption';

async function checkHistory() {
  console.log('📜 Checking Bybit order history for AIAUSDT...\n');

  const user = await prisma.user.findFirst();
  if (!user) return;

  const bybitCreds = await prisma.exchangeCredentials.findFirst({
    where: { userId: user.id, exchange: 'BYBIT' },
  });

  if (!bybitCreds || !bybitCreds.apiKey || !bybitCreds.apiSecret) {
    console.log('No Bybit credentials found');
    return;
  }

  try {
    const apiKey = EncryptionService.decrypt(bybitCreds.apiKey);
    const apiSecret = EncryptionService.decrypt(bybitCreds.apiSecret);
    const bybit = new BybitService({ apiKey, apiSecret });

    // Get recent orders
    console.log('=== RECENT ORDERS ===');
    const orders = await bybit.getOrderHistory('linear', 'AIAUSDT', 20);

    if (orders.length === 0) {
      console.log('No orders found\n');
    } else {
      orders.slice(0, 10).forEach((order: any) => {
        console.log(`\n${order.side} ${order.orderType} - ${order.orderStatus}`);
        console.log(`  Qty: ${order.qty} @ ${order.price || 'Market'}`);
        console.log(`  Filled: ${order.cumExecQty} @ avg ${order.avgPrice}`);
        console.log(`  Time: ${new Date(parseInt(order.createdTime)).toLocaleString()}`);
        console.log(`  Order ID: ${order.orderId}`);
        if (order.reduceOnly) console.log(`  🔻 REDUCE ONLY (closing position)`);
      });
    }

    // Get execution history
    console.log('\n\n=== RECENT EXECUTIONS ===');
    const executions = await bybit.getExecutionList({
      category: 'linear',
      symbol: 'AIAUSDT',
      limit: 20,
    });

    if (executions.list && executions.list.length > 0) {
      executions.list.slice(0, 10).forEach((exec: any) => {
        console.log(`\n${exec.side} ${exec.execType}`);
        console.log(`  Qty: ${exec.execQty} @ $${exec.execPrice}`);
        console.log(`  Fee: ${exec.execFee} ${exec.feeRate}`);
        console.log(`  Time: ${new Date(parseInt(exec.execTime)).toLocaleString()}`);
        console.log(`  Order ID: ${exec.orderId}`);
      });
    }

    // Get closed PnL
    console.log('\n\n=== CLOSED POSITIONS (Recent) ===');
    const closedPnL = await bybit.getClosedPnL({
      category: 'linear',
      symbol: 'AIAUSDT',
      limit: 5,
    });

    if (closedPnL.list && closedPnL.list.length > 0) {
      closedPnL.list.forEach((pnl: any) => {
        console.log(`\n${pnl.symbol} - Closed`);
        console.log(`  Size: ${pnl.closedSize}`);
        console.log(`  Entry: $${pnl.avgEntryPrice}`);
        console.log(`  Exit: $${pnl.avgExitPrice}`);
        console.log(`  PnL: ${pnl.closedPnl}`);
        console.log(`  Time: ${new Date(parseInt(pnl.createdTime)).toLocaleString()}`);
      });
    } else {
      console.log('No closed positions found');
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  }

  await prisma.$disconnect();
}

checkHistory().catch(console.error);
