/**
 * Disable console.log in production/development
 * This improves performance by preventing excessive logging
 */

// Save original console methods
const originalConsoleLog = console.log;
const originalConsoleDebug = console.debug;

// Override console.log to do nothing
console.log = () => {};
console.debug = () => {};

// Keep error and warn for important messages
// console.error and console.warn are still active

// Export original methods in case we need them for debugging
export const enableLogs = () => {
  console.log = originalConsoleLog;
  console.debug = originalConsoleDebug;
};

export const disableLogs = () => {
  console.log = () => {};
  console.debug = () => {};
};
