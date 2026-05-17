
import React, { useState, useMemo } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuestions } from './hooks/useQuestions';
import useCompanies from '../Companies/hooks/useCompanies';
import useLeadershipPrinciples from '../LeadershipPrinciples/hooks/useLeadershipPrinciples';

const Questions: React.FC = () => {
  const { questions, loading, error } = useQuestions();
  const { companies } = useCompanies();
  const { leadershipPrinciples } = useLeadershipPrinciples();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeadership, setSelectedLeadership] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const questionsPerPage = 5;

  // Extract unique leadership principles and company names for filter tags
  // Now use the full list from the hooks and ensure uniqueness
  const allLeadershipPrinciples = useMemo(() => {
    if (!Array.isArray(leadershipPrinciples)) return [];
    const names = leadershipPrinciples.map((lp: { name: string }) => lp.name);
    return [...new Set(names)]; // Remove duplicates
  }, [leadershipPrinciples]);

  const allCompanies = useMemo(() => {
    if (!Array.isArray(companies)) return [];
    const names = companies.map((c: { name: string }) => c.name);
    return [...new Set(names)]; // Remove duplicates
  }, [companies]);

  // For graying out: count how many questions use each company/principle
  const questionsByCompany = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach((q: { companyName?: string }) => {
      if (q.companyName) {
        map[q.companyName] = (map[q.companyName] || 0) + 1;
      }
    });
    return map;
  }, [questions]);

  const questionsByPrinciple = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach((q: { leadershipPrincipleName?: string }) => {
      if (q.leadershipPrincipleName) {
        map[q.leadershipPrincipleName] = (map[q.leadershipPrincipleName] || 0) + 1;
      }
    });
    return map;
  }, [questions]);

  // Filter questions based on selected tags
  const filteredQuestions = useMemo(() => {
    return questions.filter((q: { leadershipPrincipleName?: string; companyName?: string }) => {
      const matchesLeadership = selectedLeadership
        ? q.leadershipPrincipleName === selectedLeadership
        : true;
      const matchesCompany = selectedCompany
        ? q.companyName === selectedCompany
        : true;
      return matchesLeadership && matchesCompany;
    });
  }, [questions, selectedLeadership, selectedCompany]);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLeadership, selectedCompany]);

  // Calculate pagination for filtered questions
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle tag clicks
  const handleLeadershipClick = (principle: string) => {
    setSelectedLeadership(selectedLeadership === principle ? null : principle);
  };

  const handleCompanyClick = (company: string) => {
    setSelectedCompany(selectedCompany === company ? null : company);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedLeadership(null);
    setSelectedCompany(null);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        Interview Questions
      </h2>

      {/* Filter Tags UI */}
      <div className="space-y-4">
        {/* Leadership Principles Filter */}
        {allLeadershipPrinciples.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Leadership Principles</h3>
              {(selectedLeadership || selectedCompany) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allLeadershipPrinciples.map((principle: string, index: number) => {
                const count = questionsByPrinciple[principle] || 0;
                return (
                  <button
                    key={`leadership-${principle}-${index}`}
                    onClick={() => count > 0 && handleLeadershipClick(principle)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${selectedLeadership === principle
                        ? 'bg-indigo-600 text-white'
                        : count > 0
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
                    `}
                    disabled={count === 0}
                  >
                    {principle}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Company Filter */}
        {allCompanies.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Companies</h3>
            <div className="flex flex-wrap gap-2">
              {allCompanies.map((company: string, index: number) => {
                const count = questionsByCompany[company] || 0;
                return (
                  <button
                    key={`company-${company}-${index}`}
                    onClick={() => count > 0 && handleCompanyClick(company)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${selectedCompany === company
                        ? 'bg-indigo-600 text-white'
                        : count > 0
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
                    `}
                    disabled={count === 0}
                  >
                    {company}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && filteredQuestions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          {selectedLeadership || selectedCompany
            ? 'No questions match the selected filters.'
            : 'No questions available.'}
        </p>
      )}

      <div className="grid gap-4">
        {currentQuestions.map((q: { id: number; text: string; companyName?: string; leadershipPrincipleName?: string }) => (
          <div
            key={q.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow relative"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              {q.companyName && (
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-medium px-2 py-1 rounded-full">
                  {q.companyName}
                </span>
              )}
              {q.leadershipPrincipleName && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                  {q.leadershipPrincipleName}
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
              {q.text}
            </h3>
            <button
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm"
              onClick={() => navigate(`/practice/${q.id}`)}
            >
              Practice Answer →
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {!loading && !error && filteredQuestions.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: number) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
export default Questions;