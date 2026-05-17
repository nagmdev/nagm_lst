/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { CheckCircle2, Edit2, Trash2, Plus } from "lucide-react";
import useUserAnswers from "./hooks/useUserAnswers";
import LoadingSpinner from "../ui/LoadingSpinner";

import IStarResponse from '../../interfaces/IStarResponse';
import { useQuestions } from '../Questions/hooks/useQuestions';

const Answers = () => {
  const { answers, loading, error, createAnswer, updateAnswer, deleteAnswer } = useUserAnswers();
  const { questions } = useQuestions();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    situation: "",
    task: "",
    action: "",
    result: "",
    questionId: 0,
  });

  // Get question text by ID
  const getQuestionText = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    return question?.text || `Question ID: ${questionId}`;
  };

  const handleEdit = (answer: IStarResponse & { id: number; questionId: number }) => {
    const a = answer as IStarResponse & { id: number; questionId: number };
    setEditingId(a.id);
    setForm({
      situation: a.situation,
      task: a.task,
      action: a.action,
      result: a.result,
      questionId: a.questionId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateAnswer(editingId, { ...form, questionId: form.questionId });
      setEditingId(null);
    } else {
      await createAnswer({ ...form, questionId: form.questionId, date: new Date().toISOString() });
    }
    setForm({ situation: "", task: "", action: "", result: "", questionId: 0 });
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      await deleteAnswer(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({ situation: "", task: "", action: "", result: "", questionId: 0 });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">Error loading answers.</p>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          Saved Answers
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add New Answer
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? "Edit Answer" : "Create New Answer"}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Question
            </label>
            <select
              value={form.questionId || ""}
              onChange={e => setForm(f => ({ ...f, questionId: Number(e.target.value) }))}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Choose a question...</option>
              {questions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Situation
            </label>
            <textarea
              placeholder="Describe the situation..."
              value={form.situation}
              onChange={e => setForm(f => ({ ...f, situation: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded dark:bg-gray-700 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task
            </label>
            <textarea
              placeholder="What was your task or responsibility?"
              value={form.task}
              onChange={e => setForm(f => ({ ...f, task: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded dark:bg-gray-700 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action
            </label>
            <textarea
              placeholder="What actions did you take?"
              value={form.action}
              onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded dark:bg-gray-700 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Result
            </label>
            <textarea
              placeholder="What was the outcome?"
              value={form.result}
              onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded dark:bg-gray-700 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {editingId ? "Update" : "Create"} Answer
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Answers List */}
      <div className="grid gap-6">
        {answers && answers.length > 0 ? (
          answers.map((answer) => {
            const a = answer as IStarResponse & { id: number; questionId: number };
            return (
              <div key={a.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Question:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    {getQuestionText(a.questionId)}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-900 dark:text-white">Situation:</strong> 
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{a.situation}</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Task:</strong> 
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{a.task}</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Action:</strong> 
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{a.action}</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Result:</strong> 
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{a.result}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleEdit(a)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No saved answers yet.</p>
            <p className="text-gray-400 dark:text-gray-500">Create your first STAR answer to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Answers;