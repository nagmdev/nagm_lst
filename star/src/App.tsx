import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import LoginPage from './components/login/LoginPage';
import ForgotPassword from './components/login/ForgotPassword';
import VerifyOtp from './components/login/VerifyOtp';
import ResetPassword from './components/login/ResetPassword';
import RegistrationPage from './components/Registration/RegistrationPage';
import VerifyRegistrationOtp from './components/login/VerifyRegistrationOtp';
import Practice from './components/Practice/Practice';
import Questions from './components/Questions/Questions';
import Profile from './components/Profile/Profile';
import Answers from './components/Answers/Answers';
import Positions from './components/Positions/Positions';
import Companies from './components/Companies/Companies';
import LeadershipPrinciples from './components/LeadershipPrinciples/LeadershipPrinciples';
import { DeepSeekQuestionTester } from './components/DeepSeekQuestion/DeepSeekQuestionTester';
import ATSAnalysis from './components/ATS/ATSAnalysis';
import MyAtsHistory from './components/ATS/MyAtsHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AdminMakeUser from './components/Admin/AdminMakeUser';
import AdminJobReview from './components/Admin/AdminJobReview';
import CreateJobForm from './components/Jobs/CreateJobForm';
import MyJobsList from './components/Jobs/MyJobsList';
import JobDetail from './components/Jobs/JobDetail';
import EditJobForm from './components/Jobs/EditJobForm';
import ApplyToJobForm from './components/Applications/ApplyToJobForm';
import ApplicationList from './components/Applications/ApplicationList';
import ApplicationDetail from './components/Applications/ApplicationDetail';
import JobListings from './components/Jobs/JobListings';
import Unauthorized from './pages/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useRoleAccess } from './hooks/useRoleAccess';
import AdminOnly from './components/ui/AdminOnly';
import ProtectedRoute from './components/ui/ProtectedRoute';
import { ROLES } from './constants/permissions';
import { 
  GraduationCap, 
  HelpCircle, 
  FileText, 
  FileCheck,
  Building2,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Shield,
  FileSearch
} from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, show login/register pages + public job routes
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/verify-email" element={<VerifyRegistrationOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password/new-password" element={<ResetPassword />} />
          {/* Public job routes - accessible without authentication */}
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/apply" element={<ApplyToJobForm />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  // If authenticated, use HomePage as the main layout with nested routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route index element={<DashboardContent />} />
          <Route path="practice" element={<Practice />} />
          <Route path="practice/:id" element={<Practice />} />
          <Route path="questions" element={<Questions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="answers" element={<Answers />} />
          <Route path="ats" element={<ATSAnalysis />} />
          <Route path="ats/history" element={<MyAtsHistory />} />
          <Route path="admin" element={
            <AdminOnly>
              <AdminDashboard />
            </AdminOnly>
          } />
          <Route path="admin/make-admin" element={
            <AdminOnly>
              <AdminMakeUser />
            </AdminOnly>
          } />
          <Route path="admin/users" element={
            <AdminOnly>
              <UserManagement />
            </AdminOnly>
          } />
          <Route path="positions" element={
            <AdminOnly>
              <Positions />
            </AdminOnly>
          } />
          <Route path="companies" element={
            <AdminOnly>
              <Companies />
            </AdminOnly>
          } />
          <Route path="leadership-principles" element={
            <AdminOnly>
              <LeadershipPrinciples />
            </AdminOnly>
          } />
          <Route path="generate_questions" element={
            <AdminOnly>
              <DeepSeekQuestionTester />
            </AdminOnly>
          } />
          <Route path="admin/job-review" element={
            <AdminOnly>
              <AdminJobReview />
            </AdminOnly>
          } />
          {/* Job Routes */}
          <Route path="jobs" element={<JobListings />} />
          <Route path="admin/jobs" element={
            <ProtectedRoute allowedRoles={[ROLES.HR, ROLES.SUPERADMIN]}>
              <MyJobsList />
            </ProtectedRoute>
          } />
          <Route path="jobs/create" element={
            <ProtectedRoute allowedRoles={[ROLES.HR, ROLES.SUPERADMIN]}>
              <CreateJobForm />
            </ProtectedRoute>
          } />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="jobs/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.HR, ROLES.SUPERADMIN]}>
              <EditJobForm />
            </ProtectedRoute>
          } />
          <Route path="jobs/:id/applications" element={
            <ProtectedRoute allowedRoles={[ROLES.HR, ROLES.SUPERADMIN]}>
              <ApplicationList />
            </ProtectedRoute>
          } />
          <Route path="jobs/:id/apply" element={<ApplyToJobForm />} />
          {/* Application Routes */}
          <Route path="applications/:id" element={
            <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.HR, ROLES.SUPERADMIN]} requireAny>
              <ApplicationDetail />
            </ProtectedRoute>
          } />
          {/* Unauthorized Page */}
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// Dashboard content component for the home page
const DashboardContent = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isHr, isUserRole } = useRoleAccess();
  const isCandidate = isUserRole;
  
  const quickActions = [
    {
      to: '/practice',
      icon: GraduationCap,
      title: 'Practice',
      description: 'Start a new practice session and get instant feedback on your STAR responses',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      to: '/questions',
      icon: HelpCircle,
      title: 'Questions',
      description: 'Browse and practice with behavioral interview questions',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      to: '/answers',
      icon: FileText,
      title: 'My Answers',
      description: 'View and edit your saved STAR method answers',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      to: '/ats',
      icon: FileCheck,
      title: 'ATS Analysis',
      description: 'Analyze your resume for ATS compatibility',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
  ];

  // Admin job management actions
  const adminJobActions = (isSuperAdmin || isHr) ? [
    {
      to: '/jobs/create',
      icon: Building2,
      title: 'Create Job',
      description: isSuperAdmin ? 'Post a new job opening (auto-approved)' : 'Post a new job opening',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      to: '/admin/jobs',
      icon: Building2,
      title: 'Manage Jobs',
      description: isSuperAdmin ? 'View and manage all jobs in the system' : 'View and manage your jobs',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
  ] : [];

  const candidateActions = [
    {
      to: '/jobs',
      icon: FileSearch,
      title: 'Browse Jobs',
      description: 'Explore available job opportunities',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
  ];

  const adminActions = [
    {
      to: '/admin',
      icon: Shield,
      title: 'Admin Panel',
      description: 'View system statistics and manage users',
      color: 'from-purple-600 to-indigo-700'
    },
    {
      to: '/positions',
      icon: Building2,
      title: 'Positions',
      description: 'Manage job positions and roles',
      color: 'from-indigo-600 to-purple-700'
    },
    {
      to: '/companies',
      icon: Building2,
      title: 'Companies',
      description: 'Manage company information',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      to: '/leadership-principles',
      icon: Award,
      title: 'Leadership Principles',
      description: 'Manage company leadership principles',
      color: 'from-purple-600 to-pink-700'
    },
    {
      to: '/generate_questions',
      icon: Sparkles,
      title: 'Generate Questions',
      description: 'Create AI-powered interview questions',
      color: 'from-indigo-600 to-purple-700'
    },
  ];

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Master the art of answering behavioral questions with our AI-powered practice platform.
        </p>
      </motion.div>

      {/* Quick Stats or Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Practice Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Ready to Start</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Keep Going</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Powered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Smart Feedback</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={action.to}
                  className="group block h-full bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {/* Admin Job Actions */}
          {adminJobActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={action.to}
                  className="group block h-full bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {/* Candidate Actions */}
          {isCandidate && candidateActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (quickActions.length + adminJobActions.length + index) }}
              >
                <Link
                  to={action.to}
                  className="group block h-full bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Admin Section */}
      {isSuperAdmin && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    to={action.to}
                    className={`group block h-full bg-gradient-to-br ${action.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-white/90">{action.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Root = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default Root;
