// Environment configuration for different deployment environments

export const config = {
  // API Base URL - changes based on environment
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Backend URL for proxy (development only)
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  
  // Google OAuth Client ID
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Environment
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Check if we're in production
  isProduction: import.meta.env.PROD,
  
  // Check if we're in development
  isDevelopment: import.meta.env.DEV,
} as const;

// Production API URLs examples:
// VITE_API_BASE_URL=https://api.yourapp.com/api
// VITE_API_BASE_URL=https://yourapp.herokuapp.com/api
// VITE_API_BASE_URL=https://your-backend.vercel.app/api

export default config;
