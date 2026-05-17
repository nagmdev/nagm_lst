import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../config/environment';
import axiosInstance from '../../services/axiosInstance';
import { handleApiError } from '../../utils/errorHandler';
import applicationService, { Application } from '../../services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { ArrowLeft, Download, Star, Mail, Phone, Briefcase, Calendar, FileText, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin, isHr, isUserRole } = useRoleAccess();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  // Check permissions
  const canUpdateStatus = hasPermission('UPDATE_APPLICATION_STATUS');
  const canViewApplication = hasPermission('VIEW_APPLICATIONS') || isUserRole;

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  // Show a success toast when navigated from a fresh submission
  useEffect(() => {
    const state = location.state as { justSubmitted?: boolean } | null;
    if (state?.justSubmitted) {
      toast.success('Your application has been submitted successfully.');
      // Optional: clear the flag so back/forward navigation does not re-toast
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const loadApplication = async () => {
    const applicationId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(applicationId) || applicationId <= 0) {
      toast.error('Invalid application ID');
      navigate(-1);
      return;
    }

    try {
      setLoading(true);
      const response = isSuperAdmin
        ? await applicationService.getApplicationByIdAdmin(applicationId)
        : await applicationService.getApplicationById(applicationId);
      setApplication(response.application);
      setStatus(response.application.status);
    } catch (error: any) {
      console.error('Error loading application:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view this application');
      } else if (error.response?.status === 404) {
        toast.error('Application not found');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load application');
      }
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCv = async () => {
    if (!application) return;
    if (!application.cvUrl) {
      toast.error('CV file not available');
      return;
    }
    try {
      setDownloading(true);
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
      setDownloading(false);
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

  if (!application) {
    return null;
  }

  const getAtsScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500 dark:text-gray-400';
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const canUpdateStatusForThisApp = canUpdateStatus && (isSuperAdmin || isHr);
  const isOwner = user?.id === application?.candidateId;

  // Small helper to analyze report sentences and assign a severity
  const analyzeReport = (text: string) => {
    const cleaned = (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const parts = cleaned
      .split(/(?<=[.?!])\s+|\r?\n|•|\u2022|\-|;/)
      .map(s => s.trim())
      .filter(Boolean);
    return parts.map(p => {
      const low = /ok|good|sufficient|complete/i;
      const med = /without|cannot|insufficient|missing skill|missing experience|incomplete/i;
      const high = /missing|incomplete|placeholder|invalid|error|fail/i;
      let severity: 'high' | 'medium' | 'info' = 'info';
      if (high.test(p)) severity = 'high';
      else if (med.test(p)) severity = 'medium';
      else if (low.test(p)) severity = 'info';
      return { text: p, severity };
    });
  };

  const CollapsibleText: React.FC<{ text: string }> = ({ text }) => {
    const [open, setOpen] = useState(false);
    if (!text) return null;
    const short = text.length > 240 ? text.slice(0, 240).trim() + '...' : text;
    return (
      <div>
        <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {open ? text : short}
        </div>
        {text.length > 240 && (
          <button onClick={() => setOpen(s => !s)} className="mt-2 text-xs text-indigo-600 dark:text-indigo-300 hover:underline">
            {open ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    );
  };

  const handleStatusUpdate = async () => {
    if (!application || status === application.status) return;

    try {
      setUpdating(true);
      await applicationService.updateApplicationStatus(application.id, { status: status as any });
      toast.success('Application status updated successfully');
      await loadApplication();
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = handleApiError(error, {
        403: 'Only admins can update application status',
      });
      toast.error(errorMessage);
      setStatus(application.status);
    } finally {
      setUpdating(false);
    }
  };

  const downloadAtsPdf = async () => {
    if (!application) return;
    const title = `ATS Report - ${application.id}`;
    const header = `ATS Analysis Report\nCandidate: ${application.candidate?.email || 'N/A'}\nJob: ${application.job?.title || 'N/A'}\n\n`;
    const content = (application.atsReport || '').replace(/<[^>]+>/g, '');
    // Try to use jspdf if available
    try {
      // dynamic import to avoid hard dependency
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = await import('jspdf').catch(() => null);
      if (mod && mod.jsPDF) {
        const { jsPDF } = mod;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const left = 40;
        let y = 60;
        doc.setFontSize(18);
        doc.text('ATS Analysis Report', left, y);
        doc.setFontSize(11);
        y += 20;
        doc.text(`Candidate: ${application.candidate?.email || 'N/A'}`, left, y);
        y += 16;
        doc.text(`Job: ${application.job?.title || 'N/A'}`, left, y);
        y += 20;
        const lines = (header + content).split(/\r?\n/);
        doc.setFontSize(10);
        lines.forEach((line: string) => {
          const wrapped = doc.splitTextToSize(line, 520);
          doc.text(wrapped, left, y);
          y += wrapped.length * 12;
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
        });
        doc.save(`ats-report-${application.id}.pdf`);
        return;
      }
    } catch (err) {
      console.warn('jspdf not available or failed, falling back to print', err);
    }

    // Fallback: open printable HTML and call print (user can save as PDF)
    try {
      const html = `
        <html>
          <head>
            <title>${title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>body{font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:40px;color:#111} pre{white-space:pre-wrap;word-break:break-word}</style>
          </head>
          <body>
            <h1>ATS Analysis Report</h1>
            <p><strong>Candidate:</strong> ${application.candidate?.email || 'N/A'}</p>
            <p><strong>Job:</strong> ${application.job?.title || 'N/A'}</p>
            <hr/>
            <pre>${content.replace(/</g, '&lt;')}</pre>
          </body>
        </html>`;
      const w = window.open('', '_blank');
      if (!w) {
        toast.error('Unable to open print window');
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      // give the new window a moment to render
      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch (e) {
          console.error('Print failed', e);
          toast.info('You can save the opened page as PDF from your browser');
        }
      }, 300);
    } catch (e) {
      console.error('Failed to generate PDF fallback', e);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Application Details
              </h1>
              {application.job && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {application.job.title}
                </p>
              )}
            </div>
            {canUpdateStatusForThisApp && (
              <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || status === application.status}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Candidate Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                  {application.candidate?.email}
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                  {application.candidate?.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-4 h-4" />
                  {application.experienceYears} years of experience
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString('en-US') : 'N/A'}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Details</h2>
              <div className="space-y-3">
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Expected Salary:</span> <span className="text-gray-900 dark:text-white font-semibold">{application.expectedSalary.toLocaleString()}</span>
                </div>
                {application.atsScore !== null && (
                  <div className={`flex items-center gap-2 ${getAtsScoreColor(application.atsScore)}`}>
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold text-lg">ATS Score: {application.atsScore}%</span>
                  </div>
                )}
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Status:</span> {application.status}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {application.skills && application.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ATS Report */}
          {application.atsReport && (
            <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ATS Analysis Report</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Key takeaways and detailed findings from the ATS</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">ATS Score</div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 ${getAtsScoreColor(application.atsScore)} font-semibold`}>{application.atsScore ?? 'N/A'}</div>
                      <div className="w-36">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div style={{ width: `${Math.max(0, Math.min(100, application.atsScore ?? 0))}%` }} className="h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard?.writeText(application.atsReport || ''); toast.success('ATS report copied'); }}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:shadow-sm"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={downloadAtsPdf}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/30">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">Details</h3>
                <div className="max-h-56 overflow-auto pr-2">
                  {(() => {
                    const raw = application.atsReport || '';
                    const items = analyzeReport(raw);
                    if (items.length === 0) return <div className="text-sm text-gray-700 dark:text-gray-300">No details available.</div>;
                    return (
                      <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                        {items.map((item, i) => {
                          const badge = item.severity === 'high' ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : item.severity === 'medium' ? (
                            <Info className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          );
                          return (
                            <li key={i} className="flex gap-3 items-start">
                              <div className="mt-1">{badge}</div>
                              <div className="flex-1">
                                <CollapsibleText text={item.text} />
                              </div>
                              <div className={`ml-3 text-xs font-semibold ${item.severity === 'high' ? 'text-red-600' : item.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                                {item.severity.toUpperCase()}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* CV Download */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FileText className="w-5 h-5" />
              <span>CV: {application.cvUrl}</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadCv}
              disabled={downloading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download CV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;

