import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';
import GoogleSignInButton from './GoogleSignInButton';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await authService.login({ email, password });
      
      // Check if we have tokens (successful login)
      if (data.accessToken && data.refreshToken) {
        // Set tokens and fetch user profile
        login(data.accessToken, data.refreshToken, data.role);
        // Small delay to ensure cookies are set before navigation
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
        return;
      }
      
      // If we get here, response is invalid (no tokens)
      console.error('Login response missing tokens:', data);
      setError('Invalid response from server. Please try again.');
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            status?: number; 
            data?: { 
              message?: string; 
              error?: string;
              requiresVerification?: boolean;
            } 
          } 
        };
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        const backendMsg = responseData?.message || responseData?.error;
        
        // Handle email not verified (403) - ONLY redirect if explicitly about email verification
        if (status === 403 && responseData?.requiresVerification === true) {
          // Only redirect if backend explicitly says email needs verification
          // Store email and mark that user came from login
          localStorage.setItem('pendingVerificationEmail', email.trim());
          localStorage.setItem('verificationSource', 'login');
          // Show a helpful message before redirecting
          setError('Your email address needs to be verified before you can log in. Redirecting to verification page...');
          setTimeout(() => {
            navigate('/verify-email');
          }, 1500);
          return;
        }
        
        // Handle other error statuses
        if (status === 401) {
          setError(backendMsg || 'Invalid email or password.');
        } else if (status === 400) {
          setError(backendMsg || 'Please check your email and password format.');
        } else if (status === 403) {
          // Other 403 errors (not about verification)
          setError(backendMsg || 'Access denied. Please contact support.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(backendMsg || 'Login failed. Please try again.');
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string };
        if (error.message === 'Network Error') {
          setError('Unable to connect to server. Please try again.');
        } else {
          setError(error.message || 'Login failed. Please try again.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credential: string) => {
    setError(null);
    setGoogleLoading(true);
    
    try {
      const data = await authService.loginWithGoogle({ credential });
      
      // Check if we have tokens (successful login)
      if (data.accessToken && data.refreshToken) {
        // Set tokens and fetch user profile
        login(data.accessToken, data.refreshToken, data.role);
        // Small delay to ensure cookies are set before navigation
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
        return;
      }
      
      // If we get here, response is invalid (no tokens)
      console.error('Google login response missing tokens:', data);
      setError('Invalid response from server. Please try again.');
    } catch (err: unknown) {
      console.error('Google login error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            status?: number; 
            data?: { 
              message?: string; 
              error?: string;
            } 
          } 
        };
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        const backendMsg = responseData?.message || responseData?.error;
        
        // Handle error statuses
        if (status === 401) {
          setError(backendMsg || 'Google authentication failed. Please try again.');
        } else if (status === 400) {
          setError(backendMsg || 'Invalid Google credentials. Please try again.');
        } else if (status === 403) {
          setError(backendMsg || 'Access denied. Please contact support.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(backendMsg || 'Google Sign-In failed. Please try again.');
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string };
        if (error.message === 'Network Error') {
          setError('Unable to connect to server. Please try again.');
        } else {
          setError(error.message || 'Google Sign-In failed. Please try again.');
        }
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
    setGoogleLoading(false);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your OTP-protected account to continue practicing."
      footer={
        <>
          <p>
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Reset it
            </Link>
          </p>
          <p className="mt-2">
            Don’t have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Create one
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className={`w-full px-4 py-3 text-base font-semibold text-white rounded-xl transition ${
            loading || googleLoading
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <div className="w-full">
        <GoogleSignInButton
          onSuccess={handleGoogleSignIn}
          onError={handleGoogleError}
          disabled={loading || googleLoading}
        />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
