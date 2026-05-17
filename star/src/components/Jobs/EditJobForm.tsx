import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jobService, { UpdateJobPayload, Job } from '../../services/jobService';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { ArrowLeft, Save } from 'lucide-react';

const EditJobForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin, isHr } = useRoleAccess();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<UpdateJobPayload>({
    title: '',
    description: '',
    responsibilities: '',
    location: '',
    requirements: [],
    salaryMin: 0,
    salaryMax: 0,
    employmentType: 'FULL_TIME',
  });
  const [requirementsInput, setRequirementsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isSuperAdmin && !isHr) {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    // Validate ID is a valid number
    const jobId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(jobId) || jobId <= 0) {
      toast.error('Invalid job ID');
      navigate('/admin/jobs');
      return;
    }

    try {
      setLoading(true);
      const response = await jobService.getJobById(jobId);
      const loadedJob = response.job;
      setJob(loadedJob);

      // Role check is enforced by route guard; keep a safety net
      if (!isSuperAdmin && !isHr) {
        toast.error('You do not have permission to edit jobs.');
        navigate('/unauthorized');
        return;
      }

      setFormData({
        title: loadedJob.title,
        description: loadedJob.description,
        responsibilities: loadedJob.responsibilities,
        location: loadedJob.location,
        requirements: loadedJob.requirements || [],
        salaryMin: loadedJob.salaryMin,
        salaryMax: loadedJob.salaryMax,
        employmentType: loadedJob.employmentType as any,
      });
      setRequirementsInput((loadedJob.requirements || []).join(', '));
    } catch (error: any) {
      console.error('Error loading job:', error);
      if (error.response?.status === 403) {
        toast.error('You can only edit job posts that you created.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load job');
      }
      navigate('/admin/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'salaryMin' || name === 'salaryMax') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirementsInput(e.target.value);
    const requirements = e.target.value
      .split(',')
      .map(r => r.trim())
      .filter(r => r);
    setFormData(prev => ({ ...prev, requirements }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.responsibilities?.trim()) {
      newErrors.responsibilities = 'Responsibilities are required';
    }
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }
    if (formData.salaryMin && formData.salaryMin < 0) {
      newErrors.salaryMin = 'Salary must be positive';
    }
    if (formData.salaryMax && formData.salaryMin && formData.salaryMax < formData.salaryMin) {
      newErrors.salaryMax = 'Max salary must be greater than min salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Validate ID before updating
    const jobId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(jobId) || jobId <= 0) {
      toast.error('Invalid job ID');
      return;
    }

    // Only HR or superadmin can update jobs
    if (!isSuperAdmin && !isHr) {
      toast.error('You do not have permission to update jobs.');
      return;
    }

    setSaving(true);
    try {
      const result = await jobService.updateJob(jobId, formData);
      
      toast.success('Job updated successfully! Status remains unchanged.');
      
      navigate(`/jobs/${id}`);
    } catch (error: any) {
      console.error('Error updating job:', error);
      
      if (error.response?.status === 403) {
        toast.error('You can only update job posts that you created.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.error || 'Cannot edit approved job. Please contact admin.');
      } else if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          validationErrors[err.param] = err.msg;
        });
        setErrors(validationErrors);
        toast.error('Please fix the validation errors');
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to update job';
        toast.error(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Job Post</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update the job details below. Status will remain unchanged.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Same form fields as CreateJobForm */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Responsibilities *
            </label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              required
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.responsibilities ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.responsibilities && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.responsibilities}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.location && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>}
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirements (comma-separated)
            </label>
            <textarea
              id="requirements"
              value={requirementsInput}
              onChange={handleRequirementsChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Salary 
              </label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                value={formData.salaryMin || ''}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.salaryMin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.salaryMin && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salaryMin}</p>}
            </div>
            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Salary 
              </label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                value={formData.salaryMax || ''}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.salaryMax ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.salaryMax && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salaryMax}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate(`/jobs/${id}`)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobForm;

