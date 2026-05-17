import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

export interface AdminStats {
  totalUsers: number;
  adminUsers?: number;
  superAdmins?: number;
  hrUsers?: number;
  regularUsers: number;
  guestUsers?: number; // Count of guest users (users without password)
  totalAnswers: number;
  totalAtsResults: number;
  totalCompanies: number;
  totalQuestions: number;
}

export interface RecentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  displayRole?: string; // Shows "Guest" for users without password
  isGuest?: boolean; // Boolean flag indicating if user is a guest
  createdAt: string;
}

export interface AdminStatsResponse {
  stats: AdminStats;
  recentUsers: RecentUser[];
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/user/admin/stats');
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
    } catch (err: any) {
      console.error('Failed to fetch admin stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, recentUsers, loading, error, refetch: fetchStats };
};
