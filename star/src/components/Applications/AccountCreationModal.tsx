import React, { useState } from 'react';
import { X, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import guestApplicationService from '../../services/guestApplicationService';

interface AccountCreationModalProps {
  email: string;
  onSuccess?: () => void;
  onClose: () => void;
}

const AccountCreationModal: React.FC<AccountCreationModalProps> = ({
  email,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await guestApplicationService.convertGuestToUser({
        email,
        password,
      });

      // In development, show OTP if available
      if (result.devOtp) {
        toast.info(`Dev OTP: ${result.devOtp}`, { autoClose: 10000 });
      }

      // Attempt automatic login so we can take the user to the dashboard
      try {
        const loginResponse = await authService.login({ email, password });

        if (loginResponse.accessToken && loginResponse.refreshToken) {
          authLogin(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.role);
          toast.success('Account created and you are now signed in!');

          if (onSuccess) {
            onSuccess();
          }
          onClose();

          // Small delay to ensure auth state propagates before navigation
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
          return;
        }

        // Fallback if tokens are missing
        toast.error('Account created, but automatic login failed. Please sign in manually.');
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        navigate('/login');
      } catch (loginError: any) {
        const status = loginError?.response?.status;
        const responseData = loginError?.response?.data;
        const backendMsg = responseData?.message || responseData?.error;

        // Handle email verification requirement similar to LoginPage
        if (status === 403 && responseData?.requiresVerification === true) {
          localStorage.setItem('pendingVerificationEmail', email.trim());
          localStorage.setItem('verificationSource', 'login');
          toast.info('Your email needs verification. Redirecting to verification page...');

          if (onSuccess) {
            onSuccess();
          }
          onClose();

          setTimeout(() => {
            navigate('/verify-email');
          }, 1500);
        } else {
          toast.error(backendMsg || 'Account created, but sign-in failed. Please log in manually.');
          if (onSuccess) {
            onSuccess();
          }
          onClose();
          navigate('/login');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create account';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Create an Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create an account to track your application and receive updates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email-display"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email-display"
                value={email}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Re-enter password"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountCreationModal;

