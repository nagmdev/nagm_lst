import { useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import axiosInstance from '../../../services/axiosInstance';
import { UserProfile } from '../../../types/users';

type UpdateProfilePayload = Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>;

interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

const useUserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserProfileData = useCallback(
    async (userData: Partial<UpdateProfilePayload>) => {
      const sanitizedPayload = Object.entries(userData).reduce<Partial<UpdateProfilePayload>>(
        (acc, [key, value]) => {
          const trimmedValue = typeof value === 'string' ? value.trim() : value;
          if (trimmedValue) {
            acc[key as keyof UpdateProfilePayload] = trimmedValue;
          }
          return acc;
        },
        {}
      );

      if (Object.keys(sanitizedPayload).length === 0) {
        const validationMessage = 'Please provide at least one field to update.';
        setError(validationMessage);
        throw new Error(validationMessage);
      }

    setLoading(true);
    setError(null);
    try {
        const response = await axiosInstance.put<UpdateProfileResponse>(
          '/user/update',
          sanitizedPayload,
          {
            withCredentials: true,
          }
        );
      await refreshUser();
        return response.data;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Failed to update profile.';
        setError(errorMessage);
        throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
    },
    [refreshUser]
  );

  return { userData: user, loading, error, updateUserProfileData };
};

export default useUserProfile;
