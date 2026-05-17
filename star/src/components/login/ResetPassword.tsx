import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import AuthLayout from './AuthLayout';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  
  // Get email and OTP from localStorage (set during forgot password flow)
  const getStoredEmail = () => {
    return localStorage.getItem('resetPasswordEmail') || '';
  };
  const getStoredOtp = () => {
    return localStorage.getItem('resetPasswordOtp') || '';
  };

  const [email, setEmail] = useState(getStoredEmail());
  const storedOtp = getStoredOtp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Email is required.');
      return;
    }
    const otp = storedOtp;
    if (!otp) {
      setError('OTP is required. Please go back and verify your OTP first.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/password/reset', { 
        email: email.trim(), 
        otp, 
        newPassword
      });
      setSuccess('Password reset successfully. You can now log in.');
      
      // Clear stored reset password data
      localStorage.removeItem('resetPasswordEmail');
      localStorage.removeItem('resetPasswordOtp');
      
      // Redirect to login
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || 'Invalid or expired code. Request a new one.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below."
    >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Confirm new password"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
          <div className="flex items-center justify-between">
            <Link to="/reset-password/verify-otp" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to OTP
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded-md transition-colors ${
                loading 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
              }`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
    </AuthLayout>
  );
};

export default ResetPassword;


