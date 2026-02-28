import { AxiosError } from 'axios';

interface ErrorResponse {
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse;

    // Handle validation errors with details
    if (data?.details && Array.isArray(data.details)) {
      return data.details.map((d) => d.message).join(', ');
    }

    // Handle standard error messages
    if (data?.message) {
      return data.message;
    }

    // Handle network errors
    if (!error.response) {
      return 'Network error. Please check your connection.';
    }

    // Handle HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists or cannot be modified.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
