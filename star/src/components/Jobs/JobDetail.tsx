import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import jobService, { Job } from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Users,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { AxiosError } from 'axios';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isSuperAdmin, isHr, isUserRole } = useRoleAccess();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Validate ID early and convert to number
  const getValidJobId = useCallback((): number | null => {
    if (!id || id.trim() === '') {
      return null;
    }
    const jobId = parseInt(id.trim(), 10);
    if (isNaN(jobId) || jobId <= 0 || !Number.isInteger(jobId)) {
      return null;
    }
    return jobId;
  }, [id]);

  const loadJob = useCallback(async (jobId: number) => {
    try {
      setLoading(true);
      const response = await jobService.getJobById(jobId);
      setJob(response.job);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Error loading job:', axiosError);
      if (axiosError.response?.status === 403) {
        toast.error('This job is not yet approved and not available to the public');
      } else if (axiosError.response?.status === 404) {
        toast.error('Job not found');
      } else {
        toast.error(axiosError.response?.data?.error || 'Failed to load job');
      }
      // Navigate based on authentication status
      if (user) {
        navigate('/');
      } else {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    const jobId = getValidJobId();
    
    if (!jobId) {
      toast.error('Invalid job ID');
      setLoading(false);
      // Navigate based on authentication status
      if (user) {
        navigate('/');
      } else {
        navigate('/login');
      }
      return;
    }

    loadJob(jobId);
  }, [id, user, navigate, getValidJobId, loadJob]);

  useEffect(() => {
    if (!job || !user?.email) {
      setAlreadyApplied(false);
      return;
    }
    const key = `applied_job_${job.id}_${user.email}`;
    try {
      const stored = window.sessionStorage.getItem(key);
      setAlreadyApplied(stored === 'true');
    } catch (e) {
      console.warn('Unable to read applied job flag', e);
      setAlreadyApplied(false);
    }
  }, [job, user]);

  // Show apply CTA to guests and to signed-in users with the candidate role
  // Guests can now apply directly without creating an account first
  const canApply = job?.status === 'APPROVED' && !alreadyApplied && (!isAuthenticated || isUserRole);
  const userId = user && 'id' in user ? (user as { id: string }).id : undefined;
  const isJobOwner = userId && job?.createdBy === userId;
  const canManageJob = isSuperAdmin || (isHr && (!job?.createdBy || isJobOwner));

  const handleApplyClick = () => {
    if (!job) return;
    const targetPath = `/jobs/${job.id}/apply`;
    // Allow guests to apply directly (no redirect to register)
    // The ApplyToJobForm now supports guest applications
    if (isAuthenticated && !isUserRole) {
      toast.error('Only candidate accounts can apply to jobs.');
      return;
    }
    navigate(targetPath);
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

  if (!job) {
    return null;
  }

  const shareJobUrl = `${window.location.origin}/jobs/${job.id}`;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareJobUrl);
      setShareCopied(true);
      toast.success('Job link copied! Share it anywhere.');
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy job link:', error);
      toast.error('Unable to copy link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                Role snapshot
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {job.title}
                </h1>
                {job.employer && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {job.employer.firstName} {job.employer.lastName}
                    {job.employer.company && ` • ${job.employer.company}`}
                  </p>
                )}
              </div>
            </div>

            {canManageJob && job.status === 'APPROVED' && (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-900/40 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <Share2 className="w-4 h-4" />
                  Share this job externally
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Copy the link below and share it anywhere (Facebook, email, etc.). Candidates can apply without creating an account first.
                </p>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <code className="flex-1 text-xs md:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg overflow-x-auto">
                    {shareJobUrl}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="mt-2 md:mt-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-200 dark:border-indigo-400 dark:hover:bg-indigo-900/30 transition"
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {job.location && (
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Location</p>
                  <div className="flex items-center gap-2 mt-2 text-gray-900 dark:text-white">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                </div>
              )}
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Type</p>
                <div className="flex items-center gap-2 mt-2 text-gray-900 dark:text-white">
                  <Briefcase className="w-4 h-4" />
                  {job.employmentType.replace('_', ' ')}
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Posted</p>
                <div className="flex items-center gap-2 mt-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Salary range</p>
                  <div className="mt-2 text-gray-900 dark:text-white font-semibold">
                    {job.salaryMin ? job.salaryMin.toLocaleString() : '—'}{' '}
                    {job.salaryMax ? `- ${job.salaryMax.toLocaleString()}` : ''}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {canApply && (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
                >
                  Apply Now
                </button>
              )}
              {!canApply && alreadyApplied && (
                <div className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 font-medium">
                  You have already applied to this job.
                </div>
              )}
              {canManageJob && (
                <>
                  <Link
                    to={`/jobs/${job.id}/edit`}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit role
                  </Link>
                  {job.status === 'APPROVED' && (
                    <Link
                      to={`/jobs/${job.id}/applications`}
                      className="px-6 py-3 border border-green-200 dark:border-green-600 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition font-semibold flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      {job._count?.applications || 0} Applicants
                    </Link>
                  )}
                  {job.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!job) return;
                        try {
                          setExporting(true);
                          const blob = await applicationService.exportApplicationsForJob(job.id);
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `applicants-job-${job.id}.xlsx`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                          toast.success('Applicants exported successfully');
                        } catch (error) {
                          console.error('Export applicants failed', error);
                          toast.error('Failed to export applicants.');
                        } finally {
                          setExporting(false);
                        }
                      }}
                      className="px-6 py-3 border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition font-semibold flex items-center gap-2"
                    >
                      {exporting ? 'Exporting...' : 'Export All'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Responsibilities</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {job.responsibilities}
            </p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;

