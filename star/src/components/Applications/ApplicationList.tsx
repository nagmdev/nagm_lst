import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../config/environment';
import applicationService, { Application } from '../../services/applicationService';
import axiosInstance from '../../services/axiosInstance';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { PERMISSIONS } from '../../constants/permissions';
import { ArrowLeft, FileText, Star, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ApplicationList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, hasAnyRole } = useRoleAccess();
  const [applications, setApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [jobTitle, setJobTitle] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Check permissions - both employer and admin can view applications
  const canViewApplications = hasPermission('VIEW_APPLICATIONS');
  const canUpdateStatus = hasPermission('UPDATE_APPLICATION_STATUS');

  useEffect(() => {
    if (id) {
      loadApplications();
    }
  }, [id]);

  const loadApplications = async () => {
    // Validate ID is a valid number
    const jobId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(jobId) || jobId <= 0) {
      toast.error('Invalid job ID');
      navigate('/jobs/my-jobs');
      return;
    }

    try {
      setLoading(true);
      const response = await applicationService.getJobApplications(jobId);
      const apps = response.applications || [];
      console.debug(`Loaded ${apps.length} applications for job ${jobId}`, apps);
      // Save original list and apply current filters
      setAllApplications(apps);
      // keep a copy in `applications` for legacy uses
      setApplications(apps);
      applyFilters(apps, sortOrder);
      if (apps.length > 0 && apps[0].job) {
        setJobTitle(apps[0].job.title);
      }
    } catch (error: any) {
      console.error('Error loading applications:', error);
      toast.error(error.response?.data?.error || 'Failed to load applications');
      navigate('/jobs/my-jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    source: Application[] = allApplications,
    order: 'newest' | 'oldest' = sortOrder
  ) => {
    let result = [...(source || [])];

    // Sort
    result.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return order === 'newest' ? tb - ta : ta - tb;
    });

    setFilteredApplications(result);
  };

  const getAtsScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500 dark:text-gray-400';
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      REVIEWED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      INTERVIEW: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.NEW;
  };

  const handleDownloadCv = async (application: Application) => {
    if (!application.cvUrl) {
      toast.error('CV file not available');
      return;
    }
    try {
      setDownloadingId(application.id);
      const response = await axiosInstance.get(
        `/applications/${application.id}/cv`,
        {
          responseType: 'blob',
          withCredentials: true,
        } as any
      );
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileNameFromUrl = application.cvUrl.split('/').pop();
      link.download = fileNameFromUrl || `cv-${application.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading CV:', error);
      const status = error.response?.status;
      if (status === 404) {
        toast.error('CV not found for this application');
      } else if (status === 403) {
        toast.error('You are not allowed to download this CV');
      } else {
        toast.error('Failed to download CV');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // Handlers for filter UI
  const onSortChange = (value: 'newest' | 'oldest') => {
    setSortOrder(value);
    setCurrentPage(1); // Reset to first page on sort change
    applyFilters(allApplications, value);
  };

  const onItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page on limit change
  };

  const getPaginatedApplications = () => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filteredApplications.slice(startIdx, endIdx);
  };

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  if (!canViewApplications) {
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
        <button
          onClick={() => navigate('/jobs/my-jobs')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Jobs
        </button>

          <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Applications for: {jobTitle || 'Job'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Total: {filteredApplications.length} applications
          </p>

          {/* Filters: sort + items per page */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          allApplications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Applications will appear here once candidates apply to this job
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No matching applications</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Filters removed all {allApplications.length} applications. Try clearing filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('newest');
                  applyFilters(allApplications, 'newest');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Reset filters
              </button>
            </div>
          )
        ) : (
          <>
            <div className="grid gap-6">
              {getPaginatedApplications().map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {application.candidate?.firstName} {application.candidate?.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}>
                          {application.status}
                        </span>
                        {application.atsScore !== null && (
                          <div className={`flex items-center gap-1 ${getAtsScoreColor(application.atsScore)}`}>
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">ATS: {application.atsScore}%</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>{application.candidate?.email}</p>
                        <p>{application.candidate?.phone}</p>
                        <p>{application.experienceYears} years experience • <span className="text-gray-900 dark:text-white font-semibold">{application.expectedSalary.toLocaleString()}</span> expected</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString('en-US') : 'N/A'}</p>
                        {application.skills && application.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {application.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleDownloadCv(application)}
                        disabled={downloadingId === application.id}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download CV"
                      >
                        {downloadingId === application.id ? (
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                      <Link
                        to={`/applications/${application.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
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

export default ApplicationList;

