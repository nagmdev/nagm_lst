/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import useDeepSeekQuestions, { DeepSeekQuestion, CreateDeepSeekQuestionData, UpdateDeepSeekQuestionData } from "./hooks/useDeepSeekQuestions";
import useCompanies from '../Companies/hooks/useCompanies';
import { usePositions } from '../Positions/hooks/usePositions';
import useLeadershipPrinciples from '../LeadershipPrinciples/hooks/useLeadershipPrinciples';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminOnly from '../ui/AdminOnly';
import { Sparkles, Plus, X, RefreshCw, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const questionTypeOptions = [
  { label: "Behavioral", value: "BEHAVIORAL" },
  { label: "Situational", value: "SITUATIONAL" },
  { label: "Technical", value: "TECHNICAL" },
  { label: "Competency Based", value: "COMPETENCY_BASED" },
  { label: "Problem Solving", value: "PROBLEM_SOLVING" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Case Study", value: "CASE_STUDY" },
];

export const DeepSeekQuestionTester: React.FC = () => {
  const {
    questions,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useDeepSeekQuestions();

  const { companies } = useCompanies();
  const { positions } = usePositions();
  const { leadershipPrinciples } = useLeadershipPrinciples();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateDeepSeekQuestionData>({
    questionType: '',
    positionId: undefined,
    companyId: undefined,
    leadershipPrincipleId: undefined,
  });
  const [formError, setFormError] = useState('');
  const [regenerate, setRegenerate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleEdit = (q: DeepSeekQuestion) => {
    setEditingId(q.id);
    setForm({
      questionType: q.questionType || '',
      positionId: q.positionId,
      companyId: q.companyId,
      leadershipPrincipleId: q.leadershipPrincipleId,
    });
    setRegenerate(false);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this DeepSeek question?')) {
      try {
        await deleteQuestion(id);
        toast.success('Question deleted');
      } catch {
        toast.error('Failed to delete question');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      questionType: '',
      positionId: undefined,
      companyId: undefined,
      leadershipPrincipleId: undefined,
    });
    setRegenerate(false);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.questionType) {
      setFormError('Question type is required');
      return;
    }
    try {
      if (editingId) {
        const updatePayload: UpdateDeepSeekQuestionData = {
          ...form,
          regenerate,
        };
        await updateQuestion(editingId, updatePayload);
        toast.success('Question updated');
      } else {
        await createQuestion(form);
        toast.success('Question created');
      }
      handleCancel();
    } catch {
      setFormError('Failed to save question');
    }
  };

  // Safety checks for arrays
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const safePositions = Array.isArray(positions) ? positions : [];
  const safeLeadershipPrinciples = Array.isArray(leadershipPrinciples) ? leadershipPrinciples : [];

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <AdminOnly>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ToastContainer />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">DeepSeek AI Questions</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl">
                Manage and generate AI-powered interview questions. Use filters and edit or regenerate questions as needed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 transition text-base sm:text-lg font-semibold w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New Question
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" /> {editingId ? 'Edit DeepSeek Question' : 'Add New DeepSeek Question'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Type *</label>
                    <select
                      value={form.questionType || ''}
                      onChange={e => setForm(f => ({ ...f, questionType: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select type...</option>
                      {questionTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                    <select
                      value={form.companyId || ''}
                      onChange={e => setForm(f => ({ ...f, companyId: Number(e.target.value) || undefined }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select company...</option>
                      {safeCompanies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                    <select
                      value={form.positionId || ''}
                      onChange={e => setForm(f => ({ ...f, positionId: Number(e.target.value) || undefined }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select position...</option>
                      {safePositions.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leadership Principle</label>
                    <select
                      value={form.leadershipPrincipleId || ''}
                      onChange={e => setForm(f => ({ ...f, leadershipPrincipleId: Number(e.target.value) || undefined }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select principle...</option>
                      {safeLeadershipPrinciples.map(lp => (
                        <option key={lp.id} value={lp.id}>{lp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {editingId && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={regenerate}
                      onChange={e => setRegenerate(e.target.checked)}
                      id="regenerate"
                      className="mr-2"
                    />
                    <label htmlFor="regenerate" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" /> Regenerate with DeepSeek
                    </label>
                  </div>
                )}
                {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold">
                    {editingId ? 'Update' : 'Create'} Question
                  </button>
                  <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {safeQuestions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No DeepSeek questions available.</p>
            </div>
          ) : (
            safeQuestions.map(q => {
              const expanded = expandedId === q.id;
              return (
                <div key={q.id} className={`relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 group hover:shadow-2xl ${expanded ? 'ring-2 ring-indigo-400' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                      {q.questionType || 'N/A'}
                    </span>
                    {q.companyName && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">{q.companyName}</span>}
                    {q.leadershipPrincipleName && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">{q.leadershipPrincipleName}</span>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
                    {q.text}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {q.deepSeekInteraction && (
                      <>
                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Prompt:</span> {q.deepSeekInteraction.prompt}</div>
                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Response:</span> {q.deepSeekInteraction.response}</div>
                      </>
                    )}
                    {q.positionId && <div><span className="font-semibold">Position:</span> {safePositions.find(p => p.id === q.positionId)?.title || q.positionId}</div>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(q)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setExpandedId(expanded ? null : q.id)}
                      className="flex items-center justify-center px-2 py-2 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition"
                      aria-label={expanded ? 'Collapse details' : 'Expand details'}
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expanded && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="mb-2"><span className="font-semibold">ID:</span> {q.id}</div>
                      {q.companyName && <div className="mb-2"><span className="font-semibold">Company:</span> {q.companyName}</div>}
                      {q.leadershipPrincipleName && <div className="mb-2"><span className="font-semibold">Principle:</span> {q.leadershipPrincipleName}</div>}
                      {q.positionId && <div className="mb-2"><span className="font-semibold">Position ID:</span> {q.positionId}</div>}
                      {q.deepSeekInteraction && (
                        <>
                          <div className="mb-2"><span className="font-semibold">Prompt:</span> {q.deepSeekInteraction.prompt}</div>
                          <div className="mb-2"><span className="font-semibold">Response:</span> {q.deepSeekInteraction.response}</div>
                        </>
                      )}
                      <div className="mb-2"><span className="font-semibold">Created:</span> {q.createdAt ? new Date(q.createdAt).toLocaleString() : 'N/A'}</div>
                      <div><span className="font-semibold">Updated:</span> {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : 'N/A'}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminOnly>
  );
};
