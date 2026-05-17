/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Circle, GraduationCap, PlusCircle, X, AlertCircle, Check, List } from 'lucide-react';
import { usePractice } from './hooks/usePractice';
import { StarResponse, Question } from './hooks/usePractice';
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['situation', 'task', 'action', 'result'];

const Practice: React.FC = () => {
  const {
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
  } = usePractice();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    companyName: '',
    leadershipPrincipleName: '',
  });
  const [formErrors, setFormErrors] = useState<{ text?: string; company?: string }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus trap for modal and dropdown
  useEffect(() => {
    if (isModalOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsQuestionsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
      if (questionsRef.current && !questionsRef.current.contains(e.target as Node)) {
        setIsQuestionsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, isQuestionsOpen]);

  const handleCreateInputChange = (field: keyof typeof newQuestion, value: string) => {
    setNewQuestion((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const errors: { text?: string; company?: string } = {};
    if (!newQuestion.text.trim()) {
      errors.text = 'Question text is required';
    }
    if (newQuestion.leadershipPrincipleName.trim() && !newQuestion.companyName.trim()) {
      errors.company = 'Company name is required when leadership principle is provided';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async () => {
    if (!validateForm()) return;

    const result = await createQuestion(
      newQuestion.text,
      newQuestion.companyName || undefined,
      newQuestion.leadershipPrincipleName || undefined
    );

    if (result) {
      setNewQuestion({ text: '', companyName: '', leadershipPrincipleName: '' });
      setIsModalOpen(false);
      setTimeout(() => setCreateSuccess(null), 3000);
    }
  };

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedQuestionId(question.id);
    setIsQuestionsOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header and Progress Bar */}
      <div className="space-y-4 sm:space-y-6">
        <Header />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
          <div className="flex items-center w-full sm:w-auto min-w-max">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-shrink-0">
                <motion.div
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-500 transform hover:scale-110 cursor-pointer ${
                    currentStep >= index
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={{ scale: currentStep === index ? 1.15 : 1 }}
                >
                  {currentStep > index ? <CheckCircle size={20} className="sm:w-6 sm:h-6" /> : <Circle size={20} className="sm:w-6 sm:h-6" />}
                </motion.div>
                <span
                  className={`ml-2 sm:ml-3 font-medium text-sm sm:text-base tracking-wide hidden sm:inline ${
                    currentStep === index ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-6 sm:w-12 h-1 rounded-full transition-all duration-500 mx-2 sm:mx-3 ${
                      currentStep > index ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Question Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Question
        </button>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 w-full max-w-md mx-4 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-700/50 dark:to-gray-800/50 opacity-50" />
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full p-1 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-8 relative z-10">
                New Question
              </h3>
              <div className="space-y-8 relative z-10">
                <div>
                  <label htmlFor="question-text" className="block mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    ref={firstInputRef}
                    id="question-text"
                    value={newQuestion.text}
                    onChange={(e) => handleCreateInputChange('text', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-0 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.text ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.text && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.text}
                    </motion.p>
                  )}
                </div>
                <div>
                  <label htmlFor="company-name" className="block mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={newQuestion.companyName}
                    onChange={(e) => handleCreateInputChange('companyName', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-0 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.company ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.company && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.company}
                    </motion.p>
                  )}
                </div>
                <div>
                  <label htmlFor="leadership-principle" className="block mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Leadership Principle
                  </label>
                  <input
                    id="leadership-principle"
                    type="text"
                    value={newQuestion.leadershipPrincipleName}
                    onChange={(e) => handleCreateInputChange('leadershipPrincipleName', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-0 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                {createError && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm bg-red-50/80 dark:bg-red-900/20 p-4 rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {createError}
                  </motion.p>
                )}
                {createSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 dark:text-green-400 text-sm bg-green-50/80 dark:bg-green-900/20 p-4 rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <Check className="w-5 h-5" />
                    {createSuccess}
                  </motion.p>
                )}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleCreateSubmit}
                    disabled={createLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    {createLoading ? 'Creating...' : 'Create Question'}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative">
        <label className="block text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Select a Question
        </label>
        {questionLoading ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">Loading question...</p>
        ) : questionError ? (
          <p className="text-red-600 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {questionError}
          </p>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={selectedQuestion?.text || ''}
              readOnly
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-0 cursor-default"
              placeholder="No question selected"
            />
            <button
              onClick={() => {
                setIsQuestionsOpen(true);
                fetchInterviewQuestions();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
              aria-label="Choose interview question"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        )}
        {selectedQuestion && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedQuestion.companyName && (
              <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
                {selectedQuestion.companyName}
              </span>
            )}
            {selectedQuestion.leadershipPrincipleName && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                {selectedQuestion.leadershipPrincipleName}
              </span>
            )}
          </div>
        )}

        {/* Interview Questions Dropdown */}
        <AnimatePresence>
          {isQuestionsOpen && (
            <motion.div
              ref={questionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto z-10"
            >
              {questionLoading ? (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-sm italic">Loading questions...</p>
              ) : questionError ? (
                <p className="p-4 text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {questionError}
                </p>
              ) : interviewQuestions.length === 0 ? (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-sm italic">No questions available</p>
              ) : (
                interviewQuestions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200"
                    onClick={() => handleSelectQuestion(question)}
                  >
                    <p className="text-gray-800 dark:text-white font-medium">{question.text}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {question.companyName && (
                        <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full">
                          {question.companyName}
                        </span>
                      )}
                      {question.leadershipPrincipleName && (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
                          {question.leadershipPrincipleName}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Error */}
      {submitError && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm font-medium flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl"
        >
          <AlertCircle className="w-5 h-5" />
          {submitError}
        </motion.p>
      )}

      <ResponseForm
        response={response}
        setResponse={setResponse}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        loading={loading}
      />
    </div>
  );
};

const Header: React.FC = () => (
  <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
    <GraduationCap className="w-8 h-8 text-indigo-600" />
    STAR Questions
  </h2>
);

interface ResponseFormProps {
  response: StarResponse;
  setResponse: React.Dispatch<React.SetStateAction<StarResponse>>;
  handleSubmit: () => void;
  handleInputChange: (field: keyof StarResponse, value: string) => void;
  loading: boolean;
}

const ResponseForm: React.FC<ResponseFormProps> = ({
  response,
  handleSubmit,
  handleInputChange,
  loading,
}) => {
  const [focused, setFocused] = React.useState<Record<string, boolean>>({});

  const onFocus = (step: string) => {
    setFocused((s) => ({ ...s, [step]: true }));
  };
  const onBlur = (step: string) => {
    setFocused((s) => ({ ...s, [step]: false }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="space-y-6">
        {steps.map((step) => {
          const value = (response[step as keyof StarResponse] as string) || '';
          return (
            <div key={step} className="relative">
              <label htmlFor={`star-${step}`} className="block mb-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </label>
              <textarea
                value={value}
                onChange={(e) => handleInputChange(step as keyof StarResponse, e.target.value)}
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white"
                rows={5}
                placeholder=""
                id={`star-${step}`}
              />
            </div>
          );
        })}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-sm"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;