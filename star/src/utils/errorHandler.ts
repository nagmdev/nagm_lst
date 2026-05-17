export interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
      errors?: Array<{
        param: string;
        msg: string;
      }>;
    };
  };
  message?: string;
}

export const handleApiError = (error: ApiError, customMessages: Record<number, string> = {}): string => {
  const status = error.response?.status;
  const message = error.response?.data?.error || error.response?.data?.message || error.message;

  switch (status) {
    case 401:
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name === 'accessToken' || name === 'refreshToken') {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
        window.location.href = '/login';
      }
      return 'Please login to continue';

    case 403:
      // Forbidden - role/permission issue
      if (message?.includes('Access restricted to')) {
        const match = message.match(/restricted to (.+)/);
        return `Access denied. Required roles: ${match?.[1] || 'N/A'}`;
      }
      if (message?.includes('admin')) {
        return 'Only admins can perform this action';
      }
      return customMessages[403] || message || 'You do not have permission to perform this action';

    case 404:
      return customMessages[404] || 'Resource not found';

    case 409:
      return customMessages[409] || 'Conflict: This action cannot be completed';

    case 400:
      // Validation errors
      if (error.response?.data?.errors) {
        return error.response.data.errors
          .map((err: { param: string; msg: string }) => `${err.param}: ${err.msg}`)
          .join(', ');
      }
      return customMessages[400] || message || 'Invalid request';

    case 429:
      return 'Too many requests. Please try again later';

    case 500:
      return customMessages[500] || 'Server error. Please try again later';

    default:
      if (status && customMessages[status]) {
        return customMessages[status];
      }
      return message || 'An error occurred';
  }
};

