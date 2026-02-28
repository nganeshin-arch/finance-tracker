import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Error interface for better error handling
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
  error?: string;
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (for future authentication)
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Create a standardized error object
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
    };

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      // Extract error message from response
      apiError.message = data?.message || data?.error || apiError.message;
      apiError.details = data?.details;
      apiError.error = data?.error;

      switch (status) {
        case 400:
          console.error('[API] Validation Error:', data);
          apiError.message = data?.message || 'Invalid request data';
          break;
        case 401:
          console.error('[API] Unauthorized:', data);
          apiError.message = data?.message || data?.error || 'Session expired. Please log in again.';
          // Clear auth token and redirect to login
          localStorage.removeItem('authToken');
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('[API] Forbidden:', data);
          apiError.message = data?.message || data?.error || 'Access forbidden';
          break;
        case 404:
          console.error('[API] Resource Not Found:', data);
          apiError.message = data?.message || 'Resource not found';
          break;
        case 409:
          console.error('[API] Conflict:', data);
          apiError.message = data?.message || data?.error || 'Resource conflict';
          break;
        case 422:
          console.error('[API] Unprocessable Entity:', data);
          apiError.message = data?.message || 'Validation failed';
          break;
        case 500:
          console.error('[API] Server Error:', data);
          apiError.message = 'Internal server error. Please try again later.';
          break;
        case 503:
          console.error('[API] Service Unavailable:', data);
          apiError.message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          console.error('[API] Error:', status, data);
          apiError.message = data?.message || data?.error || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('[API] Network Error: No response from server', error.request);
      apiError.message = 'Network error. Please check your connection and try again.';
      apiError.status = 0;
    } else {
      // Error in request setup
      console.error('[API] Request Error:', error.message);
      apiError.message = error.message || 'Failed to make request';
    }

    // Attach the standardized error to the axios error
    (error as any).apiError = apiError;

    return Promise.reject(error);
  }
);

// Helper function to extract API error message
export const getApiErrorMessage = (error: any): string => {
  if (error?.apiError) {
    return error.apiError.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
