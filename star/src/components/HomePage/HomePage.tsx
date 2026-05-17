import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { 
  Moon, 
  Sun, 
  LogOut, 
  Shield, 
  GraduationCap,
  HelpCircle,
  User,
  FileText,
  FileCheck,
  LayoutDashboard,
  Building2,
  Award,
  Sparkles,
  ChevronRight,
  Settings,
  Menu,
  X,
  Briefcase,
  FileSearch,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { isSuperAdmin, isHr, isUserRole } = useRoleAccess();
  const isCandidate = isUserRole;
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Define navigation links with icons and role requirements
  const allNavLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { to: '/practice', label: 'Practice', icon: GraduationCap, adminOnly: false },
    { to: '/questions', label: 'Questions', icon: HelpCircle, adminOnly: false },
    { to: '/answers', label: 'Answers', icon: FileText, adminOnly: false },
    { to: '/ats', label: 'ATS Analysis', icon: FileCheck, adminOnly: false },
    { to: '/ats/history', label: 'My ATS History', icon: History, adminOnly: false },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase, hrOnly: true },
    { to: '/jobs', label: 'Browse Jobs', icon: FileSearch, candidateOnly: true },
    { to: '/profile', label: 'Profile', icon: User, adminOnly: false },
    { to: '/admin', label: 'Admin Panel', icon: Shield, adminOnly: true },
    { to: '/admin/job-review', label: 'Job Review', icon: FileSearch, adminOnly: true },
    { to: '/positions', label: 'Positions', icon: Building2, adminOnly: true },
    { to: '/companies', label: 'Companies', icon: Building2, adminOnly: true },
    { to: '/leadership-principles', label: 'Leadership Principles', icon: Award, adminOnly: true },
    { to: '/generate_questions', label: 'Generate Questions', icon: Sparkles, adminOnly: true },
  ];

  // Separate regular, candidate, and admin links
  const regularLinks = allNavLinks.filter(link => 
    !link.adminOnly && 
    !(link as any).candidateOnly &&
    !(link as any).hrOnly
  );
  // Show candidate links if user is candidate OR admin (admins can also browse jobs)
  const candidateLinks = allNavLinks.filter(link => (link as any).candidateOnly && (isCandidate || isSuperAdmin || isHr));
  const hrLinks = allNavLinks.filter(link => (link as any).hrOnly && (isHr || isSuperAdmin));
  const adminLinks = allNavLinks.filter(link => link.adminOnly && isSuperAdmin);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
          </>
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-screen transition-all duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo & Header */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nagm</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">STAR Practice</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Role Badge */}
          {(isSuperAdmin || isHr) && (
            <div className="flex gap-2 flex-wrap">
              {isSuperAdmin && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2 w-fit">
                  <Shield className="w-3.5 h-3.5" />
                  Superadmin Access
                </div>
              )}
              {isHr && !isSuperAdmin && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2 w-fit">
                  <Briefcase className="w-3.5 h-3.5" />
                  HR Access
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Profile Section */}
        {user && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {/* Regular Links */}
          <div className="space-y-1">
            {regularLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative
                    ${active
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className="flex-1">{link.label}</span>
                  {active && (
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </Link>
              );
            })}
          </div>


          {/* Candidate Section */}
          {candidateLinks.length > 0 && (
            <>
              <div className="px-4 py-3">
                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>
              <div className="px-4 mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Candidate
                </p>
              </div>
              <div className="space-y-1">
                {candidateLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative
                        ${active
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeCandidateIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 dark:bg-emerald-400 rounded-r-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="flex-1">{link.label}</span>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* HR Section */}
          {hrLinks.length > 0 && (
            <>
              <div className="px-4 py-3">
                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>
              <div className="px-4 mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hiring
                </p>
              </div>
              <div className="space-y-1">
                {hrLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative
                        ${active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeHrIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="flex-1">{link.label}</span>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Admin Section Separator */}
          {adminLinks.length > 0 && (
            <>
              <div className="px-4 py-3">
                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>
              <div className="px-4 mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Administration
                </p>
              </div>
              <div className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative
                        ${active
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeAdminIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 dark:bg-purple-400 rounded-r-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="flex-1">{link.label}</span>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>
        
        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors duration-200 font-medium shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors duration-200 font-medium shadow-sm"
            >
              Log In
            </Link>
          )}
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
