import { BybitService, bybitService } from './bybit';

/**
 * Examples demonstrating the new user information fetching functionality
 * This file shows how to use all the new user-related methods in the Bybit service
 */

/**
 * Example 1: Get API Key Information
 * This retrieves detailed information about your API key including permissions,
 * expiration date, and configuration
 */
async function getApiKeyInfoExample() {
  try {
    console.log('\n=== API Key Information ===');

    const apiKeyInfo = await bybitService.getApiKeyInfo();

    console.log('API Key:', apiKeyInfo.apiKey);
    console.log('Read Only:', apiKeyInfo.readOnly === 1 ? 'Yes' : 'No');
    console.log('Type:', apiKeyInfo.type === 1 ? 'Personal' : 'Third-party App');
    console.log('Unified Trading Account:', apiKeyInfo.uta === 1 ? 'Yes' : 'No');
    console.log('Is Master Account:', apiKeyInfo.isMaster ? 'Yes' : 'No');
    console.log('VIP Level:', apiKeyInfo.vipLevel);
    console.log('Created At:', new Date(parseInt(apiKeyInfo.createdAt)).toLocaleString());
    console.log('Expires At:', new Date(parseInt(apiKeyInfo.expiredAt)).toLocaleString());
    console.log('Days Remaining:', apiKeyInfo.deadlineDay);

    console.log('\nPermissions:');
    if (apiKeyInfo.permissions.ContractTrade) {
      console.log('  - Contract Trade:', apiKeyInfo.permissions.ContractTrade.join(', '));
    }
    if (apiKeyInfo.permissions.Spot) {
      console.log('  - Spot:', apiKeyInfo.permissions.Spot.join(', '));
    }
    if (apiKeyInfo.permissions.Wallet) {
      console.log('  - Wallet:', apiKeyInfo.permissions.Wallet.join(', '));
    }
    if (apiKeyInfo.permissions.Options) {
      console.log('  - Options:', apiKeyInfo.permissions.Options.join(', '));
    }

  } catch (error) {
    console.error('Error fetching API key info:', error);
  }
}

/**
 * Example 2: Get User Account Information
 * This retrieves account configuration including margin mode and trading settings
 */
async function getUserAccountInfoExample() {
  try {
    console.log('\n=== User Account Information ===');

    const accountInfo = await bybitService.getUserAccountInfo();

    console.log('Margin Mode:', accountInfo.marginMode);
    console.log('Unified Margin Status:', accountInfo.unifiedMarginStatus);
    console.log('Is Master Trader (Copy Trading):', accountInfo.isMasterTrader ? 'Yes' : 'No');
    console.log('Spot Hedging Status:', accountInfo.spotHedgingStatus);
    console.log('Last Updated:', new Date(parseInt(accountInfo.updatedTime)).toLocaleString());

  } catch (error) {
    console.error('Error fetching user account info:', error);
  }
}

/**
 * Example 3: Get Detailed Wallet Balance
 * This retrieves comprehensive wallet balance information for all coins
 */
async function getDetailedWalletBalanceExample() {
  try {
    console.log('\n=== Detailed Wallet Balance ===');

    const walletBalance = await bybitService.getDetailedWalletBalance('UNIFIED');

    console.log('Account Type:', walletBalance.accountType);
    console.log('Total Equity:', walletBalance.totalEquity);
    console.log('Total Wallet Balance:', walletBalance.totalWalletBalance);
    console.log('Total Available Balance:', walletBalance.totalAvailableBalance);
    console.log('Total Margin Balance:', walletBalance.totalMarginBalance);
    console.log('Total Initial Margin:', walletBalance.totalInitialMargin);
    console.log('Total Maintenance Margin:', walletBalance.totalMaintenanceMargin);
    console.log('Total Unrealized PnL:', walletBalance.totalPerpUPL);
    console.log('Account LTV:', walletBalance.accountLTV);

    console.log('\nCoin Balances:');
    walletBalance.coin.forEach(coin => {
      if (parseFloat(coin.walletBalance) > 0) {
        console.log(`\n  ${coin.coin}:`);
        console.log(`    Wallet Balance: ${coin.walletBalance}`);
        console.log(`    Available: ${coin.free}`);
        console.log(`    Locked: ${coin.locked}`);
        console.log(`    USD Value: $${coin.usdValue}`);
        console.log(`    Equity: ${coin.equity}`);
        console.log(`    Unrealized PnL: ${coin.unrealisedPnl}`);
        console.log(`    Cumulative Realized PnL: ${coin.cumRealisedPnl}`);
      }
    });

  } catch (error) {
    console.error('Error fetching detailed wallet balance:', error);
  }
}

/**
 * Example 4: Get Fee Rates
 * This retrieves trading fee rates for specified symbols or categories
 */
async function getFeeRatesExample() {
  try {
    console.log('\n=== Trading Fee Rates ===');

    // Get fee rates for linear (perpetual) trading
    const linearFeeRates = await bybitService.getFeeRate('linear', 'BTCUSDT');

    console.log('Linear Trading Fee Rates:');
    linearFeeRates.forEach(fee => {
      console.log(`  ${fee.symbol}:`);
      console.log(`    Maker Fee: ${parseFloat(fee.makerFeeRate) * 100}%`);
      console.log(`    Taker Fee: ${parseFloat(fee.takerFeeRate) * 100}%`);
    });

    // Get fee rates for spot trading
    const spotFeeRates = await bybitService.getFeeRate('spot', 'BTCUSDT');

    console.log('\nSpot Trading Fee Rates:');
    spotFeeRates.forEach(fee => {
      console.log(`  ${fee.symbol}:`);
      console.log(`    Maker Fee: ${parseFloat(fee.makerFeeRate) * 100}%`);
      console.log(`    Taker Fee: ${parseFloat(fee.takerFeeRate) * 100}%`);
    });

  } catch (error) {
    console.error('Error fetching fee rates:', error);
  }
}

/**
 * Example 5: Get Complete User Profile
 * This is a convenience method that fetches all user information in parallel
 */
async function getUserProfileExample() {
  try {
    console.log('\n=== Complete User Profile ===');

    const userProfile = await bybitService.getUserProfile();

    // API Key Info
    if (userProfile.apiKeyInfo) {
      console.log('\nAPI Key:');
      console.log('  Key:', userProfile.apiKeyInfo.apiKey);
      console.log('  Type:', userProfile.apiKeyInfo.type === 1 ? 'Personal' : 'Third-party');
      console.log('  Read Only:', userProfile.apiKeyInfo.readOnly === 1 ? 'Yes' : 'No');
      console.log('  VIP Level:', userProfile.apiKeyInfo.vipLevel);
    }

    // Account Info
    if (userProfile.accountInfo) {
      console.log('\nAccount Configuration:');
      console.log('  Margin Mode:', userProfile.accountInfo.marginMode);
      console.log('  Master Trader:', userProfile.accountInfo.isMasterTrader ? 'Yes' : 'No');
      console.log('  Spot Hedging:', userProfile.accountInfo.spotHedgingStatus);
    }

    // Wallet Balance
    if (userProfile.walletBalance) {
      console.log('\nWallet Summary:');
      console.log('  Total Equity:', userProfile.walletBalance.totalEquity);
      console.log('  Available Balance:', userProfile.walletBalance.totalAvailableBalance);
      console.log('  Unrealized PnL:', userProfile.walletBalance.totalPerpUPL);

      const nonZeroCoins = userProfile.walletBalance.coin.filter(c => parseFloat(c.walletBalance) > 0);
      console.log(`  Active Coins: ${nonZeroCoins.length}`);
    }

    // Fee Rates
    if (userProfile.feeRates && userProfile.feeRates.length > 0) {
      console.log('\nFee Rates:');
      userProfile.feeRates.slice(0, 3).forEach(fee => {
        console.log(`  ${fee.symbol}: Maker ${parseFloat(fee.makerFeeRate) * 100}%, Taker ${parseFloat(fee.takerFeeRate) * 100}%`);
      });
    }

  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

/**
 * Example 6: Check API Key Permissions
 * This demonstrates how to check if your API key has specific permissions
 */
async function checkPermissionsExample() {
  try {
    console.log('\n=== Checking API Key Permissions ===');

    const hasContractTrade = await bybitService.hasPermission('ContractTrade', 'Order');
    console.log('Has Contract Trading Permission:', hasContractTrade ? 'Yes' : 'No');

    const hasSpotTrade = await bybitService.hasPermission('Spot', 'SpotTrade');
    console.log('Has Spot Trading Permission:', hasSpotTrade ? 'Yes' : 'No');

    const hasWalletTransfer = await bybitService.hasPermission('Wallet', 'AccountTransfer');
    console.log('Has Wallet Transfer Permission:', hasWalletTransfer ? 'Yes' : 'No');

  } catch (error) {
    console.error('Error checking permissions:', error);
  }
}

/**
 * Example 7: Check API Key Expiration
 * This demonstrates how to check when your API key expires
 */
async function checkApiKeyExpirationExample() {
  try {
    console.log('\n=== API Key Expiration Info ===');

    const expiration = await bybitService.getApiKeyExpiration();

    console.log('Days Remaining:', expiration.daysRemaining);
    console.log('Expires At:', new Date(parseInt(expiration.expiresAt)).toLocaleString());
    console.log('Is Expiring Soon (< 30 days):', expiration.isExpiringSoon ? 'YES - Please renew!' : 'No');

    if (expiration.isExpiringSoon) {
      console.warn('\nWARNING: Your API key will expire soon. Please create a new one to avoid service interruption.');
    }

  } catch (error) {
    console.error('Error checking API key expiration:', error);
  }
}

/**
 * Example 8: Create a custom instance with specific configuration
 */
async function customInstanceExample() {
  try {
    console.log('\n=== Custom Bybit Instance ===');

    // Create a custom instance for a specific testnet account
    const customBybit = new BybitService({
      apiKey: process.env.BYBIT_TESTNET_API_KEY,
      apiSecret: process.env.BYBIT_TESTNET_API_SECRET,
      testnet: true,
      enableRateLimit: true
    });

    if (customBybit.hasCredentials()) {
      const profile = await customBybit.getUserProfile();
      console.log('Custom instance connected successfully');
      console.log('Testnet:', customBybit.isTestnet());
      if (profile.walletBalance) {
        console.log('Total Equity:', profile.walletBalance.totalEquity);
      }
    } else {
      console.log('Custom instance created but credentials not provided');
    }

  } catch (error) {
    console.error('Error with custom instance:', error);
  }
}

/**
 * Example 9: Get specific coin balance
 * Demonstrates how to get balance for a specific coin
 */
async function getSpecificCoinBalanceExample() {
  try {
    console.log('\n=== Specific Coin Balance ===');

    // Get balance for USDT only
    const usdtBalance = await bybitService.getDetailedWalletBalance('UNIFIED', 'USDT');

    const usdtCoin = usdtBalance.coin.find(c => c.coin === 'USDT');
    if (usdtCoin) {
      console.log('USDT Balance Information:');
      console.log('  Wallet Balance:', usdtCoin.walletBalance);
      console.log('  Available:', usdtCoin.free);
      console.log('  Locked:', usdtCoin.locked);
      console.log('  USD Value:', usdtCoin.usdValue);
      console.log('  Available to Withdraw:', usdtCoin.availableToWithdraw);
      console.log('  Available to Borrow:', usdtCoin.availableToBorrow);
    } else {
      console.log('USDT balance not found');
    }

  } catch (error) {
    console.error('Error fetching specific coin balance:', error);
  }
}

/**
 * Example 10: Monitor account health
 * Demonstrates a practical use case for monitoring account health
 */
async function monitorAccountHealthExample() {
  try {
    console.log('\n=== Account Health Monitoring ===');

    const [walletBalance, accountInfo, apiKeyExpiration] = await Promise.all([
      bybitService.getDetailedWalletBalance('UNIFIED'),
      bybitService.getUserAccountInfo(),
      bybitService.getApiKeyExpiration()
    ]);

    // Calculate account health metrics
    const totalEquity = parseFloat(walletBalance.totalEquity);
    const availableBalance = parseFloat(walletBalance.totalAvailableBalance);
    const usedMargin = parseFloat(walletBalance.totalInitialMargin);
    const maintenanceMargin = parseFloat(walletBalance.totalMaintenanceMargin);
    const unrealizedPnl = parseFloat(walletBalance.totalPerpUPL);

    const marginUsagePercent = totalEquity > 0 ? (usedMargin / totalEquity) * 100 : 0;
    const availablePercent = totalEquity > 0 ? (availableBalance / totalEquity) * 100 : 0;

    console.log('Account Health Report:');
    console.log('  Total Equity: $' + totalEquity.toFixed(2));
    console.log('  Available Balance: $' + availableBalance.toFixed(2) + ` (${availablePercent.toFixed(2)}%)`);
    console.log('  Used Margin: $' + usedMargin.toFixed(2) + ` (${marginUsagePercent.toFixed(2)}%)`);
    console.log('  Maintenance Margin: $' + maintenanceMargin.toFixed(2));
    console.log('  Unrealized PnL: $' + unrealizedPnl.toFixed(2));
    console.log('  Margin Mode:', accountInfo.marginMode);

    // Risk assessment
    console.log('\nRisk Assessment:');
    if (marginUsagePercent > 80) {
      console.warn('  HIGH RISK: Margin usage is very high (>80%)');
    } else if (marginUsagePercent > 60) {
      console.warn('  MEDIUM RISK: Margin usage is elevated (>60%)');
    } else {
      console.log('  LOW RISK: Margin usage is healthy');
    }

    if (apiKeyExpiration.isExpiringSoon) {
      console.warn('  WARNING: API key expiring in ' + apiKeyExpiration.daysRemaining + ' days');
    }

    if (unrealizedPnl < 0 && Math.abs(unrealizedPnl) > totalEquity * 0.1) {
      console.warn('  WARNING: Unrealized losses exceed 10% of equity');
    }

  } catch (error) {
    console.error('Error monitoring account health:', error);
  }
}

// Main execution function
async function runAllExamples() {
  if (!bybitService.hasCredentials()) {
    console.log('========================================');
    console.log('Bybit API Credentials Not Configured');
    console.log('========================================');
    console.log('Please add the following to your .env file:');
    console.log('  BYBIT_API_KEY=your_api_key');
    console.log('  BYBIT_API_SECRET=your_api_secret');
    console.log('\nNote: These examples will work with both testnet and mainnet credentials.');
    return;
  }

  console.log('========================================');
  console.log('Bybit User Information Examples');
  console.log('========================================');
  console.log(`Environment: ${bybitService.isTestnet() ? 'TESTNET' : 'MAINNET'}`);

  try {
    // Run all examples
    await getApiKeyInfoExample();
    await getUserAccountInfoExample();
    await getDetailedWalletBalanceExample();
    await getFeeRatesExample();
    await getUserProfileExample();
    await checkPermissionsExample();
    await checkApiKeyExpirationExample();
    await getSpecificCoinBalanceExample();
    await monitorAccountHealthExample();

    console.log('\n========================================');
    console.log('All examples completed successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('\nError running examples:', error);
  }
}

// Export examples for individual use
export {
  getApiKeyInfoExample,
  getUserAccountInfoExample,
  getDetailedWalletBalanceExample,
  getFeeRatesExample,
  getUserProfileExample,
  checkPermissionsExample,
  checkApiKeyExpirationExample,
  customInstanceExample,
  getSpecificCoinBalanceExample,
  monitorAccountHealthExample,
  runAllExamples
};

// Run all examples if this file is executed directly
if (require.main === module) {
  runAllExamples()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
