/**
 * Validation utilities for API request parameters
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class RequestValidator {
  /**
   * Validate account type parameter
   */
  static validateAccountType(accountType: string): ValidationResult {
    const validTypes = ['UNIFIED', 'CONTRACT', 'SPOT'];
    const errors: string[] = [];

    if (!validTypes.includes(accountType.toUpperCase())) {
      errors.push(`Invalid accountType. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate category parameter
   */
  static validateCategory(category: string): ValidationResult {
    const validCategories = ['linear', 'spot', 'option'];
    const errors: string[] = [];

    if (!validCategories.includes(category.toLowerCase())) {
      errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate symbol format
   */
  static validateSymbol(symbol: string): ValidationResult {
    const errors: string[] = [];

    // Check if symbol is valid format (letters and numbers only, uppercase)
    const symbolRegex = /^[A-Z0-9]+$/;
    if (!symbolRegex.test(symbol.toUpperCase())) {
      errors.push('Invalid symbol format. Symbol should contain only letters and numbers.');
    }

    // Check minimum length
    if (symbol.length < 3) {
      errors.push('Symbol must be at least 3 characters long.');
    }

    // Check maximum length
    if (symbol.length > 20) {
      errors.push('Symbol must not exceed 20 characters.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate coin parameter
   */
  static validateCoin(coin: string): ValidationResult {
    const errors: string[] = [];

    // Check if coin is valid format (letters only, uppercase)
    const coinRegex = /^[A-Z]+$/;
    if (!coinRegex.test(coin.toUpperCase())) {
      errors.push('Invalid coin format. Coin should contain only letters.');
    }

    // Check minimum length
    if (coin.length < 2) {
      errors.push('Coin must be at least 2 characters long.');
    }

    // Check maximum length
    if (coin.length > 10) {
      errors.push('Coin must not exceed 10 characters.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate limit parameter
   */
  static validateLimit(limit: number, min: number = 1, max: number = 200): ValidationResult {
    const errors: string[] = [];

    if (!Number.isInteger(limit)) {
      errors.push('Limit must be an integer.');
    }

    if (limit < min) {
      errors.push(`Limit must be at least ${min}.`);
    }

    if (limit > max) {
      errors.push(`Limit must not exceed ${max}.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate authorization header
   */
  static validateAuthHeader(authHeader: string | null): ValidationResult {
    const errors: string[] = [];

    if (!authHeader) {
      errors.push('Authorization header is required.');
      return { valid: false, errors };
    }

    if (!authHeader.startsWith('Bearer ')) {
      errors.push('Authorization header must use Bearer token format.');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token || token.length === 0) {
      errors.push('Authorization token is empty.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate multiple parameters at once
   */
  static validateAll(validations: { [key: string]: ValidationResult }): ValidationResult {
    const allErrors: string[] = [];

    for (const [field, result] of Object.entries(validations)) {
      if (!result.valid) {
        allErrors.push(...result.errors.map(error => `${field}: ${error}`));
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }
}

/**
 * Sanitize string inputs to prevent injection attacks
 */
export class InputSanitizer {
  /**
   * Sanitize symbol input
   */
  static sanitizeSymbol(symbol: string): string {
    // Remove any non-alphanumeric characters and convert to uppercase
    return symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  /**
   * Sanitize coin input
   */
  static sanitizeCoin(coin: string): string {
    // Remove any non-alphabetic characters and convert to uppercase
    return coin.replace(/[^A-Za-z]/g, '').toUpperCase();
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(value: string, defaultValue: number): number {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Sanitize enum input
   */
  static sanitizeEnum<T extends string>(value: string, validValues: T[], defaultValue: T): T {
    const sanitized = value.toUpperCase() as T;
    return validValues.includes(sanitized) ? sanitized : defaultValue;
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed under rate limit
   */
  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);

    return true;
  }

  /**
   * Get remaining requests for user
   */
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Get time until next request allowed (in ms)
   */
  getTimeUntilReset(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    if (recentRequests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...recentRequests);
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }

  /**
   * Clear rate limit data for user
   */
  clearUser(userId: string): void {
    this.requests.delete(userId);
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Export singleton rate limiter for Bybit API endpoints
export const bybitRateLimiter = new RateLimiter(60000, 120); // 120 requests per minute
