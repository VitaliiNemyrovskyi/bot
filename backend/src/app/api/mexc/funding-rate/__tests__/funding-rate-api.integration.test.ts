/**
 * MEXC Funding Rate API Integration Tests
 *
 * These tests verify that the /api/mexc/funding-rate/:symbol endpoint
 * correctly retrieves funding intervals from MEXC API.
 *
 * Run with: npm test funding-rate-api.integration.test.ts
 */

import { describe, it, expect } from '@jest/globals';

describe('MEXC Funding Rate API - Integration Tests', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  /**
   * Test SHELL/USDT has 4h interval (known from manual verification)
   */
  it('should return 4h interval for SHELL_USDT', async () => {
    const response = await fetch(`${BASE_URL}/api/mexc/funding-rate/SHELL_USDT`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.symbol).toBe('SHELL_USDT');
    expect(data.collectCycle).toBe(4);
    expect(data.fundingInterval).toBe('4h');
    expect(data.nextSettleTime).toBeGreaterThan(Date.now());
    expect(typeof data.fundingRate).toBe('number');

    console.log('✓ SHELL_USDT:', {
      interval: data.fundingInterval,
      collectCycle: data.collectCycle,
      nextSettleTime: new Date(data.nextSettleTime).toISOString(),
    });
  }, 30000); // 30s timeout for API call

  /**
   * Test BTC/USDT has 8h interval (most common)
   */
  it('should return 8h interval for BTC_USDT', async () => {
    const response = await fetch(`${BASE_URL}/api/mexc/funding-rate/BTC_USDT`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.symbol).toBe('BTC_USDT');
    expect(data.collectCycle).toBe(8);
    expect(data.fundingInterval).toBe('8h');
    expect(data.nextSettleTime).toBeGreaterThan(Date.now());

    console.log('✓ BTC_USDT:', {
      interval: data.fundingInterval,
      collectCycle: data.collectCycle,
    });
  }, 30000);

  /**
   * Test that different symbols return different intervals
   */
  it('should demonstrate that intervals vary by symbol', async () => {
    const symbols = [
      'SHELL_USDT', // Known 4h
      'BTC_USDT',   // Known 8h
      'ETH_USDT',   // Likely 8h
    ];

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(`${BASE_URL}/api/mexc/funding-rate/${symbol}`);
        const data = await response.json();
        return {
          symbol,
          collectCycle: data.collectCycle,
          interval: data.fundingInterval,
        };
      })
    );

    console.log('Funding intervals by symbol:', results);

    // Verify we get at least 2 different intervals
    const uniqueIntervals = new Set(results.map(r => r.interval));
    expect(uniqueIntervals.size).toBeGreaterThanOrEqual(2);

    // All intervals should be valid
    results.forEach(r => {
      expect(r.interval).toMatch(/^\d+h$/);
      expect(['1h', '4h', '8h']).toContain(r.interval);
    });
  }, 60000); // 60s timeout for multiple API calls

  /**
   * Test error handling for invalid symbol
   */
  it('should handle invalid symbol gracefully', async () => {
    const response = await fetch(`${BASE_URL}/api/mexc/funding-rate/INVALID_SYMBOL_123`);

    expect(response.status).toBe(500); // Should return error
    const data = await response.json();
    expect(data.error).toBeDefined();
  }, 30000);
});

describe('Arbitrage Public Funding Rates - MEXC Integration', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  /**
   * Test that arbitrage endpoint uses MEXC individual endpoint
   */
  it('should fetch MEXC data with correct interval via arbitrage endpoint', async () => {
    const url = `${BASE_URL}/api/arbitrage/public-funding-rates?exchanges=MEXC&symbol=SHELL/USDT`;
    const response = await fetch(url);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);

    const mexcData = data.data[0];
    expect(mexcData.exchange).toBe('MEXC');
    expect(mexcData.fundingInterval).toBe('4h'); // SHELL_USDT uses 4h
    expect(mexcData.nextFundingTime).toBeGreaterThan(Date.now());

    console.log('✓ Arbitrage endpoint MEXC data:', mexcData);
  }, 30000);

  /**
   * Test multi-exchange request includes correct MEXC interval
   */
  it('should include MEXC with correct interval in multi-exchange request', async () => {
    const url = `${BASE_URL}/api/arbitrage/public-funding-rates?exchanges=MEXC,BINGX&symbol=SHELLUSDT`;
    const response = await fetch(url);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(1);

    const mexcData = data.data.find((d: any) => d.exchange === 'MEXC');
    expect(mexcData).toBeDefined();
    expect(mexcData.fundingInterval).toBe('4h');
    expect(mexcData.nextFundingTime).toBeGreaterThan(0);
    expect(mexcData.nextFundingTime).not.toBe(0); // Should NOT be zero

    console.log('✓ Multi-exchange MEXC data:', mexcData);
  }, 30000);
});
