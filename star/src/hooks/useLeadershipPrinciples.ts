/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-toastify';

// Types
interface LeadershipPrinciple {
  id: number;
  name: string;
  description: string;
  companyId: number;
}

interface UseLeadershipPrinciplesReturn {
  leadershipPrinciples: LeadershipPrinciple[];
  loading: boolean;
}

// Hook
export const useLeadershipPrinciples = (): UseLeadershipPrinciplesReturn => {
  const [leadershipPrinciples, setLeadershipPrinciples] = useState<LeadershipPrinciple[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeadershipPrinciples = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/leadership-principles');
      if (Array.isArray(data)) {
        setLeadershipPrinciples(data);
      } else if (data && Array.isArray(data.data)) {
        setLeadershipPrinciples(data.data);
      } else {
        toast.error('Unexpected leadership principles format');
      }
    } catch (error) {
      toast.error('Failed to load leadership principles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeadershipPrinciples();
  }, [fetchLeadershipPrinciples]);

  return { leadershipPrinciples, loading };
};
