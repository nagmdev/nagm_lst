import { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';

interface Question {
  id: number;
  text: string;
  companyName: string;
  leadershipPrincipleName?: string;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get<Question[]>('/questions');
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = async (id: number) => {
    const { data } = await axiosInstance.get<Question>(`/questions/${id}`);
    return data;
  };

  const createQuestion = async (question: Partial<Question>) => {
    const { data } = await axiosInstance.post<Question>('/questions', question);
    await fetchQuestions();
    return data;
  };

  const updateQuestion = async (id: number, question: Partial<Question>) => {
    const { data } = await axiosInstance.put<Question>(`/questions/${id}`, question);
    await fetchQuestions();
    return data;
  };

  const deleteQuestion = async (id: number) => {
    await axiosInstance.delete(`/questions/${id}`);
    await fetchQuestions();
  };

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};