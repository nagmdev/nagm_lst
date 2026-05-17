import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import axios, { AxiosError } from 'axios';

// Define interfaces
export interface Question {
  text: string;
  leadershipPrincipleName?: string;
  companyName?: string; // Added companyName property
  id?: number; // Added id property
  // other properties
}

interface ApiErrorResponse {
  message?: string;
}

const useFetchQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [singleQuestion, setSingleQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized error handling
  const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return axiosError.response?.data?.message || `Server error: ${axiosError.message}`;
    }
    return 'An unexpected error occurred';
  };

  // Fetch all questions
  const fetchAllQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<Question[]>('/questions');

      const filteredQuestions = response.data.filter((q: Question) => q.id !== null);
      setQuestions(filteredQuestions);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single question by ID
  const fetchQuestionById = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<Question>(`/questions/${id}`);

        setSingleQuestion(response.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchAllQuestions();
  }, [fetchAllQuestions]);

  // Expose refresh function
  const refreshQuestions = useCallback(() => {
    fetchAllQuestions();
  }, [fetchAllQuestions]);

  return {
    questions,
    singleQuestion,
    fetchQuestionById,
    refreshQuestions,
    loading,
    error,
  };
};

export default useFetchQuestions;