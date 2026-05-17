import { useState, useCallback } from 'react';
import axiosInstance from '../../../services/axiosInstance';

export interface ATSResult {
  id?: number;
  userId?: string;
  jobId?: number | null;
  job?: {
    id: number;
    title: string;
    location?: string | null;
  } | null;
  cvPath: string;
  jobDescription: string;
  atsScore: number;
  recommendations: string;
  pass: boolean;
  createdAt: string;
  updatedAt?: string;
  atsResultId?: number;
  fullReportJson?: unknown;
}

export const useATS = () => {
  const [results, setResults] = useState<ATSResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload CV and job description for ATS check
  const uploadATSCheck = useCallback(
    async (cvFile: File, jobDescription: string): Promise<ATSResult> => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('cv', cvFile);
        formData.append('jobDescription', jobDescription);
        const response = await axiosInstance.post('/ats/check', formData);
        const result: ATSResult = response.data;
        return result;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setError(axiosErr.response?.data?.message || 'Failed to analyze CV.');
        } else {
          setError('Failed to analyze CV.');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch all ATS results for the user
  const getATSResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ats/history');
      const raw = response.data;
      const items: ATSResult[] =
        raw?.results ||
        raw?.data?.results ||
        raw?.data ||
        raw ||
        [];
      setResults(items);
      return items;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to fetch ATS results.');
      } else {
        setError('Failed to fetch ATS results.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, uploadATSCheck, getATSResults };
};
export default useATS; 