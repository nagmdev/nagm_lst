/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import { UserProfile as User } from '../types/users';
import Cookies from 'js-cookie';

export interface AuthContextType {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isHr: boolean;
  isUserRole: boolean;
  isAdmin: boolean; // backwards compatibility; aliases isSuperAdmin
  login: (accessToken: string, refreshToken: string, role?: string) => void;
  logout: () => void;
  register: (userData: any) => Promise<any>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(() => Cookies.get('role') || null);

  const fetchUserProfile = useCallback(async () => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      try {
        const response = await axiosInstance.get('/user/profile');
        setUser(response.data);
        if (response.data?.role) {
          setRole(response.data.role);
          const isSecure = window.location.protocol === 'https:';
          Cookies.set('role', response.data.role, { secure: isSecure, sameSite: 'strict', expires: 7 });
        }
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        // Handle network errors, 403, and 401 responses
        if (!error.response || error.response.status === 403 || error.response.status === 401) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('role');
          setUser(null);
          setRole(null);
        }
      }
    } else {
      // No token available, ensure user is null
      setUser(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUserProfile();
      setIsLoading(false);
    };
    initializeAuth();
  }, [fetchUserProfile]);

  const login = (accessToken: string, refreshToken: string, loginRole?: string) => {
    const isSecure = window.location.protocol === 'https:';
    // access: 15m, refresh: 7d
    Cookies.set('accessToken', accessToken, { secure: isSecure, sameSite: 'strict', expires: 15 / (24 * 60) });
    Cookies.set('refreshToken', refreshToken, { secure: isSecure, sameSite: 'strict', expires: 7 });
    if (loginRole) {
      Cookies.set('role', loginRole, { secure: isSecure, sameSite: 'strict', expires: 7 });
      setRole(loginRole);
    }
    fetchUserProfile();
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('role');
      setUser(null);
      setRole(null);
    }
  };

  const register = async (userData: any) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  };

  const refreshUser = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // Derive role flags (supports both single role and multiple roles)
  const effectiveRole = role || user?.role || (user?.roles?.[0] ?? null);
  const isSuperAdmin = effectiveRole === 'superadmin' || user?.roles?.includes('superadmin') || false;
  const isHr = effectiveRole === 'hr' || user?.roles?.includes('hr') || false;
  const isUserRole = effectiveRole === 'user' || user?.roles?.includes('user') || false;
  const isAdmin = isSuperAdmin; // backward compatibility

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: effectiveRole,
      isAuthenticated: !!user, 
      isLoading, 
      isSuperAdmin,
      isHr,
      isUserRole,
      isAdmin,
      login, 
      logout, 
      register, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

