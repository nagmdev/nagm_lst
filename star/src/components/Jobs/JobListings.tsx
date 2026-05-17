import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import jobService, { Job, PublicJobsFilters } from '../../services/jobService';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Compass,
  Globe,
  LayoutGrid,
  Rows,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';

const JobListings: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<'' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [limit, setLimit] = useState(10);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const processedJobs = React.useMemo(() => {
    let curated = [...jobs];

    if (remoteOnly) {
      curated = curated.filter(job =>
        job.location?.toLowerCase().includes('remote') ||
        job.description?.toLowerCase().includes('remote')
      );
    }

    curated.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return curated;
  }, [jobs, remoteOnly, sortOrder]);

  const employmentTypeSummary = React.useMemo(() => {
    const summary = processedJobs.reduce<Record<string, number>>((acc, job) => {
      if (job.employmentType) {
        acc[job.employmentType] = (acc[job.employmentType] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [processedJobs]);

  const popularLocations = React.useMemo(() => {
    const counts = processedJobs.reduce<Record<string, number>>((acc, job) => {
      if (job.location) {
        acc[job.location] = (acc[job.location] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [processedJobs]);

  const remoteFriendlyCount = React.useMemo(() => {
    return jobs.filter(job =>
      job.location?.toLowerCase().includes('remote') ||
      job.description?.toLowerCase().includes('remote')
    ).length;
  }, [jobs]);

  const featuredJob = processedJobs[0];

  useEffect(() => {
    loadJobs();
  }, [currentPage, locationFilter, employmentTypeFilter, limit]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters: PublicJobsFilters = {
        page: currentPage,
        limit: limit,
      };
      
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      if (locationFilter.trim()) {
        filters.location = locationFilter.trim();
      }
      if (employmentTypeFilter) {
        filters.employmentType = employmentTypeFilter;
      }

      const response = await jobService.getPublicJobs(filters);
      setJobs(response.jobs);
      setTotalPages(response.pagination.pages);
      setTotalJobs(response.pagination.total);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      setJobs([]);
      
      // Provide more specific error messages
      if (error.response?.status === 500) {
        toast.error('Server error: Unable to load jobs. Please try again later or contact support.');
      } else if (error.response?.status === 404) {
        toast.error('Jobs endpoint not found. Please check if the backend is running.');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to load jobs. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadJobs();
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page on filter change
    loadJobs();
  };

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 md:p-8 mb-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                Roles matched to modern product teams
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                Browse jobs that match how you actually work.
              </h1>
              <p className="text-white/80 max-w-2xl text-sm md:text-base">
                Filter by location, type, and remote-friendly options. Save time by scanning clean, consistent cards instead of noisy listings.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-white flex flex-col gap-4">
              <div>
                <p className="text-sm text-white/70">Open roles</p>
                <p className="text-3xl font-semibold">{totalJobs || jobs.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-white/60">Cities</p>
                  <p className="text-lg font-semibold">{popularLocations.length || 1}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-white/60">Teams hiring</p>
                  <p className="text-lg font-semibold">{Math.max(1, new Set(jobs.map(job => job.employer?.company || job.employer?.firstName)).size)}</p>
                </div>
              </div>
              <div className="text-xs text-white/70">
                Updated {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="absolute right-6 top-6 hidden md:block">
            <Layers className="w-12 h-12 text-white/30" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs by title, description, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                handleFilterChange();
              }}
              placeholder="City, country, or remote"
              className="flex-1 min-w-[180px] px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
            />
            <select
              value={employmentTypeFilter}
              onChange={(e) => {
                setEmploymentTypeFilter(e.target.value as any);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>
            <button
              type="button"
              onClick={() => setRemoteOnly(prev => !prev)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                remoteOnly
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              Remote only
              <span
                className={`w-2 h-2 rounded-full ${
                  remoteOnly ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort by</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Per page</span>
              <select
                value={limit}
                onChange={(e) => {
                  setCurrentPage(1);
                  setLimit(Number(e.target.value) || 10);
                }}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">View</span>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                aria-label="List view"
              >
                <Rows className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Candidate Insights */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Live opportunities</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
              {totalJobs || processedJobs.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Updated {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Remote-friendly roles</p>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {remoteFriendlyCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Based on keywords like “remote”, “hybrid”, or “work from anywhere”
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Compass className="w-5 h-5 text-indigo-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Popular locations</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularLocations.length === 0 && <span className="text-sm text-gray-500 dark:text-gray-400">Added soon</span>}
              {popularLocations.map(([city, count]) => (
                <span
                  key={city}
                  className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 text-sm"
                >
                  {city} • {count}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Top contract types</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {employmentTypeSummary.length === 0 && <span className="text-sm text-gray-500 dark:text-gray-400">Pending approvals</span>}
              {employmentTypeSummary.map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => {
                    setEmploymentTypeFilter(type as any);
                    handleFilterChange();
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition ${employmentTypeFilter === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200'
                  }`}
                >
                  {type.replace('_', ' ')} • {count}
                </button>
              ))}
            </div>
          </div>
          {featuredJob && (
            <motion.div
              layout
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-2">Featured role</p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{featuredJob.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{featuredJob.description.slice(0, 120)}...</p>
              <Link
                to={`/jobs/${featuredJob.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        {processedJobs.length > 0 && (
          <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            {(() => {
              const start = (currentPage - 1) * limit + 1;
              const end = Math.min(currentPage * limit, totalJobs || processedJobs.length);
              return (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Showing {start}–{end} of {totalJobs || processedJobs.length} roles
                  </span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span>Page {currentPage} of {Math.max(totalPages, 1)}</span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span>
                    {remoteOnly ? 'Remote filter enabled' : `Total live roles: ${totalJobs}`}
                  </span>
                </>
              );
            })()}
          </div>
        )}

        {/* Jobs List */}
        {processedJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || locationFilter || employmentTypeFilter
                ? 'No jobs found matching your filters'
                : 'No jobs available at the moment'}
            </p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2' : ''}`}>
              {processedJobs
                .filter(job => job.id && !isNaN(job.id) && job.id > 0)
                .map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition flex flex-col"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between flex-1">
                    <div className="flex-1">
                      <Link to={`/jobs/${job.id}`}>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                            {job.status || 'OPEN'}
                          </span>
                          {job.location?.toLowerCase().includes('remote') && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                              Remote friendly
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                          {job.title}
                        </h3>
                      </Link>
                      {job.employer && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {job.employer.firstName} {job.employer.lastName}
                          {job.employer.company && ` • ${job.employer.company}`}
                        </p>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.employmentType?.replace('_', ' ') || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:items-end">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-center"
                      >
                        View Details
                      </Link>
                      {job._count?.applications !== undefined && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {job._count?.applications} candidates reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    First
                  </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                  <span className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold">
                    Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Last
                </button>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Use the controls above to skim through every opportunity without overwhelming the page.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobListings;

