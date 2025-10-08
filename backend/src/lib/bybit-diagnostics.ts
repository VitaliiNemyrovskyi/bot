/**
 * Bybit API Diagnostics Utility
 *
 * Provides comprehensive diagnostic functions to troubleshoot
 * Bybit API integration issues, particularly for wallet balance.
 */

import { BybitService } from './bybit';
import { RestClientV5 } from 'bybit-api';

export interface DiagnosticResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  error?: string;
  timestamp: string;
}

export class BybitDiagnostics {
  /**
   * Run comprehensive diagnostics on Bybit API connection
   */
  static async runFullDiagnostics(
    apiKey: string,
    apiSecret: string,
    testnet: boolean = true
  ): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test 1: Validate credentials format
    results.push(await this.validateCredentialsFormat(apiKey, apiSecret));

    // Test 2: Test connectivity to Bybit API
    results.push(await this.testConnectivity(testnet));

    // Test 3: Verify API key authentication
    results.push(await this.testApiKeyAuth(apiKey, apiSecret, testnet));

    // Test 4: Check API key permissions
    results.push(await this.testApiKeyPermissions(apiKey, apiSecret, testnet));

    // Test 5: Test wallet balance endpoint
    results.push(await this.testWalletBalance(apiKey, apiSecret, testnet));

    // Test 6: Check account type compatibility
    results.push(await this.testAccountTypes(apiKey, apiSecret, testnet));

    return results;
  }

  /**
   * Validate API credentials format
   */
  private static async validateCredentialsFormat(
    apiKey: string,
    apiSecret: string
  ): Promise<DiagnosticResult> {
    const timestamp = new Date().toISOString();

    try {
      const issues: string[] = [];

      // Check if credentials are provided
      if (!apiKey || apiKey.trim() === '') {
        issues.push('API key is empty');
      }
      if (!apiSecret || apiSecret.trim() === '') {
        issues.push('API secret is empty');
      }

      // Check for whitespace
      if (apiKey !== apiKey.trim()) {
        issues.push('API key contains leading/trailing whitespace');
      }
      if (apiSecret !== apiSecret.trim()) {
        issues.push('API secret contains leading/trailing whitespace');
      }

      // Check minimum length
      if (apiKey.length < 10) {
        issues.push('API key appears too short (minimum 10 characters expected)');
      }
      if (apiSecret.length < 10) {
        issues.push('API secret appears too short (minimum 10 characters expected)');
      }

      if (issues.length > 0) {
        return {
          test: 'Credentials Format Validation',
          success: false,
          message: `Found ${issues.length} issue(s) with credentials format`,
          details: { issues },
          timestamp,
        };
      }

      return {
        test: 'Credentials Format Validation',
        success: true,
        message: 'API credentials format is valid',
        details: {
          apiKeyLength: apiKey.length,
          apiSecretLength: apiSecret.length,
        },
        timestamp,
      };
    } catch (error: any) {
      return {
        test: 'Credentials Format Validation',
        success: false,
        message: 'Failed to validate credentials format',
        error: error.message,
        timestamp,
      };
    }
  }

  /**
   * Test connectivity to Bybit API
   */
  private static async testConnectivity(testnet: boolean): Promise<DiagnosticResult> {
    const timestamp = new Date().toISOString();
    const baseUrl = testnet ? 'https://api-testnet.bybit.com' : 'https://api.bybit.com';

    try {
      const restClient = new RestClientV5({ testnet });

      // Test public endpoint (doesn't require authentication)
      const response = await restClient.getServerTime();

      if (response.retCode === 0) {
        const serverTime = new Date(response.time * 1000);
        const localTime = new Date();
        const timeDiff = Math.abs(serverTime.getTime() - localTime.getTime());

        return {
          test: 'API Connectivity',
          success: true,
          message: `Successfully connected to Bybit ${testnet ? 'testnet' : 'mainnet'}`,
          details: {
            baseUrl,
            serverTime: serverTime.toISOString(),
            localTime: localTime.toISOString(),
            timeDifferenceMs: timeDiff,
            timeDifferenceSeconds: (timeDiff / 1000).toFixed(2),
            timeInSync: timeDiff < 5000, // Within 5 seconds
          },
          timestamp,
        };
      } else {
        return {
          test: 'API Connectivity',
          success: false,
          message: 'Connected but received error response',
          details: {
            retCode: response.retCode,
            retMsg: response.retMsg,
          },
          timestamp,
        };
      }
    } catch (error: any) {
      return {
        test: 'API Connectivity',
        success: false,
        message: `Failed to connect to Bybit ${testnet ? 'testnet' : 'mainnet'}`,
        error: error.message,
        details: {
          baseUrl,
          errorCode: error.code,
        },
        timestamp,
      };
    }
  }

  /**
   * Test API key authentication
   */
  private static async testApiKeyAuth(
    apiKey: string,
    apiSecret: string,
    testnet: boolean
  ): Promise<DiagnosticResult> {
    const timestamp = new Date().toISOString();

    try {
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      // Try to fetch API key info (requires authentication)
      const keyInfo = await bybitService.getApiKeyInfo();

      return {
        test: 'API Key Authentication',
        success: true,
        message: 'API key authentication successful',
        details: {
          apiKeyId: keyInfo.id,
          note: keyInfo.note,
          readOnly: keyInfo.readOnly === 1,
          type: keyInfo.type === 1 ? 'Personal' : 'Third-party app',
          unified: keyInfo.unified === 1,
          uta: keyInfo.uta === 1,
          vipLevel: keyInfo.vipLevel,
          expiresAt: new Date(parseInt(keyInfo.expiredAt)).toISOString(),
        },
        timestamp,
      };
    } catch (error: any) {
      let errorMessage = 'Authentication failed';
      let errorCode = 'UNKNOWN';

      if (error.retCode === 10003) {
        errorMessage = 'Invalid API key';
        errorCode = 'INVALID_API_KEY';
      } else if (error.retCode === 10004) {
        errorMessage = 'Invalid signature (check API secret)';
        errorCode = 'INVALID_SIGNATURE';
      } else if (error.retCode === 10002) {
        errorMessage = 'Timestamp error (system time may be out of sync)';
        errorCode = 'TIMESTAMP_ERROR';
      }

      return {
        test: 'API Key Authentication',
        success: false,
        message: errorMessage,
        error: error.message,
        details: {
          retCode: error.retCode,
          retMsg: error.retMsg,
          errorCode,
        },
        timestamp,
      };
    }
  }

  /**
   * Test API key permissions
   */
  private static async testApiKeyPermissions(
    apiKey: string,
    apiSecret: string,
    testnet: boolean
  ): Promise<DiagnosticResult> {
    const timestamp = new Date().toISOString();

    try {
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      const keyInfo = await bybitService.getApiKeyInfo();

      // Check for required permissions
      const walletPermissions = keyInfo.permissions.Wallet || [];
      const hasWalletRead = walletPermissions.length > 0;

      const issues: string[] = [];
      if (!hasWalletRead) {
        issues.push('Missing Wallet permissions (required for wallet balance)');
      }
      if (keyInfo.readOnly !== 1 && keyInfo.readOnly !== 0) {
        issues.push('Read-only status is unclear');
      }

      const allPermissions: Record<string, string[]> = {};
      Object.entries(keyInfo.permissions).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          allPermissions[key] = value;
        }
      });

      if (issues.length > 0) {
        return {
          test: 'API Key Permissions',
          success: false,
          message: `Found ${issues.length} permission issue(s)`,
          details: {
            issues,
            currentPermissions: allPermissions,
            readOnly: keyInfo.readOnly === 1,
          },
          timestamp,
        };
      }

      return {
        test: 'API Key Permissions',
        success: true,
        message: 'API key has sufficient permissions',
        details: {
          readOnly: keyInfo.readOnly === 1,
          permissions: allPermissions,
          walletPermissions,
        },
        timestamp,
      };
    } catch (error: any) {
      return {
        test: 'API Key Permissions',
        success: false,
        message: 'Failed to check API key permissions',
        error: error.message,
        details: {
          retCode: error.retCode,
          retMsg: error.retMsg,
        },
        timestamp,
      };
    }
  }

  /**
   * Test wallet balance endpoint
   */
  private static async testWalletBalance(
    apiKey: string,
    apiSecret: string,
    testnet: boolean
  ): Promise<DiagnosticResult> {
    const timestamp = new Date().toISOString();

    try {
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      const balance = await bybitService.getWalletBalance('UNIFIED');

      if (!balance || !balance.list || balance.list.length === 0) {
        return {
          test: 'Wallet Balance',
          success: false,
          message: 'Wallet balance response is empty (no UNIFIED account found)',
          details: {
            responseStructure: balance,
          },
          timestamp,
        };
      }

      const account = balance.list[0];
      const coinsWithBalance = account.coin?.filter(
        (c: any) => parseFloat(c.walletBalance || '0') > 0
      ) || [];

      return {
        test: 'Wallet Balance',
        success: true,
        message: 'Successfully retrieved wallet balance',
        details: {
          accountType: account.accountType,
          totalEquity: account.totalEquity,
          totalWalletBalance: account.totalWalletBalance,
          totalAvailableBalance: account.totalAvailableBalance,
          numberOfCoins: account.coin?.length || 0,
          coinsWithBalance: coinsWithBalance.length,
          topCoins: coinsWithBalance.slice(0, 5).map((c: any) => ({
            coin: c.coin,
            balance: c.walletBalance,
            usdValue: c.usdValue,
          })),
        },
        timestamp,
      };
    } catch (error: any) {
      let errorMessage = 'Failed to retrieve wallet balance';

      if (error.retCode === 33004) {
        errorMessage = 'API key does not have wallet permission';
      } else if (error.retCode === 110001) {
        errorMessage = 'Invalid account type or account does not exist';
      }

      return {
        test: 'Wallet Balance',
        success: false,
        message: errorMessage,
        error: error.message,
        details: {
          retCode: error.retCode,
          retMsg: error.retMsg,
        },
        timestamp,
      };
    }
  }

  /**
   * Test different account types
   */
  private static async testAccountTypes(
    apiKey: string,
    apiSecret: string,
    testnet: boolean
  ): Promise<DiagnosticResult> {
    const timestamp = new Date().toISOString();

    try {
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      const accountTypes: Array<'UNIFIED' | 'CONTRACT'> = ['UNIFIED', 'CONTRACT'];
      const results: Record<string, any> = {};

      for (const accountType of accountTypes) {
        try {
          const balance = await bybitService.getWalletBalance(accountType);
          results[accountType] = {
            available: true,
            hasData: balance.list && balance.list.length > 0,
            totalEquity: balance.list?.[0]?.totalEquity || '0',
          };
        } catch (error: any) {
          results[accountType] = {
            available: false,
            error: error.message,
            retCode: error.retCode,
          };
        }

        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const availableAccounts = Object.entries(results)
        .filter(([_, value]) => value.available)
        .map(([key]) => key);

      return {
        test: 'Account Type Compatibility',
        success: availableAccounts.length > 0,
        message: `Found ${availableAccounts.length} available account type(s)`,
        details: {
          accountTypes: results,
          availableAccounts,
          recommendation:
            availableAccounts.length > 0
              ? `Use account type: ${availableAccounts[0]}`
              : 'No compatible account types found',
        },
        timestamp,
      };
    } catch (error: any) {
      return {
        test: 'Account Type Compatibility',
        success: false,
        message: 'Failed to test account type compatibility',
        error: error.message,
        timestamp,
      };
    }
  }

  /**
   * Generate diagnostic report as formatted string
   */
  static formatDiagnosticReport(results: DiagnosticResult[]): string {
    let report = '\n═══════════════════════════════════════════════════════\n';
    report += '           Bybit API Diagnostic Report\n';
    report += '═══════════════════════════════════════════════════════\n\n';

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    report += `Summary: ${passed} passed, ${failed} failed (${results.length} total)\n`;
    report += `Timestamp: ${new Date().toISOString()}\n\n`;

    results.forEach((result, index) => {
      const icon = result.success ? '✓' : '✗';
      const status = result.success ? 'PASS' : 'FAIL';

      report += `${index + 1}. [${status}] ${icon} ${result.test}\n`;
      report += `   ${result.message}\n`;

      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }

      if (result.details) {
        report += `   Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n   ')}\n`;
      }

      report += '\n';
    });

    report += '═══════════════════════════════════════════════════════\n';

    // Add recommendations
    const failedTests = results.filter((r) => !r.success);
    if (failedTests.length > 0) {
      report += '\nRecommendations:\n';
      failedTests.forEach((test, index) => {
        report += `${index + 1}. ${test.test}: ${this.getRecommendation(test)}\n`;
      });
      report += '\n';
    }

    return report;
  }

  /**
   * Get recommendation based on failed test
   */
  private static getRecommendation(result: DiagnosticResult): string {
    const testName = result.test.toLowerCase();

    if (testName.includes('credentials format')) {
      return 'Verify API key and secret are correct and contain no whitespace';
    } else if (testName.includes('connectivity')) {
      return 'Check network connection and firewall settings';
    } else if (testName.includes('authentication')) {
      return 'Verify API key is valid and belongs to correct environment (testnet/mainnet)';
    } else if (testName.includes('permissions')) {
      return 'Enable Wallet and Account Info permissions on API key in Bybit settings';
    } else if (testName.includes('wallet balance')) {
      return 'Ensure account type is correct and API key has wallet permissions';
    } else if (testName.includes('account type')) {
      return 'Use the recommended account type or upgrade to UTA (Unified Trading Account)';
    }

    return 'Review error details and consult troubleshooting guide';
  }

  /**
   * Quick health check - returns true if all critical tests pass
   */
  static async quickHealthCheck(
    apiKey: string,
    apiSecret: string,
    testnet: boolean = true
  ): Promise<boolean> {
    try {
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      // Try to fetch wallet balance - if this works, everything is good
      const balance = await bybitService.getWalletBalance('UNIFIED');
      return !!(balance && balance.list && balance.list.length > 0);
    } catch {
      return false;
    }
  }
}
