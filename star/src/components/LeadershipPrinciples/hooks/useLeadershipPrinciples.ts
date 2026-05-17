
import { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { AxiosError } from 'axios';

export interface LeadershipPrinciple {
  id: number;
  name: string;
  description: string;
  companyId: number;
  createdAt?: string;
  updatedAt?: string;
  company?: {
    id: number;
    name: string;
  };
}

export interface CreateLeadershipPrincipleData {
  name: string;
  description: string;
  companyId: number;
}

export interface UpdateLeadershipPrincipleData {
  name?: string;
  description?: string;
  companyId?: number;
}

const useLeadershipPrinciples = () => {
  const [leadershipPrinciples, setLeadershipPrinciples] = useState<LeadershipPrinciple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeadershipPrinciples = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/leadership-principles');
      // API returns { data: [...] }
      const data = response.data;
      if (data && Array.isArray(data.data)) {
        setLeadershipPrinciples(data.data);
      } else {
        console.warn('Unexpected API response structure:', data);
        setLeadershipPrinciples([]);
      }
    } catch (err) {
      setError('Failed to fetch leadership principles.');
      console.error(err);
      setLeadershipPrinciples([]);
    } finally {
      setLoading(false);
    }
  };

  const getLeadershipPrincipleById = async (id: number) => {
    try {
      const response = await axiosInstance.get(`/leadership-principles/${id}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch leadership principle:', err);
      throw err;
    }
  };

  const createLeadershipPrinciple = async (principleData: CreateLeadershipPrincipleData) => {
    try {
      const response = await axiosInstance.post('/leadership-principles', principleData);
      await fetchLeadershipPrinciples(); // Refresh the list
      return response.data;
    } catch (err: unknown) {
      let errorMsg = 'Failed to create leadership principle.';
      if (err && typeof err === 'object' && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const backendMsg = axiosErr.response?.data?.message;
        if (backendMsg) {
          errorMsg = backendMsg;
        }
      }
      console.error('Failed to create leadership principle:', errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateLeadershipPrinciple = async (id: number, principleData: UpdateLeadershipPrincipleData) => {
    try {
      const response = await axiosInstance.put(`/leadership-principles/${id}`, principleData);
      await fetchLeadershipPrinciples(); // Refresh the list
      return response.data;
    } catch (err: unknown) {
      let errorMsg = 'Failed to update leadership principle.';
      if (err && typeof err === 'object' && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const backendMsg = axiosErr.response?.data?.message;
        if (backendMsg) {
          errorMsg = backendMsg;
        }
      }
      console.error('Failed to update leadership principle:', errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteLeadershipPrinciple = async (id: number) => {
    try {
      await axiosInstance.delete(`/leadership-principles/${id}`);
      await fetchLeadershipPrinciples(); // Refresh the list
    } catch (err: unknown) {
      let errorMsg = 'Failed to delete leadership principle.';
      if (err && typeof err === 'object' && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const backendMsg = axiosErr.response?.data?.message;
        if (backendMsg) {
          errorMsg = backendMsg;
        }
      }
      console.error('Failed to delete leadership principle:', errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchLeadershipPrinciples();
  }, []);

  return {
    leadershipPrinciples,
    loading,
    error,
    fetchLeadershipPrinciples,
    getLeadershipPrincipleById,
    createLeadershipPrinciple,
    updateLeadershipPrinciple,
    deleteLeadershipPrinciple,
  };
};

export default useLeadershipPrinciples; 