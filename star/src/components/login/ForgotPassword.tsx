import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.requestPasswordReset(email.trim());

      setSuccess(
        data?.message ||
        'If this email is registered, a 6-digit code has been sent.'
      );
      // Store email in localStorage for reset password flow
      localStorage.setItem('resetPasswordEmail', email.trim());
      // Navigate to verify OTP after brief delay
      setTimeout(() => navigate('/reset-password/verify-otp'), 600);
    } catch (err: any) {
      console.error('Forgot password error:', err);

      const backendMsg: string | undefined =
        err?.response?.data?.message || err?.response?.data?.error;

      // Show a clear error so the user knows the request failed instead of pretending success
      setError(
        backendMsg ||
        'We could not send the code. Please check your email and try again, or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We’ll email you a 6-digit OTP to secure your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
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
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-3 text-base font-semibold text-white rounded-xl ${
            loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
          }`}
        >
          {loading ? 'Sending...' : 'Send verification code'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;


