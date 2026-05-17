import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'hr' | 'user';
  displayRole?: string; // Shows "Guest" for users without password
  isGuest?: boolean; // Boolean flag indicating if user is a guest
  roles?: string[];
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    answers: number;
    atsResults: number;
  };
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'superadmin' | 'hr' | 'user';
  isGuest?: 'all' | 'true' | 'false'; // Filter by guest status
  sortBy?: 'firstName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const useAdminUsers = (filters: UsersFilters = {}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters.isGuest && filters.isGuest !== 'all') params.append('isGuest', filters.isGuest);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await axiosInstance.get(`/user/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.limit, filters.search, filters.role, filters.isGuest, filters.sortBy, filters.sortOrder]);

  const updateUserRole = async (userId: string, newRole: 'superadmin' | 'hr' | 'user') => {
    try {
      await axiosInstance.put(`/user/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      throw new Error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await axiosInstance.delete(`/user/admin/users/${userId}`);
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return {
    users,
    pagination,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    deleteUser,
  };
};
