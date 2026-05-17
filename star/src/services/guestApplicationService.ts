import axios from 'axios';
import config from '../config/environment';

// Create a separate axios instance for guest/public endpoints (no auth headers)
const guestAxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
});

export interface GuestApplyToJobPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  cv: File;
  expectedSalary: number;
  experienceYears: number;
  skills?: string[];
}

export interface GuestApplyToJobResponse {
  message: string;
  application: {
    id: number;
    candidateId: string;
    jobId: number;
    cvUrl: string;
    expectedSalary: number;
    experienceYears: number;
    skills: string[];
    atsScore: number | null;
    atsReport: string | null;
    status: 'NEW' | 'REVIEWED' | 'INTERVIEW' | 'REJECTED';
    createdAt: string;
    candidate: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string;
    };
    job: {
      id: number;
      title: string;
      location: string;
      employmentType: string;
    };
  };
  isGuest: boolean;
  canCreateAccount: boolean;
}

export interface ConvertGuestToUserPayload {
  email: string;
  password: string;
}

export interface ConvertGuestToUserResponse {
  message: string;
  id: string;
  email: string;
  devOtp?: string; // Only in development mode
}

const guestApplicationService = {
  /**
   * Apply to job as guest (no authentication required)
   */
  applyToJobAsGuest: async (
    jobId: number,
    formData: GuestApplyToJobPayload
  ): Promise<GuestApplyToJobResponse> => {
    const form = new FormData();

    // Required fields
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('expectedSalary', formData.expectedSalary.toString());
    form.append('experienceYears', formData.experienceYears.toString());
    form.append('cv', formData.cv);

    // Optional fields
    if (formData.firstName) {
      form.append('firstName', formData.firstName);
    }
    if (formData.lastName) {
      form.append('lastName', formData.lastName);
    }
    if (formData.skills && Array.isArray(formData.skills) && formData.skills.length > 0) {
      formData.skills.forEach((skill) => {
        form.append('skills', skill);
      });
    }

    try {
      const { data } = await guestAxiosInstance.post<GuestApplyToJobResponse>(
        `/applications/guest/${jobId}`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error('Guest application submission error:', {
        jobId,
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors,
      });
      throw error;
    }
  },

  /**
   * Convert guest user to regular user
   */
  convertGuestToUser: async (
    payload: ConvertGuestToUserPayload
  ): Promise<ConvertGuestToUserResponse> => {
    try {
      const { data } = await guestAxiosInstance.post<ConvertGuestToUserResponse>(
        '/auth/guest/create-account',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error('Convert guest to user error:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Request password reset OTP (works for both guest and regular users)
   */
  requestPasswordReset: async (email: string) => {
    try {
      const { data } = await guestAxiosInstance.post('/auth/password/forgot', {
        email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (error: any) {
      console.error('Request password reset error:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Verify password reset OTP
   */
  verifyPasswordResetOtp: async (email: string, otp: string) => {
    try {
      const { data } = await guestAxiosInstance.post('/auth/password/verify-otp', {
        email,
        otp,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (error: any) {
      console.error('Verify password reset OTP error:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Reset password with OTP (works for both guest and regular users)
   */
  resetPasswordWithOtp: async (email: string, otp: string, newPassword: string) => {
    try {
      const { data } = await guestAxiosInstance.post('/auth/password/reset', {
        email,
        otp,
        newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (error: any) {
      console.error('Reset password with OTP error:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

export default guestApplicationService;

