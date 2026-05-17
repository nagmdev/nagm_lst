/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import { AxiosError } from 'axios';
import { useAuth } from '../../../hooks/useAuth'; // Uncomment if you want to get userId from context
import { jwtDecode } from 'jwt-decode';

function getUserIdFromToken(): string | undefined {
  // For now, we'll use the user's email as the userId
  // This should be replaced with the actual user ID from the backend
  return undefined;
}

export interface StarResponse {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface Question {
  id: number;
  text: string;
  companyName: string | null;
  leadershipPrincipleName: string | null;
}

export const usePractice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.email; // Use email as userId for now

  const [response, setResponse] = useState<StarResponse>({
    situation: '',
    task: '',
    action: '',
    result: '',
  });
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch question by URL ID
  useEffect(() => {
    if (id) {
      const questionId = Number(id);
      if (!isNaN(questionId)) {
        getInterviewQuestionById(questionId);
      }
    }
  }, [id]);

  // Fetch question by ID
  const getInterviewQuestionById = async (id: number) => {
    setQuestionLoading(true);
    setQuestionError(null);
    try {
      const res = await axiosInstance.get(`/questions/${id}`);
      const question: Question = res.data;
      setSelectedQuestion(question);
      setSelectedQuestionId(id);
      return question;
    } catch (err: any) {
      const error = err as AxiosError<{ error?: string }>;
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch question';
      setQuestionError(errorMessage);
      console.error('Question fetch error:', errorMessage, error.response?.status);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return null;
    } finally {
      setQuestionLoading(false);
    }
  };

  // Fetch all interview questions (on demand)
  const fetchInterviewQuestions = async () => {
    setQuestionLoading(true);
    setQuestionError(null);
    try {
      const res = await axiosInstance.get('/questions');
      setInterviewQuestions(res.data);
    } catch (err: any) {
      const error = err as AxiosError<{ error?: string }>;
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch questions';
      setQuestionError(errorMessage);
      console.error('Questions fetch error:', errorMessage, error.response?.status);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleInputChange = (field: keyof StarResponse, value: string) => {
    setResponse((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selectedQuestionId) {
      setSubmitError('No question selected');
      return;
    }
    const { situation, task, action, result } = response;
    if (!situation.trim() || !task.trim() || !action.trim() || !result.trim()) {
      setSubmitError('Please fill out all STAR fields');
      return;
    }

    setLoading(true);
    setSubmitError(null);
    try {
      await axiosInstance.post('/answers/create', {
        ...response,
        questionId: selectedQuestionId,
        audioUrl: null,
      });
      setResponse({ situation: '', task: '', action: '', result: '' });
      setCurrentStep(0);
    } catch (err: any) {
      const error = err as AxiosError<{ error?: string }>;
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to submit answer';
      setSubmitError(errorMessage);
      console.error('Submit error:', errorMessage, error.response?.status);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new question
  const createQuestion = async (
    text: string,
    companyName?: string,
    leadershipPrincipleName?: string
  ) => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const res = await axiosInstance.post('/questions', {
        text,
        companyName: companyName || null,
        leadershipPrincipleName: leadershipPrincipleName || null,
      });
      const newQuestion: Question = res.data;
      await getInterviewQuestionById(newQuestion.id); // Fetch to set selected
      setCreateSuccess('Question created successfully!');
      return newQuestion;
    } catch (err: any) {
      const error = err as AxiosError<{ error?: string }>;
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to create question';
      setCreateError(errorMessage);
      console.error('Create question error:', errorMessage, error.response?.status);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return null;
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    response,
    setResponse,
    selectedQuestionId,
    setSelectedQuestionId,
    selectedQuestion,
    setSelectedQuestion,
    interviewQuestions,
    fetchInterviewQuestions,
    getInterviewQuestionById,
    loading,
    currentStep,
    questionLoading,
    questionError,
    handleInputChange,
    handleSubmit,
    createQuestion,
    createLoading,
    createError,
    createSuccess,
    setCreateSuccess,
    submitError,
  };
};