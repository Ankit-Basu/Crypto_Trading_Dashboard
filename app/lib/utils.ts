export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = new Error('API request failed') as ApiError;
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {
      // Ignore JSON parse error for non-JSON error responses
    }
    throw error;
  }

  try {
    const data = await response.json();
    if (!data) {
      throw new Error('Empty response from API');
    }
    return data as T;
  } catch (error) {
    const apiError = new Error('Failed to parse API response') as ApiError;
    apiError.status = response.status;
    throw apiError;
  }
}

export function createApiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const timeout = 10000; // 10 seconds timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    const error = new Error('Request timeout') as ApiError;
    error.code = 'TIMEOUT';
    throw error;
  }, timeout);

  // Create a custom agent to bypass SSL certificate validation
  // This is only for development purposes
  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
  };

  // Store the original value of NODE_TLS_REJECT_UNAUTHORIZED
  const originalValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  
  // Set NODE_TLS_REJECT_UNAUTHORIZED=0 for development
  // This bypasses SSL certificate validation temporarily
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  return fetch(url, fetchOptions).finally(() => {
    clearTimeout(timeoutId);
    // Restore the original environment variable value after the request
    if (originalValue === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalValue;
    }
  });
}