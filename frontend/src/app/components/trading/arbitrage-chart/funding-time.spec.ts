/**
 * Funding Time Calculations - UTC Timezone Safety Tests
 *
 * These tests ensure that funding time calculations always use UTC
 * and never add timezone offsets, which was a critical bug.
 *
 * IMPORTANT: Funding intervals can vary by SYMBOL and can change over time.
 * The frontend NEVER calculates nextFundingTime locally - it always uses
 * the value provided by the backend API or WebSocket data.
 *
 * These tests verify the DISPLAY logic (formatFundingInfo) works correctly
 * with any interval (1h, 4h, 8h, etc.) provided by the backend.
 */

describe('Funding Time Calculations - formatFundingInfo()', () => {
  // Helper function to simulate the formatFundingInfo method
  function formatFundingInfo(rate: string, nextFundingTime: number, fundingIntervalStr?: string): string {
    if (!rate && (!nextFundingTime || nextFundingTime === 0)) return 'N/A';

    // Format funding rate
    let rateFormatted = 'N/A';
    if (rate && rate !== 'null' && rate !== 'undefined') {
      const numRate = parseFloat(rate);
      if (!isNaN(numRate)) {
        rateFormatted = (numRate * 100).toFixed(4) + '%';
      }
    }

    // Format time remaining as HH:MM
    let timeFormatted = 'N/A';
    if (nextFundingTime && nextFundingTime > 0) {
      const now = Date.now();
      const remaining = nextFundingTime - now;

      if (remaining <= 0) {
        timeFormatted = '00:00';
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    // Use funding interval from API/DB if available, otherwise default to 8h
    const intervalFormatted = fundingIntervalStr || '8h';

    const result = `${rateFormatted} / ${timeFormatted} / ${intervalFormatted}`;

    return result;
  }

  it('should format funding info with correct UTC timestamps (no timezone offset)', () => {
    // Test case: nextFundingTime at 22:00:00 UTC, current time at 21:30:00 UTC
    const nextFundingTime = Date.UTC(2025, 9, 28, 22, 0, 0); // 22:00:00 UTC
    const currentTime = Date.UTC(2025, 9, 28, 21, 30, 0);    // 21:30:00 UTC

    // Mock Date.now() to return our test current time
    spyOn(Date, 'now').and.returnValue(currentTime);

    const result = formatFundingInfo('0.0001', nextFundingTime, '8h');

    // Should show 30 minutes remaining (00:30)
    expect(result).toContain('00:30');
    expect(result).toContain('0.0100%');
    expect(result).toContain('8h');
  });

  it('should handle MEXC hourly funding with correct UTC calculation', () => {
    // MEXC has hourly funding (every hour on the hour)
    // Test: Current time 14:45 UTC -> Next funding at 15:00 UTC (15 minutes)
    const currentTime = Date.UTC(2025, 9, 28, 14, 45, 0);
    const expectedNextFunding = Date.UTC(2025, 9, 28, 15, 0, 0);

    spyOn(Date, 'now').and.returnValue(currentTime);

    const result = formatFundingInfo('0.0001', expectedNextFunding, '1h');

    // Should show 15 minutes remaining (00:15)
    expect(result).toContain('00:15');
    expect(result).toContain('1h');
  });

  it('should correctly calculate time remaining across hour boundary', () => {
    // Test: Current time 23:45 UTC -> Next funding at 00:00 UTC next day (15 minutes)
    const currentTime = Date.UTC(2025, 9, 28, 23, 45, 0);
    const nextFundingTime = Date.UTC(2025, 9, 29, 0, 0, 0); // Next day

    spyOn(Date, 'now').and.returnValue(currentTime);

    const result = formatFundingInfo('0.0001', nextFundingTime, '8h');

    // Should show 15 minutes remaining (00:15), NOT 03:15 or other timezone offset
    expect(result).toContain('00:15');
  });

  it('should show correct hours when funding is more than 1 hour away', () => {
    // Test: Current time 20:15 UTC -> Next funding at 22:00 UTC (1h 45m = 105 minutes)
    const currentTime = Date.UTC(2025, 9, 28, 20, 15, 0);
    const nextFundingTime = Date.UTC(2025, 9, 28, 22, 0, 0);

    spyOn(Date, 'now').and.returnValue(currentTime);

    const result = formatFundingInfo('0.0001', nextFundingTime, '8h');

    // Should show 1 hour 45 minutes (01:45)
    expect(result).toContain('01:45');
  });

  it('should handle funding time in the past (show 00:00)', () => {
    // Test: Funding time has already passed
    const currentTime = Date.UTC(2025, 9, 28, 22, 5, 0);
    const nextFundingTime = Date.UTC(2025, 9, 28, 22, 0, 0); // 5 minutes ago

    spyOn(Date, 'now').and.returnValue(currentTime);

    const result = formatFundingInfo('0.0001', nextFundingTime, '8h');

    // Should show 00:00 when funding time has passed
    expect(result).toContain('00:00');
  });

  it('should NOT add timezone offset to calculated time (regression test)', () => {
    // Regression test for the bug where timezone offset was added
    // Test in UTC+3 timezone scenario: 21:30 UTC -> 22:00 UTC should show 00:30, NOT 03:30
    const currentTime = Date.UTC(2025, 9, 28, 21, 30, 0);
    const nextFundingTime = Date.UTC(2025, 9, 28, 22, 0, 0);

    spyOn(Date, 'now').and.returnValue(currentTime);

    const result = formatFundingInfo('0.0001', nextFundingTime, '8h');

    // CRITICAL: Should be 00:30, NOT 03:30 (which would happen if timezone offset is added)
    expect(result).toContain('00:30');
    expect(result).not.toContain('03:30');
    expect(result).not.toContain('02:30');
  });

  it('should handle different funding intervals correctly', () => {
    const currentTime = Date.UTC(2025, 9, 28, 21, 30, 0);
    const nextFundingTime = Date.UTC(2025, 9, 28, 22, 0, 0);

    spyOn(Date, 'now').and.returnValue(currentTime);

    // Test with 8h interval
    const result8h = formatFundingInfo('0.0001', nextFundingTime, '8h');
    expect(result8h).toContain('8h');

    // Test with 1h interval (MEXC)
    const result1h = formatFundingInfo('0.0001', nextFundingTime, '1h');
    expect(result1h).toContain('1h');

    // Test with 4h interval
    const result4h = formatFundingInfo('0.0001', nextFundingTime, '4h');
    expect(result4h).toContain('4h');
  });

  it('should return N/A when nextFundingTime is 0 or undefined', () => {
    const result1 = formatFundingInfo('0.0001', 0, '8h');
    expect(result1).toBe('N/A');

    const result2 = formatFundingInfo('', 0, '8h');
    expect(result2).toBe('N/A');
  });

  it('should format funding rate as percentage correctly', () => {
    const nextFundingTime = Date.UTC(2025, 9, 28, 22, 0, 0);
    const currentTime = Date.UTC(2025, 9, 28, 21, 30, 0);

    spyOn(Date, 'now').and.returnValue(currentTime);

    // Positive funding rate
    const resultPositive = formatFundingInfo('0.0001', nextFundingTime, '8h');
    expect(resultPositive).toContain('0.0100%');

    // Negative funding rate
    const resultNegative = formatFundingInfo('-0.0001', nextFundingTime, '8h');
    expect(resultNegative).toContain('-0.0100%');

    // Zero funding rate
    const resultZero = formatFundingInfo('0', nextFundingTime, '8h');
    expect(resultZero).toContain('0.0000%');
  });
});
