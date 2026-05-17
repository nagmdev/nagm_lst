/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';

export interface DeepSeekInteraction {
  id?: number;
  prompt: string;
  response: string;
  position?: any;
  company?: any;
  leadershipPrinciple?: any;
}

export interface DeepSeekQuestion {
  id: number;
  text: string;
  companyName?: string;
  leadershipPrincipleName?: string;
  questionType?: string;
  deepSeekInteractionId?: number;
  deepSeekInteraction?: DeepSeekInteraction;
  positionId?: number;
  companyId?: number;
  leadershipPrincipleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeepSeekQuestionData {
  questionType: string;
  positionId?: number;
  companyId?: number;
  leadershipPrincipleId?: number;
}

export interface UpdateDeepSeekQuestionData extends Partial<CreateDeepSeekQuestionData> {
  text?: string;
  regenerate?: boolean;
}

export interface DeepSeekQuestionFilters {
  id?: number;
  questionType?: string;
  positionId?: number;
  companyId?: number;
  leadershipPrincipleId?: number;
}

const useDeepSeekQuestions = () => {
  const [questions, setQuestions] = useState<DeepSeekQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async (filters?: DeepSeekQuestionFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = filters ? { ...filters } : {};
      const response = await axiosInstance.get('/deepseek/questions/list', { params });
      const data = response.data;
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        setQuestions([]);
        console.warn('Unexpected DeepSeek API response:', data);
      }
    } catch (err) {
      setError('Failed to fetch DeepSeek questions.');
      setQuestions([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = async (id: number) => {
    try {
      const response = await axiosInstance.get('/deepseek/questions/list', { params: { id } });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch DeepSeek question by id:', err);
      throw err;
    }
  };

  const createQuestion = async (questionData: CreateDeepSeekQuestionData) => {
    try {
      const response = await axiosInstance.post('/deepseek/questions/create', questionData);
      await fetchQuestions();
      return response.data;
    } catch (err) {
      console.error('Failed to create DeepSeek question:', err);
      throw err;
    }
  };

  const updateQuestion = async (id: number, questionData: UpdateDeepSeekQuestionData) => {
    try {
      const response = await axiosInstance.put(`/deepseek/questions/update/${id}`, questionData);
      await fetchQuestions();
      return response.data;
    } catch (err) {
      console.error('Failed to update DeepSeek question:', err);
      throw err;
    }
  };

  const deleteQuestion = async (id: number) => {
    try {
      await axiosInstance.delete(`/deepseek/questions/delete/${id}`);
      await fetchQuestions();
    } catch (err) {
      console.error('Failed to delete DeepSeek question:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

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

export default useDeepSeekQuestions;
