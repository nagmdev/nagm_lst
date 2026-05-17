import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import useLeadershipPrinciples, { LeadershipPrinciple, CreateLeadershipPrincipleData } from './hooks/useLeadershipPrinciples';
import useCompanies from '../Companies/hooks/useCompanies';
import AdminOnly from '../ui/AdminOnly';
import LoadingSpinner from '../ui/LoadingSpinner';

const LeadershipPrinciples: React.FC = () => {
  const {
    leadershipPrinciples,
    loading,
    error,
    createLeadershipPrinciple,
    updateLeadershipPrinciple,
    deleteLeadershipPrinciple,
  } = useLeadershipPrinciples();

  const { companies } = useCompanies();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLeadershipPrincipleData>({
    name: '',
    description: '',
    companyId: 0,
  });
  const [formError, setFormError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Principle name is required');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }

    if (!formData.companyId) {
      setFormError('Company is required');
      return;
    }

    try {
      if (editingId) {
        await updateLeadershipPrinciple(editingId, formData);
      } else {
        await createLeadershipPrinciple(formData);
      }
      handleCancel();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save leadership principle';
      setFormError(errorMessage);
    }
  };

  const handleEdit = (principle: LeadershipPrinciple) => {
    setEditingId(principle.id);
    setFormData({
      name: principle.name,
      description: principle.description,
      companyId: principle.companyId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this leadership principle?')) {
      try {
        await deleteLeadershipPrinciple(id);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete leadership principle';
        alert(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      companyId: 0,
    });
    setFormError('');
  };

  const getCompanyName = (companyId: number) => {
    const company = companies?.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
  };

  // Ensure leadershipPrinciples is always an array
  const safeLeadershipPrinciples = Array.isArray(leadershipPrinciples) ? leadershipPrinciples : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <AdminOnly>
      <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            Leadership Principles Management
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Add Principle
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Leadership Principle' : 'Add New Leadership Principle'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Principle Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Innovation, Customer Obsession"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Describe the leadership principle..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company *
                </label>
                <select
                  value={formData.companyId || ''}
                  onChange={(e) => setFormData({ ...formData, companyId: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a company</option>
                  {safeCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-red-500 text-sm mt-2">{formError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                {editingId ? 'Update' : 'Create'} Principle
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

        {/* Leadership Principles List */}
        <div className="grid gap-4">
          {safeLeadershipPrinciples.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No leadership principles available.</p>
            </div>
          ) : (
            safeLeadershipPrinciples.map((principle) => (
              <div
                key={principle.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {principle.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building2 className="w-4 h-4" />
                        {getCompanyName(principle.companyId)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {principle.description}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(principle)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(principle.id)}
                      className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminOnly>
  );
};

export default LeadershipPrinciples; 