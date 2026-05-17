import { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import IStarResponse from '../../../interfaces/IStarResponse';

const useUserAnswers = () => {
  const [answers, setAnswers] = useState<IStarResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/answers/get_user_answers');
      setAnswers(response.data);
    } catch (err) {
      setError('Failed to fetch answers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  const createAnswer = async (payload: Omit<IStarResponse, 'id'> & { questionId: number }) => {
    await axiosInstance.post('/answers/create', payload);
    await fetchAnswers();
  };

  const updateAnswer = async (id: number, payload: Partial<IStarResponse> & { questionId: number }) => {
    await axiosInstance.put(`/answers/update/${id}`, payload);
    await fetchAnswers();
  };

  const deleteAnswer = async (id: number) => {
    await axiosInstance.delete(`/answers/delete/${id}`);
    await fetchAnswers();
  };

  return { answers, loading, error, createAnswer, updateAnswer, deleteAnswer };
};

export default useUserAnswers;