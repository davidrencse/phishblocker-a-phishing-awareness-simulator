import { ApiError, ApiResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_PREFIX = '/api/v1';

const buildUrl = (path: string, query?: Record<string, string | number | undefined | null>) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${API_PREFIX}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseJson = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'The server returned an unreadable response.',
        details: null
      }
    };
  }
};

const normalizeError = (fallbackMessage: string, error?: ApiError | null): ApiError => {
  if (error) {
    return error;
  }

  return {
    code: 'REQUEST_FAILED',
    message: fallbackMessage,
    details: null
  };
};

export const apiRequest = async <T>(options: {
  path: string;
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
}): Promise<T> => {
  const response = await fetch(buildUrl(options.path, options.query), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include'
  }).catch(() => {
    throw {
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the backend API. Check the server and VITE_API_BASE_URL.',
      details: null
    } as ApiError;
  });

  const payload = await parseJson<T>(response);

  if (!response.ok || !payload.success || payload.data === null) {
    throw normalizeError(`Request failed with status ${response.status}.`, payload.error);
  }

  return payload.data;
};

export const apiHealthCheck = async () => {
  return apiRequest<{ status: 'ok'; service: string; version: string }>({
    path: '/health'
  });
};
