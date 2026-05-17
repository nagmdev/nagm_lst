import axiosInstance from './axiosInstance';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface RegisterResponse {
  message: string;
  id: string;
  email: string;
  devOtp?: string; // Only in dev mode
}

export interface VerifyEmailResponse {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresVerification?: boolean;
  role?: string;
}

export interface GoogleLoginPayload {
  credential: string; // Google OAuth ID token
}

const authService = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await axiosInstance.post<RegisterResponse>('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  requestPasswordReset: async (email: string) => {
    const { data } = await axiosInstance.post('/auth/password/forgot', { email });
    return data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const { data } = await axiosInstance.post('/auth/password/verify-otp', { email, otp });
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const { data } = await axiosInstance.post('/auth/password/reset', payload);
    return data;
  },

  // Email verification for registration
  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
    const { data } = await axiosInstance.post<VerifyEmailResponse>('/auth/verify-email', payload);
    return data;
  },

  // Resend verification OTP
  resendVerification: async (email: string) => {
    const { data } = await axiosInstance.post('/auth/resend-verification', { email });
    return data;
  },

  // Logout
  logout: async () => {
    const { data } = await axiosInstance.post('/auth/logout');
    return data;
  },

  // Refresh token
  refreshToken: async (token: string) => {
    const { data } = await axiosInstance.post<{ accessToken: string; role?: string }>('/auth/refresh', { token });
    return data;
  },

  // Google Sign-In
  loginWithGoogle: async (payload: GoogleLoginPayload): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/google', payload);
    return data;
  },
};

export default authService;

