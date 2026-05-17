import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../login/AuthLayout';
import authService from '../../services/authService';

const RegistrationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Register the user - backend automatically sends OTP to email
      const response = await authService.register({ 
        email: email.trim(), 
        password, 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        phone: phone.trim() 
      });

      // Store email in localStorage for verification page
      localStorage.setItem('pendingVerificationEmail', email.trim());
      localStorage.setItem('verificationSource', 'registration');
      
      // Store devOtp if provided (dev mode only)
      if (response.devOtp) {
        localStorage.setItem('devOtp', response.devOtp);
      }

      // Navigate to email verification screen
      navigate('/verify-email');
    } catch (err: any) {
      console.error('Registration error:', err);
      const status = err?.response?.status;
      let errorMessage = 'Registration failed. Please check your details and try again.';
      
      if (status === 409) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (status === 400) {
        errorMessage = err?.response?.data?.message || 'Invalid registration data. Please check all fields.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err?.response?.data?.message || err?.response?.data?.error || errorMessage;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Verify your email with OTP and get personalized STAR practice feedback."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
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
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-3 text-base font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition"
        >
          Create account
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegistrationPage;