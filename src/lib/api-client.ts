/**
 * Centralized API client for making authenticated requests to backend APIs
 * Handles error handling, authentication, and response parsing
 */

type RequestOptions = RequestInit & {
  requireAuth?: boolean;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Centralized fetch wrapper with authentication and error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (fetchOptions.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
      credentials: "include", // Include cookies for session
    });

    let data: any;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0,
      error
    );
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    ...options,
    method: "GET",
  });
  return response.data as T;
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  return response.data as T;
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  return response.data as T;
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
  return response.data as T;
}

