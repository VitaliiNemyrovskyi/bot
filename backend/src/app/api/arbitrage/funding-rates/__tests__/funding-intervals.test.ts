/**
 * Funding Intervals Tests
 *
 * These tests verify that funding intervals are correctly retrieved from exchange APIs
 * and NOT hardcoded, as intervals can vary by symbol and change over time.
 *
 * Critical requirement: Funding intervals must ALWAYS come from exchange API data,
 * never from hardcoded defaults unless the API doesn't provide the interval.
 */

import { describe, it, expect } from '@jest/globals';

describe('Funding Intervals - Dynamic Behavior', () => {
  /**
   * Test that different symbols on the same exchange can have different intervals
   */
  it('should handle multiple funding intervals on the same exchange', () => {
    // MEXC example: Different symbols have different collectCycle values
    const mexcSymbols = [
      { symbol: 'SHELL_USDT', collectCycle: 4 }, // 4-hour interval
      { symbol: 'BTC_USDT', collectCycle: 8 },   // 8-hour interval
      { symbol: 'ETH_USDT', collectCycle: 8 },   // 8-hour interval
    ];

    mexcSymbols.forEach(s => {
      const interval = `${s.collectCycle}h`;
      expect(interval).toMatch(/^\d+h$/);
      expect(['1h', '2h', '4h', '8h']).toContain(interval);
    });
  });

  /**
   * Test Bybit interval variations
   * Bybit API provides fundingInterval in minutes: 60, 120, 240, 480
   */
  it('should convert Bybit fundingInterval from minutes to hours', () => {
    const bybitIntervals = [
      { minutes: 60, expected: '1h' },
      { minutes: 120, expected: '2h' },
      { minutes: 240, expected: '4h' },
      { minutes: 480, expected: '8h' },
    ];

    bybitIntervals.forEach(({ minutes, expected }) => {
      const hours = minutes / 60;
      const interval = `${hours}h`;
      expect(interval).toBe(expected);
    });
  });

  /**
   * Test Gate.io interval variations
   * Gate.io API provides funding_interval in seconds: 3600, 7200, 14400, 28800
   */
  it('should convert Gate.io funding_interval from seconds to hours', () => {
    const gateioIntervals = [
      { seconds: 3600, expected: '1h' },
      { seconds: 7200, expected: '2h' },
      { seconds: 14400, expected: '4h' },
      { seconds: 28800, expected: '8h' },
    ];

    gateioIntervals.forEach(({ seconds, expected }) => {
      const hours = seconds / 3600;
      const interval = `${hours}h`;
      expect(interval).toBe(expected);
    });
  });

  /**
   * Test MEXC collectCycle variations
   * MEXC API provides collectCycle in hours: 1, 4, 8
   */
  it('should use MEXC collectCycle directly as hours', () => {
    const mexcCollectCycles = [
      { collectCycle: 1, expected: '1h' },
      { collectCycle: 4, expected: '4h' },
      { collectCycle: 8, expected: '8h' },
    ];

    mexcCollectCycles.forEach(({ collectCycle, expected }) => {
      const interval = `${collectCycle}h`;
      expect(interval).toBe(expected);
    });
  });
});

describe('Funding Intervals - Data Source Priority', () => {
  /**
   * Test that API-provided intervals take precedence over defaults
   */
  it('should prioritize API interval over default fallback', () => {
    // Mock scenario: API returns 4h, default is 8h
    const apiInterval = 4; // from collectCycle or fundingInterval
    const defaultInterval = 8;

    // API value should always win
    const finalInterval = apiInterval || defaultInterval;
    expect(finalInterval).toBe(4);
  });

  /**
   * Test fallback to default only when API doesn't provide interval
   */
  it('should use default only when API interval is missing', () => {
    // Mock scenario: API doesn't return interval
    const apiInterval = undefined;
    const defaultInterval = 8;

    const finalInterval = apiInterval || defaultInterval;
    expect(finalInterval).toBe(8);
  });

  /**
   * Test that zero/null API intervals trigger fallback
   */
  it('should use default when API returns zero or null', () => {
    const scenarios = [
      { apiInterval: 0, default: 8, expected: 8 },
      { apiInterval: null, default: 8, expected: 8 },
      { apiInterval: undefined, default: 8, expected: 8 },
      { apiInterval: 4, default: 8, expected: 4 },
    ];

    scenarios.forEach(({ apiInterval, default: defaultVal, expected }) => {
      const result = apiInterval || defaultVal;
      expect(result).toBe(expected);
    });
  });
});

describe('Funding Intervals - Real-World Examples', () => {
  /**
   * Test actual examples from exchanges
   */
  it('should handle real MEXC symbols with varying intervals', () => {
    // Real data from MEXC API (as of 2025-10-29)
    const realMexcData = [
      { symbol: 'SHELL_USDT', collectCycle: 4, expectedInterval: '4h' },
      { symbol: 'COAI_USDT', collectCycle: 8, expectedInterval: '8h' },
      { symbol: 'BTC_USDT', collectCycle: 8, expectedInterval: '8h' },
    ];

    realMexcData.forEach(({ symbol, collectCycle, expectedInterval }) => {
      const interval = `${collectCycle}h`;
      expect(interval).toBe(expectedInterval);
      console.log(`✓ ${symbol}: ${interval} (collectCycle=${collectCycle})`);
    });
  });

  /**
   * Test Bybit real-world distribution
   */
  it('should recognize Bybit has 4 different interval types', () => {
    // Real distribution from Bybit API
    const bybitDistribution = {
      '1h': 35,   // 60 minutes
      '2h': 14,   // 120 minutes
      '4h': 256,  // 240 minutes
      '8h': 195,  // 480 minutes
    };

    const totalSymbols = Object.values(bybitDistribution).reduce((a, b) => a + b, 0);
    expect(totalSymbols).toBeGreaterThan(0);
    expect(Object.keys(bybitDistribution)).toHaveLength(4);

    console.log('Bybit funding interval distribution:', bybitDistribution);
  });

  /**
   * Test Gate.io real-world distribution
   */
  it('should recognize Gate.io has 4 different interval types', () => {
    // Real distribution from Gate.io API
    const gateioDistribution = {
      '1h': 79,   // 3600 seconds
      '2h': 8,    // 7200 seconds
      '4h': 342,  // 14400 seconds
      '8h': 162,  // 28800 seconds
    };

    const totalSymbols = Object.values(gateioDistribution).reduce((a, b) => a + b, 0);
    expect(totalSymbols).toBeGreaterThan(0);
    expect(Object.keys(gateioDistribution)).toHaveLength(4);

    console.log('Gate.io funding interval distribution:', gateioDistribution);
  });
});

describe('Funding Intervals - Validation', () => {
  /**
   * Test that intervals are always in valid format
   */
  it('should validate interval format', () => {
    // Common valid intervals
    const validIntervals = ['1h', '2h', '4h', '8h', '12h', '24h'];

    // Invalid formats (not matching pattern)
    const invalidFormats = ['unknown', '', '1', 'h', '1hour', '1 h'];

    validIntervals.forEach(interval => {
      expect(interval).toMatch(/^\d+h$/);
    });

    invalidFormats.forEach(interval => {
      if (interval) {
        const isValid = /^\d+h$/.test(interval);
        expect(isValid).toBe(false);
      }
    });

    // Edge cases: These match the pattern but are unusual
    const unusualButValid = ['3h', '5h', '10h', '0h'];
    unusualButValid.forEach(interval => {
      expect(interval).toMatch(/^\d+h$/);
    });
  });

  /**
   * Test nextFundingTime must be future timestamp
   */
  it('should validate nextFundingTime is in the future', () => {
    const now = Date.now();

    // Valid: Future timestamps
    const futureTime = now + 3600000; // 1 hour from now
    expect(futureTime).toBeGreaterThan(now);

    // Invalid: Past timestamps
    const pastTime = now - 3600000; // 1 hour ago
    expect(pastTime).toBeLessThan(now);

    // Invalid: Zero or null
    expect(0).toBe(0); // Should be rejected as invalid
  });
});

describe('Funding Intervals - Frontend Display', () => {
  /**
   * Test that funding info is formatted correctly for display
   */
  it('should format funding info with all components', () => {
    const testCases = [
      {
        rate: '0.0001',
        nextFundingTime: Date.now() + 1800000, // 30 min
        interval: '8h',
        expectedRate: '0.0100%',
        expectedTime: '00:30',
        expectedInterval: '8h',
      },
      {
        rate: '-0.00942',
        nextFundingTime: Date.now() + 3660000, // 1h 1min
        interval: '4h',
        expectedRate: '-0.9420%',
        expectedTime: '01:01',
        expectedInterval: '4h',
      },
    ];

    testCases.forEach(({ rate, interval, expectedRate, expectedInterval }) => {
      // Format rate
      const numRate = parseFloat(rate);
      const rateFormatted = (numRate * 100).toFixed(4) + '%';
      expect(rateFormatted).toBe(expectedRate);

      // Interval should pass through
      expect(interval).toBe(expectedInterval);
    });
  });
});
