import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import { Job } from '../../services/jobService';
import { Check, X, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminJobReview: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED' | 'ALL'>('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, [statusFilter, pagination.page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      const response = await adminService.getAllJobs(filters);
      setJobs(response.jobs);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages,
      }));
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      if (error.response?.status === 403) {
        toast.error('You can only review job posts that you created.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId: number, newStatus: 'APPROVED' | 'REJECTED' | 'CLOSED') => {
    try {
      setUpdatingId(jobId);
      await adminService.updateJobStatus(jobId, { status: newStatus });
      toast.success(`Job ${newStatus.toLowerCase()} successfully`);
      loadJobs();
    } catch (error: any) {
      console.error('Error updating job status:', error);
      if (error.response?.status === 403) {
        toast.error('You can only manage job posts that you created.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update job status');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Review Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and manage job postings
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
            <div className="flex gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CLOSED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No jobs found</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      {job.employer && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Posted by: {job.employer.firstName} {job.employer.lastName}
                          {job.employer.company && ` (${job.employer.company})`}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {job.location && (
                          <span>📍 {job.location}</span>
                        )}
                        {job.salaryMin && job.salaryMax && (
                          <span>{job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}</span>
                        )}
                        <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                        {job._count && (
                          <span>👥 {job._count.applications} applications</span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      {job.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(job.id, 'APPROVED')}
                            disabled={updatingId === job.id}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition disabled:opacity-50"
                            title="Approve"
                          >
                            {updatingId === job.id ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(job.id, 'REJECTED')}
                            disabled={updatingId === job.id}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                            title="Reject"
                          >
                            {updatingId === job.id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </>
                      )}
                      {job.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(job.id, 'CLOSED')}
                          disabled={updatingId === job.id}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 text-sm"
                        >
                          {updatingId === job.id ? 'Closing...' : 'Close Job'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminJobReview;

