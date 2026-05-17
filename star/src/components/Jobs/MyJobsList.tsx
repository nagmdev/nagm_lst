import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jobService, { Job } from '../../services/jobService';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Users,
  ClipboardCheck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const MyJobsList: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isHr } = useRoleAccess();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const jobSummary = React.useMemo(() => {
    const base = {
      total: jobs.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: jobs.filter((job) => job.status === 'PENDING' && job._count?.applications === 0).length
    };
    jobs.forEach(job => {
      if (job.status === 'PENDING') base.pending += 1;
      if (job.status === 'APPROVED') base.approved += 1;
      if (job.status === 'REJECTED') base.rejected += 1;
    });
    return base;
  }, [jobs]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs();
      setJobs(response.jobs);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      if (error.response?.status === 403) {
        toast.error('You can only view job posts that you created.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await jobService.deleteJob(id);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(job => job.id !== id));
    } catch (error: any) {
      console.error('Error deleting job:', error);
      if (error.response?.status === 403) {
        toast.error('You can only delete job posts that you created.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to delete job');
      }
    } finally {
      setDeletingId(null);
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

  if (!isSuperAdmin && !isHr) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (loading) {
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
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              <ClipboardCheck className="w-4 h-4" />
              My hiring cockpit
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              My job posts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
              Review and manage only the job posts that you created, and track how each one is performing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/jobs/create"
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Job
            </Link>
            <button
              onClick={loadJobs}
              className="px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total roles</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{jobSummary.total}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-200">Pending approvals</p>
            <p className="text-3xl font-semibold text-amber-900 dark:text-amber-100">{jobSummary.pending}</p>
          </div>
          <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4">
            <p className="text-sm text-green-700 dark:text-green-200">Approved roles</p>
            <p className="text-3xl font-semibold text-green-900 dark:text-green-100">{jobSummary.approved}</p>
          </div>
          <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4">
            <p className="text-sm text-purple-700 dark:text-purple-200">Drafts in review</p>
            <p className="text-3xl font-semibold text-purple-900 dark:text-purple-100">{jobSummary.draft}</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No jobs posted yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first job posting
            </p>
            <Link
              to="/jobs/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Job title</p>
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job._count?.applications || 0} Applicants
                      </div>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          📍 {job.location}
                        </span>
                      )}
                      {job.salaryMin && job.salaryMax && (
                        <span>
                          {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm flex items-center gap-2"
                      title="View Job"
                    >
                      <Eye className="w-4 h-4" />
                      Overview
                    </Link>
                    {job.status !== 'APPROVED' && (
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="px-4 py-2 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-sm flex items-center gap-2"
                        title="Edit Job"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      className="px-4 py-2 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm flex items-center gap-2 disabled:opacity-50"
                      title="Delete Job"
                    >
                      {deletingId === job.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Remove
                    </button>
                    {job.status === 'APPROVED' && (
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Applicants
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobsList;

