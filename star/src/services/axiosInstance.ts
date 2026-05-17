import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config/environment';

const axiosInstance = axios.create({
  // Use environment-based configuration
  // Development: '/api' (proxied to backend)
  // Production: full URL like 'https://api.yourapp.com/api'
  baseURL: config.apiBaseUrl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Attach auth header from cookies
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Simple request logging
    (config as any).metadata = { startTime: new Date() };
    const method = (config.method || 'get').toUpperCase();
    const url = `${config.baseURL || ''}${config.url || ''}`;
    // Avoid logging large/binary bodies; safe for typical JSON requests
    // eslint-disable-next-line no-console
    console.log(`[API REQUEST] ${method} ${url}`, {
      params: config.params,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const metadata = (response.config as any).metadata;
    const durationMs = metadata?.startTime ? new Date().getTime() - new Date(metadata.startTime).getTime() : undefined;
    const method = (response.config.method || 'get').toUpperCase();
    const url = `${response.config.baseURL || ''}${response.config.url || ''}`;
    // eslint-disable-next-line no-console
    console.log(`[API RESPONSE] ${method} ${url} -> ${response.status}${durationMs !== undefined ? ` (${durationMs}ms)` : ''}`, {
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = `${originalRequest?.url || ''}`;
    const isAuthPublicPath = (url: string) => {
      return (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/verify-email') ||
        url.includes('/auth/resend-verification') ||
        url.includes('/auth/password/forgot') ||
        url.includes('/auth/password/verify-otp') ||
        url.includes('/auth/password/reset') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/create-admin')
      );
    };

    // Public endpoints that can return 403 for business logic reasons (not auth failures)
    const isPublicEndpointWith403 = (url: string) => {
      // GET /jobs/:id is public but can return 403 if job not approved (expected behavior)
      // Pattern matches: /jobs/123 (job detail endpoint)
      // This endpoint is public but returns 403 if job status is not APPROVED
      if (/\/jobs\/\d+$/.test(url)) {
        return true;
      }
      return false;
    };
    // Log error details
    const method = (originalRequest?.method || 'get').toUpperCase();
    const url = `${originalRequest?.baseURL || ''}${originalRequest?.url || ''}`;
    // eslint-disable-next-line no-console
    console.error(`[API RESPONSE ERROR] ${method} ${url} -> ${error?.response?.status || 'NETWORK_ERROR'}`, {
      data: error?.response?.data,
      message: error?.message,
    });

    // Handle network errors (backend down, CORS, etc.)
    if (!error.response) {
      // Network error - backend is unreachable
      console.error('Network error - backend may be down');
      return Promise.reject(error);
    }

    if (error.response.status === 403) {
      // Don't redirect on 403 for auth endpoints - let components handle it
      // (e.g., LoginPage needs to handle unverified email case)
      const isAuthEndpoint = isAuthPublicPath(requestUrl);
      // Don't redirect on 403 for public endpoints that can return 403 for business logic
      const isPublicWith403 = isPublicEndpointWith403(requestUrl);
      
      if (!isAuthEndpoint && !isPublicWith403) {
        // Clear tokens and redirect on forbidden for protected endpoints only
        // Public endpoints like /jobs/:id can return 403 if job not approved (expected behavior)
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('role');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Only try refresh on 401 for protected endpoints (not auth public paths)
    if (error.response.status === 401 && !originalRequest._retry && !isAuthPublicPath(requestUrl)) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await axiosInstance.post('/auth/refresh', { token: refreshToken }, {
          skipAuthRefresh: true, // Prevent infinite loop
        } as any);
        const { accessToken, role } = response.data;
        const isSecure = window.location.protocol === 'https:';
        // Update access token (15m)
        Cookies.set('accessToken', accessToken, { secure: isSecure, sameSite: 'strict', expires: 15 / (24 * 60) });
        if (role) {
          Cookies.set('role', role, { secure: isSecure, sameSite: 'strict', expires: 7 });
        }
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        if (originalRequest && originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        console.error("Token refresh failed", refreshError);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('role');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;