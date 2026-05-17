import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jobService from '../../services/jobService';
import applicationService, { ApplyToJobPayload } from '../../services/applicationService';
import guestApplicationService from '../../services/guestApplicationService';
import AccountCreationModal from './AccountCreationModal';
import { ArrowLeft, Upload, FileText, X, Star, Mail, User, CheckCircle2 } from 'lucide-react';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAuth } from '../../hooks/useAuth';

const ApplyToJobForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isUserRole } = useRoleAccess();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [applicationResult, setApplicationResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    expectedSalary: '',
    phone: '',
    experienceYears: '',
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getAppliedSessionKey = useCallback(
    (jobId: number, email?: string) => {
      const emailToUse = email || user?.email;
      if (!emailToUse) return null;
      return `applied_job_${jobId}_${emailToUse}`;
    },
    [user]
  );

  const markJobAsApplied = useCallback(
    (jobId: number) => {
      const key = getAppliedSessionKey(jobId);
      if (!key) return;
      try {
        window.sessionStorage.setItem(key, 'true');
      } catch (e) {
        console.warn('Unable to persist applied job flag', e);
      }
    },
    [getAppliedSessionKey]
  );

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  // On first load, check if this user has already applied to this job in this session
  useEffect(() => {
    if (!id) {
      setAlreadyApplied(false);
      return;
    }

    const jobId = parseInt(id, 10);
    if (isNaN(jobId) || jobId <= 0) {
      setAlreadyApplied(false);
      return;
    }

    const emailToCheck = isAuthenticated ? user?.email : formData.email;
    const key = getAppliedSessionKey(jobId, emailToCheck);
    if (!key) {
      setAlreadyApplied(false);
      return;
    }
    try {
      const stored = window.sessionStorage.getItem(key);
      setAlreadyApplied(stored === 'true');
      if (stored === 'true' && isAuthenticated) {
        toast.info('You have already applied to this job in this session.');
      }
    } catch (e) {
      console.warn('Unable to read applied job flag', e);
      setAlreadyApplied(false);
    }
  }, [id, user, isAuthenticated, formData.email, getAppliedSessionKey]);

  const loadJob = async () => {
    // Validate ID is a valid number
    const jobId = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(jobId) || jobId <= 0) {
      toast.error('Invalid job ID');
      navigate('/jobs');
      return;
    }

    try {
      setLoading(true);
      const response = await jobService.getJobById(jobId);
      setJob(response.job);
    } catch (error: any) {
      console.error('Error loading job:', error);
      toast.error(error.response?.data?.error || 'Failed to load job');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setCvFile(file);
    if (errors.cv) {
      setErrors(prev => ({ ...prev, cv: '' }));
    }
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!cvFile) {
      newErrors.cv = 'CV file is required';
    }
    if (!isAuthenticated && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!isAuthenticated && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.expectedSalary || parseFloat(formData.expectedSalary) <= 0) {
      newErrors.expectedSalary = 'Expected salary is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.experienceYears || parseFloat(formData.experienceYears) < 0) {
      newErrors.experienceYears = 'Years of experience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extra session lock check before submitting
    const jobIdForSession = id ? parseInt(id, 10) : NaN;
    if (!isNaN(jobIdForSession) && jobIdForSession > 0) {
      const emailToCheck = isAuthenticated ? user?.email : formData.email;
      const key = getAppliedSessionKey(jobIdForSession, emailToCheck);
      if (key) {
        try {
          const stored = window.sessionStorage.getItem(key);
          if (stored === 'true') {
            setAlreadyApplied(true);
            toast.error('You already applied to this job in this session.');
            return;
          }
        } catch (e) {
          console.warn('Unable to read applied job flag before submit', e);
        }
      }
    }
    
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!cvFile) {
      return;
    }

    setSubmitting(true);
    try {
      // Validate required fields
      if (!cvFile) {
        toast.error('Please upload your CV');
        return;
      }
      
      if (!formData.phone.trim()) {
        setErrors({ phone: 'Phone number is required' });
        toast.error('Please enter your phone number');
        return;
      }
      
      if (!formData.expectedSalary || parseFloat(formData.expectedSalary) <= 0) {
        setErrors({ expectedSalary: 'Expected salary must be greater than 0' });
        toast.error('Please enter a valid expected salary');
        return;
      }
      
      if (!formData.experienceYears || parseFloat(formData.experienceYears) < 0) {
        setErrors({ experienceYears: 'Experience years must be 0 or greater' });
        toast.error('Please enter valid experience years');
        return;
      }

      // Validate ID before applying
      const jobId = id ? parseInt(id, 10) : NaN;
      if (!id || isNaN(jobId) || jobId <= 0) {
        toast.error('Invalid job ID');
        return;
      }

      let result: any;

      if (isAuthenticated && isUserRole) {
        // Authenticated user flow
        const payload: ApplyToJobPayload = {
          cv: cvFile,
          expectedSalary: parseFloat(formData.expectedSalary),
          phone: formData.phone.trim(),
          experienceYears: parseFloat(formData.experienceYears),
          skills: formData.skills.filter(skill => skill.trim() !== ''), // Remove empty skills
        };

        result = await applicationService.applyToJob(jobId, payload);
        toast.success(result.message || 'Application submitted successfully!');
        markJobAsApplied(jobId);
        setSubmitMessage('Your application has been submitted successfully.');
        
        // Show ATS score if available
        if (result.application.atsScore !== null) {
          toast.info(`Your ATS Score: ${result.application.atsScore}%`, { autoClose: 5000 });
        }
        
        navigate(`/applications/${result.application.id}`, {
          state: { justSubmitted: true }
        });
      } else {
        // Guest application flow
        if (!formData.email.trim()) {
          setErrors({ email: 'Email is required' });
          toast.error('Please enter your email address');
          return;
        }

        const guestPayload = {
          email: formData.email.trim(),
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          phone: formData.phone.trim(),
          cv: cvFile,
          expectedSalary: parseFloat(formData.expectedSalary),
          experienceYears: parseFloat(formData.experienceYears),
          skills: formData.skills.filter(skill => skill.trim() !== ''),
        };

        result = await guestApplicationService.applyToJobAsGuest(jobId, guestPayload);
        
        // Debug: Log the response to see its structure
        console.log('Guest application result:', result);
        console.log('isGuest:', result.isGuest);
        console.log('canCreateAccount:', result.canCreateAccount);
        
        toast.success(result.message || 'Application submitted successfully!');
        
        // Mark as applied using email
        const emailKey = `applied_job_${jobId}_${formData.email}`;
        try {
          window.sessionStorage.setItem(emailKey, 'true');
        } catch (e) {
          console.warn('Unable to persist applied job flag', e);
        }

        setApplicationResult(result);
        setSubmitMessage('Your application has been submitted successfully.');
        
        // Show ATS score if available
        if (result.application.atsScore !== null) {
          toast.info(`Your ATS Score: ${result.application.atsScore}%`, { autoClose: 5000 });
        }
        
        // Don't auto-open modal - let the success prompt show first
        // User can then choose which account creation method they prefer
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      if (error.response?.status === 400) {
        // Handle validation errors
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors: Record<string, string> = {};
          error.response.data.errors.forEach((err: any) => {
            validationErrors[err.param || err.field] = err.msg || err.message;
          });
          setErrors(validationErrors);
          
          // Show first error as toast
          const firstError = error.response.data.errors[0];
          toast.error(firstError.msg || firstError.message || 'Please fix the validation errors');
        } else if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Invalid data. Please check all fields and try again.');
        }
      } else if (error.response?.status === 409) {
        const jobId = id ? parseInt(id, 10) : NaN;
        if (!isNaN(jobId) && jobId > 0) {
          const emailToUse = isAuthenticated ? user?.email : formData.email;
          const emailKey = `applied_job_${jobId}_${emailToUse}`;
          try {
            window.sessionStorage.setItem(emailKey, 'true');
          } catch (e) {
            console.warn('Unable to persist applied job flag', e);
          }
        }
        // Clear any success state
        setApplicationResult(null);
        setAlreadyApplied(true);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'You have already applied to this job';
        toast.error(errorMessage);
        setSubmitMessage(errorMessage);
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to apply to this job');
      } else {
        // Clear any success state on error
        setApplicationResult(null);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to submit application';
        toast.error(errorMsg);
        setSubmitMessage(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/jobs/${id}`)}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Job
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-5 sm:mb-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {job?.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {job?.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-800">
                Open role
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800">
                Apply now
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
              <Star className="w-4 h-4" />
              Apply to Job
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Tell us about you</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We use this info to match you faster. Only PDF or DOCX CVs are accepted.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New to Nagm?
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Create a free account to track your applications and get ATS insights.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-colors"
              >
                Register now
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <>
              {/* Email (Required for guests) */}
              <div className="bg-indigo-50/60 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 sm:p-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>

              {/* First Name and Last Name (Optional for guests) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CV Upload */}
              <div className="space-y-2">
            <label htmlFor="cv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload CV (PDF or DOCX) *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-indigo-200 dark:border-indigo-800 border-dashed rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition bg-indigo-50/40 dark:bg-indigo-900/10">
              <div className="space-y-2 text-center">
                {cvFile ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-5 h-5" />
                    <span>{cvFile.name}</span>
                    <span className="text-gray-400">({(cvFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                      <label htmlFor="cv" className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          id="cv"
                          name="cv"
                          type="file"
                          accept=".pdf,.docx"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX up to 5MB</p>
                  </>
                )}
              </div>
            </div>
            {errors.cv && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cv}</p>}
          </div>

          {/* Expected Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
            <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expected Salary
            </label>
            <input
              type="number"
              id="expectedSalary"
              value={formData.expectedSalary}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, expectedSalary: e.target.value }));
                if (errors.expectedSalary) {
                  setErrors(prev => ({ ...prev, expectedSalary: '' }));
                }
              }}
              required
              min="0"
              className={`w-full px-4 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.expectedSalary ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="90000"
            />
            {errors.expectedSalary && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expectedSalary}</p>}
          </div>

          {/* Phone */}
            <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                if (errors.phone) {
                  setErrors(prev => ({ ...prev, phone: '' }));
                }
              }}
              required
              className={`w-full px-4 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="+1234567890"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
          </div>
          </div>

          {/* Experience Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                id="experienceYears"
                value={formData.experienceYears}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, experienceYears: e.target.value }));
                  if (errors.experienceYears) {
                    setErrors(prev => ({ ...prev, experienceYears: '' }));
                  }
                }}
                required
                min="0"
                className={`w-full px-4 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.experienceYears ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="5"
              />
              {errors.experienceYears && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.experienceYears}</p>}
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., JavaScript"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 sm:px-6 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition touch-manipulation text-sm sm:text-base font-semibold whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate(`/jobs/${id}`)}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition touch-manipulation text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || alreadyApplied}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition touch-manipulation text-sm sm:text-base font-semibold"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  {alreadyApplied ? 'Already applied' : 'Submit Application'}
                </>
              )}
            </button>
            {submitMessage && (
              <div className={`w-full sm:w-auto text-sm text-center sm:text-right px-3 py-2 rounded-lg border ${
                alreadyApplied 
                  ? 'border-red-200 text-red-700 dark:border-red-700 dark:text-red-300 bg-red-50/60 dark:bg-red-900/20' 
                  : 'border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-900/20'
              }`}>
                {submitMessage}
              </div>
            )}
          </div>
        </form>

        {/* Error Message for Already Applied */}
        {alreadyApplied && !isAuthenticated && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 shadow-lg">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Already Applied
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {submitMessage || 'You have already applied to this job.'}
              </p>
              <button
                onClick={() => navigate(`/jobs/${id}`)}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Back to Job
              </button>
            </div>
          </div>
        )}

        {/* Success Modal with Account Creation Options */}
        {applicationResult && !isAuthenticated && !alreadyApplied && !showAccountModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
            onClick={() => {
              setApplicationResult(null);
              navigate(`/jobs/${id}`);
            }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setApplicationResult(null);
                  navigate(`/jobs/${id}`);
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="text-center space-y-3 sm:space-y-4 pr-6 sm:pr-0">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white px-2">
                  Application Submitted Successfully!
                </h3>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 px-2">
                  Your application has been received and is being reviewed.
                </p>
                
                {/* Show account creation options if guest user */}
                {applicationResult.isGuest && applicationResult.canCreateAccount && (
                  <>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 border border-indigo-200 dark:border-indigo-700">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                        💡 Create an account to track your application and receive updates.
                      </p>
                      
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <button
                          onClick={() => setShowAccountModal(true)}
                          className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition font-semibold text-sm sm:text-base touch-manipulation"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setApplicationResult(null);
                        navigate(`/jobs/${id}`);
                      }}
                      className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition underline py-2 touch-manipulation"
                    >
                      Maybe Later
                    </button>
                  </>
                )}
                
                {/* If not a guest or can't create account, just show success */}
                {(!applicationResult.isGuest || !applicationResult.canCreateAccount) && (
                  <button
                    onClick={() => navigate(`/jobs/${id}`)}
                    className="mt-3 sm:mt-4 px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition font-semibold text-sm sm:text-base w-full sm:w-auto touch-manipulation"
                  >
                    Back to Job
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Direct Account Creation Modal */}
        {showAccountModal && applicationResult && (
          <AccountCreationModal
            email={applicationResult.application.candidate.email}
            onSuccess={() => {
              setShowAccountModal(false);
              setApplicationResult(null);
              toast.success('Account created! Taking you to your dashboard...');
            }}
            onClose={() => setShowAccountModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ApplyToJobForm;

