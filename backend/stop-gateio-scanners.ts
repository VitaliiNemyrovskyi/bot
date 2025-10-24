/**
 * Stop all Gate.io scanners
 */

import { OpportunityDetectionService } from './src/services/triangular-arbitrage-opportunity.service';

async function stopGateioScanners() {
  console.log('🛑 Stopping all Gate.io scanners...\n');

  try {
    // Get all active instances
    const allInstances = OpportunityDetectionService.getAllInstances();

    console.log(`Total exchange instances: ${allInstances.size}`);

    for (const [exchange, manager] of allInstances.entries()) {
      console.log(`- ${exchange}: ${manager.getStatus().isScanning ? 'SCANNING' : 'STOPPED'}`);
    }

    console.log('\n📊 Checking all users...');

    // Since we don't have direct access to all user IDs, we need to iterate through instances
    // The OpportunityDetectionService stores instances as Map<userId, Map<exchange, scanner>>
    // But we only have access to getAllInstances which returns Map<exchange, scanner>

    // Let's try a different approach - directly access the private static instances
    const instancesMap = (OpportunityDetectionService as any).instances;

    if (instancesMap && instancesMap instanceof Map) {
      console.log(`Found ${instancesMap.size} user(s) with active scanners\n`);

      for (const [userId, userExchanges] of instancesMap.entries()) {
        console.log(`User: ${userId}`);

        if (userExchanges instanceof Map) {
          for (const [exchange, scanner] of userExchanges.entries()) {
            const status = scanner.getStatus();
            console.log(`  - ${exchange}: ${status.isScanning ? 'SCANNING' : 'STOPPED'}`);

            // Stop Gate.io scanners
            if (exchange.toUpperCase() === 'GATEIO' || exchange.toUpperCase() === 'GATE') {
              console.log(`  🛑 Stopping Gate.io scanner for user ${userId}...`);
              await OpportunityDetectionService.cleanup(userId, exchange);
              console.log(`  ✅ Stopped successfully`);
            }
          }
        }
      }
    }

    console.log('\n✨ All Gate.io scanners stopped!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

stopGateioScanners();
