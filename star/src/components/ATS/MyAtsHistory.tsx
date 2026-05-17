import React, { useEffect } from 'react';
import useATS from './hooks/useATS';
import { AlertCircle, CheckCircle2, Clock, FileSearch, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Simple parser to break a long recommendations paragraph into readable bullet points
const parseRecommendations = (text: string): string[] => {
  if (!text || !text.trim()) return [];

  const normalized = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Try splitting by numbered or bulleted lists or paragraphs
  let items: string[] = [];

  if (/\d+[\.\)]\s+/.test(normalized)) {
    // "1. foo", "2) bar"
    items = normalized.split(/\d+[\.\)]\s+/);
  } else if (/[•●▪▫]\s+/.test(normalized)) {
    items = normalized.split(/[•●▪▫]\s+/);
  } else if (/-\s+/.test(normalized)) {
    items = normalized.split(/-\s+/);
  } else if (/\n\s*\n/.test(normalized)) {
    // Paragraphs
    items = normalized.split(/\n\s*\n/);
  } else {
    // Fallback: split by sentences
    items = normalized.split(/(?<=[\.!?])\s+/);
  }

  return items
    .map(item =>
      item
        .replace(/^[\d\.\)\s•●▪▫\-\*]+\s*/, '')
        .trim()
    )
    .filter(item => item.length > 0);
};

const MyAtsHistory: React.FC = () => {
  const { results, loading, error, getATSResults } = useATS();

  useEffect(() => {
    getATSResults();
  }, [getATSResults]);

  if (loading && results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading ATS history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-xl">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Failed to load ATS history</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-[250px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No ATS scans yet
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Once you run an ATS analysis, your results will appear here so you can review and compare them later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          My ATS History
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Review all your previous ATS scans, including scores, pass/fail status, and associated jobs.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <div className="col-span-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Date
          </div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Job / Context</div>
          <div className="col-span-2 text-right">Details</div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {results.map((result, index) => {
            const createdAt = result.createdAt ? new Date(result.createdAt) : null;
            const dateLabel = createdAt ? createdAt.toLocaleString() : 'Unknown';
            const isPass = result.pass;
            const jobLabel = result.job
              ? `${result.job.title}${result.job.location ? ` • ${result.job.location}` : ''}`
              : 'Custom job description';

            return (
              <motion.details
                key={result.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group"
              >
                <summary className="flex flex-col md:grid grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="col-span-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{dateLabel}</span>
                  </div>

                  <div className="col-span-2 flex items-center text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        result.atsScore >= 80
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : result.atsScore >= 60
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {result.atsScore} / 100
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center text-sm">
                    {isPass ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle className="w-3.5 h-3.5" />
                        Fail
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 flex items-center text-sm text-gray-700 dark:text-gray-200">
                    <span className="truncate">{jobLabel}</span>
                  </div>

                  <div className="col-span-2 flex items-center justify-between md:justify-end text-xs text-indigo-600 dark:text-indigo-400">
                    <span className="hidden md:inline">Click to view details</span>
                    <span className="md:hidden inline">Details</span>
                  </div>
                </summary>

                {/* Expanded details */}
                <div className="px-4 md:px-6 pb-5 bg-gray-50/60 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800">
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Recommendations
                      </h3>
                      {parseRecommendations(result.recommendations || '').length === 0 ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          No specific recommendations were provided for this scan.
                        </p>
                      ) : (
                        <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                          {parseRecommendations(result.recommendations || '').map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Job Description (excerpt)
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-6 whitespace-pre-wrap">
                        {result.jobDescription || 'No job description stored for this scan.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.details>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyAtsHistory;


