import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import { UserProfile } from '../types/users';


const useUserData = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/user/profile');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError('Failed to fetch user data.');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { user, isAuthenticated, isLoading, error, logout: () => {} };
};

export default useUserData;