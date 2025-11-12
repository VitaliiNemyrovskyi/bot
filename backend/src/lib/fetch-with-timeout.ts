/**
 * Fetch with timeout utility
 * Prevents connection leaks by aborting requests that take too long
 */

import { request, Agent } from 'undici';

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds (default: 30000ms = 30s)
}

/**
 * Fetch wrapper with automatic timeout and abort controller
 * Prevents hanging connections and memory leaks
 * Uses undici directly to properly control connection timeouts
 *
 * @param url - URL to fetch
 * @param options - Fetch options including custom timeout
 * @returns Fetch response
 * @throws Error if request times out or fails
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, method = 'GET', headers, body, ...fetchOptions } = options;

  // Create a custom dispatcher (Agent) with the specified timeout
  const dispatcher = new Agent({
    connect: {
      timeout,
    },
  });

  try {
    // Use undici's request with proper timeout settings and custom dispatcher
    const { statusCode, headers: responseHeaders, body: responseBody } = await request(url, {
      method: method as any,
      headers: headers as Record<string, string>,
      body: body as any,
      // Set headers and body timeouts to the specified timeout
      headersTimeout: timeout,
      bodyTimeout: timeout,
      // Use custom dispatcher with connect timeout
      dispatcher,
      ...fetchOptions,
    });

    // Convert undici response to standard Response object
    const responseHeadersObj: Record<string, string> = {};
    for (const [key, value] of Object.entries(responseHeaders)) {
      if (typeof value === 'string') {
        responseHeadersObj[key] = value;
      } else if (Array.isArray(value)) {
        responseHeadersObj[key] = value.join(', ');
      }
    }

    // Read body as buffer
    const chunks: Buffer[] = [];
    for await (const chunk of responseBody) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create Response object
    return new Response(buffer, {
      status: statusCode,
      statusText: getStatusText(statusCode),
      headers: responseHeadersObj,
    });
  } catch (error: any) {
    // Provide better error messages for timeout errors
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        error.code === 'UND_ERR_HEADERS_TIMEOUT' ||
        error.code === 'UND_ERR_BODY_TIMEOUT') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`);
    }

    throw error;
  } finally {
    // Close the dispatcher to prevent connection leaks
    await dispatcher.close();
  }
}

/**
 * Get HTTP status text for status code
 */
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[statusCode] || 'Unknown';
}
