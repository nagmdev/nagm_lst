import React, { useState } from 'react';
import useATS, { ATSResult } from './hooks/useATS';
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Target,
  Lightbulb,
  RefreshCw,
  Download,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ATSAnalysis: React.FC = () => {
  const { loading, error, uploadATSCheck } = useATS();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSResult | null>(null);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
      setLocalError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setCvFile(file);
        setLocalError(null);
      } else {
        setLocalError('Please upload a PDF or DOCX file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!cvFile || !jobDescription.trim()) {
      setLocalError('Please upload your CV and enter a job description.');
      return;
    }
    setStep('analyzing');
    try {
      const result = await uploadATSCheck(cvFile, jobDescription);
      setAnalysis(result);
      setStep('result');
    } catch {
      setStep('upload');
    }
  };

  const handleReset = () => {
    setCvFile(null);
    setJobDescription('');
    setAnalysis(null);
    setStep('upload');
    setLocalError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Parse recommendations into structured format
  const parseRecommendations = (text: string): string[] => {
    if (!text || !text.trim()) return [];
    
    // Remove extra whitespace and normalize
    const normalized = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split by various patterns: numbered lists, bullet points, dashes, newlines
    const patterns = [
      /\d+[\.\)]\s+/,           // Numbered: "1. ", "2) "
      /[•●▪▫]\s+/,              // Bullet points
      /-\s+/,                    // Dashes
      /\*\s+/,                   // Asterisks
      /\n\s*\n/,                 // Double newlines (paragraph breaks)
    ];
    
    let items: string[] = [];
    
    // Try to split by numbered lists first
    if (/\d+[\.\)]\s+/.test(normalized)) {
      items = normalized
        .split(/\d+[\.\)]\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    // Try bullet points
    else if (/[•●▪▫]\s+/.test(normalized)) {
      items = normalized
        .split(/[•●▪▫]\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    // Try dashes
    else if (/-\s+/.test(normalized)) {
      items = normalized
        .split(/-\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    // Try asterisks
    else if (/\*\s+/.test(normalized)) {
      items = normalized
        .split(/\*\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    // Split by double newlines (paragraphs)
    else if (/\n\s*\n/.test(normalized)) {
      items = normalized
        .split(/\n\s*\n/)
        .map(item => item.trim().replace(/\n/g, ' '))
        .filter(item => item.length > 0);
    }
    // Split by single newlines
    else {
      items = normalized
        .split(/\n+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
    // Clean up items: remove leading dashes, numbers, bullets if they weren't caught
    items = items.map(item => {
      return item
        .replace(/^[\d\.\)\s•●▪▫\-\*]+\s*/, '') // Remove leading markers
        .trim();
    })
    .filter(item => item.length > 10) // Filter out very short items
    .filter(item => !item.match(/^(and|or|the|a|an)\s/i)); // Filter out single words
    
    return items;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            ATS Resume Analysis
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-0 sm:ml-12">
          Get instant feedback on your resume's ATS compatibility and match score with any job description
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Upload Your Resume
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Upload className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    {cvFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <FileText className="w-5 h-5" />
                          <span className="font-medium">{cvFile.name}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(cvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Drag and drop your resume here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Supported formats: PDF, DOC, DOCX (Max 10MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={e => {
                    setJobDescription(e.target.value);
                    setLocalError(null);
                  }}
                  rows={8}
                  placeholder="Paste the complete job description here. Include requirements, responsibilities, and qualifications for the most accurate analysis..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {jobDescription.length} characters
                </p>
              </div>

              {/* Error Messages */}
              {(localError || error) && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{localError || error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !cvFile || !jobDescription.trim()}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16"
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-75"></div>
                <div className="relative p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                  <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Analyzing Your Resume
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Our AI is scanning your resume, comparing it against the job description, and calculating your ATS compatibility score...
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'result' && analysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 ${getScoreBgColor(analysis.atsScore)} p-8`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {analysis.pass ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analysis.pass ? 'ATS Compatible' : 'Needs Optimization'}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analysis.pass 
                      ? 'Your resume shows strong ATS compatibility and keyword matching.'
                      : 'Your resume needs improvements to pass ATS screening systems.'}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Analysis
                </button>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ATS Score</span>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">/ 100</span>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getScoreBarColor(analysis.atsScore)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.atsScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {analysis.pass ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Pass</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">Fail</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {analysis.pass ? 'Ready for submission' : 'Optimization required'}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Recommendation</span>
                    <Target className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {analysis.atsScore >= 80 ? (
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className={`text-lg font-semibold ${
                      analysis.atsScore >= 80 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {analysis.atsScore >= 80 ? 'Strong Match' : 'Improve Match'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {analysis.atsScore >= 80 ? 'High compatibility' : 'Enhance keywords'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Actionable Recommendations
                </h3>
              </div>
              
              {(() => {
                const recommendations = parseRecommendations(analysis.recommendations || '');
                
                if (recommendations.length === 0) {
                  return (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        No specific recommendations available at this time.
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <p className="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                          {recommendation}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}

              {/* Key Improvement Areas */}
              {analysis.atsScore < 80 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3 text-lg">
                        Priority Focus Areas
                      </h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2" />
                          <span>Enhance keyword matching with job description to improve ATS compatibility</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2" />
                          <span>Optimize resume formatting for ATS parsing systems</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2" />
                          <span>Include relevant skills and qualifications mentioned in the job posting</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2" />
                          <span>Ensure proper section headings and structure for better readability</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Analyze Another Resume
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 sm:px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ATSAnalysis; 