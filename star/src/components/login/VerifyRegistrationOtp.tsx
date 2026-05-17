import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';

const OTP_LENGTH = 6;

const VerifyRegistrationOtp: React.FC = () => {
  const navigate = useNavigate();
  
  // Get email from localStorage (set during registration)
  const getStoredEmail = () => {
    return localStorage.getItem('pendingVerificationEmail') || '';
  };

  const [email, setEmail] = useState(getStoredEmail());
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Auto-fill OTP from localStorage if in dev mode
  useEffect(() => {
    const devOtp = localStorage.getItem('devOtp');
    if (devOtp && devOtp.length === OTP_LENGTH) {
      const otpArray = devOtp.split('').slice(0, OTP_LENGTH);
      setOtpDigits(otpArray);
      // Focus first empty input or last input
      const firstEmptyIndex = otpArray.findIndex(d => !d);
      const focusIndex = firstEmptyIndex >= 0 ? firstEmptyIndex : OTP_LENGTH - 1;
      setTimeout(() => inputsRef.current[focusIndex]?.focus(), 100);
    }
  }, []);

  // Resend cooldown timer (60 seconds)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    const otp = otpDigits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    setLoading(true);
    try {
      // Verify email OTP - backend activates account
      const response = await authService.verifyEmail({
        email: email.trim(),
        otp,
      });

      setSuccess(response.message || 'Email verified successfully! You can now log in.');

      // Clear stored email, devOtp, and verification source
      localStorage.removeItem('pendingVerificationEmail');
      localStorage.removeItem('devOtp');
      localStorage.removeItem('verificationSource');

      // Redirect to login after successful verification
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error('Verify email error:', err);
      const status = err?.response?.status;
      let errorMessage = 'Invalid or expired code. Please try again or request a new one.';
      
      if (status === 400) {
        errorMessage = err?.response?.data?.message || 'Invalid OTP code. Please check and try again.';
      } else if (status === 429) {
        errorMessage = 'Too many attempts. Please wait a moment before trying again.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err?.response?.data?.message || err?.response?.data?.error || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Email is required to resend.');
      return;
    }

    try {
      await authService.resendVerification(email.trim());
      setSuccess('A new 6-digit verification code has been sent to your email.');
      setResendCooldown(60); // 60 second cooldown
    } catch (err: any) {
      console.error('Resend verification error:', err);
      const status = err?.response?.status;
      let errorMessage = 'We could not resend the code. Please try again in a moment or contact support.';
      
      if (status === 429) {
        errorMessage = 'Please wait before requesting another code.';
        // Set cooldown based on remaining time if provided
        const retryAfter = err?.response?.data?.retryAfter;
        if (retryAfter) {
          setResendCooldown(retryAfter);
        } else {
          setResendCooldown(60);
        }
      } else if (status === 400) {
        errorMessage = err?.response?.data?.message || 'Invalid email address.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err?.response?.data?.message || err?.response?.data?.error || errorMessage;
      }
      
      setError(errorMessage);
      if (status !== 429) {
        setResendCooldown(60);
      }
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

  // Check if user came from login (unverified account) or registration
  const verificationSource = localStorage.getItem('verificationSource');
  const isFromLogin = verificationSource === 'login';

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        isFromLogin 
          ? "Your email address needs to be verified before you can log in. Enter the 6-digit code sent to your email address."
          : "We've sent a 6-digit verification code to your email. Enter it below to activate your account and complete registration."
      }
      footer={
        <>
          {isFromLogin && (
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              After verification, you'll be able to log in with your credentials.
            </p>
          )}
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:text-gray-400"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
            {' or '}
            <Link to={isFromLogin ? "/login" : "/register"} className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {isFromLogin ? "go back to login" : "try registering again"}
            </Link>
          </p>
        </>
      }
    >
      {/* Helpful instructions box */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How to verify your email:
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Enter your email address below (the one you used during registration)</li>
          <li>Check your email inbox for a 6-digit verification code</li>
          <li>Enter the code in the boxes below</li>
          <li>Click "Verify Email" to complete the process</li>
        </ol>
        {!email && (
          <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
            💡 <strong>Tip:</strong> If you don't see the email, check your spam/junk folder or click "Resend code" below.
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
            placeholder="Enter your email address"
            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          />
          {!email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the email address you used during registration.
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            6-digit verification code
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
            Check your email inbox (and spam folder) for the verification code.
          </p>
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
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg border border-gray-300 dark:border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
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
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
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
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyRegistrationOtp;


