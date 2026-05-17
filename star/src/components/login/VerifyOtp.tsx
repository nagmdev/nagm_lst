import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';

const OTP_LENGTH = 6;

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  
  // Get email from localStorage (set during forgot password)
  const getStoredEmail = () => {
    return localStorage.getItem('resetPasswordEmail') || '';
  };

  const [email, setEmail] = useState(getStoredEmail());
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Email is required.');
      return;
    }
    const otp = otpDigits.join('');
    setLoading(true);
    try {
      await axiosInstance.post('/auth/password/verify-otp', { 
        email: email.trim(), 
        otp
      });
      setSuccess('OTP verified');
      // Store OTP in localStorage for next step
      localStorage.setItem('resetPasswordOtp', otp);
      setTimeout(() => navigate('/reset-password/new-password'), 500);
    } catch (err: any) {
      console.error(err);
      setError('Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Email is required to resend.');
      return;
    }
    try {
      const data = await authService.requestPasswordReset(email.trim());
      setSuccess(
        data?.message ||
        'If this email is registered, a new 6-digit code has been sent.'
      );
      setResendCooldown(60); // 60 second cooldown
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      const backendMsg: string | undefined =
        err?.response?.data?.message || err?.response?.data?.error;

      setError(
        backendMsg ||
        'We could not resend the code. Please try again in a moment or contact support.'
      );
      setResendCooldown(60);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        const next = [...otpDigits];
        next[index] = '';
        setOtpDigits(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtpDigits(next);
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle="Enter the 6-digit code sent to your email to reset your password."
    >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">6-digit code</label>
            <div className="mt-1 flex items-center justify-between gap-2">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg border border-gray-300 dark:border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                resendCooldown > 0 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded-md transition-colors ${
                loading 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm mt-4">
          <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Change email
          </Link>
        </div>
    </AuthLayout>
  );
};

export default VerifyOtp;


