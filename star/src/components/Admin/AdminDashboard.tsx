import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminStats } from '../../hooks/useAdminStats';
import { 
  Users, 
  UserCheck, 
  UserX, 
  FileText, 
  BarChart3, 
  Building2, 
  HelpCircle,
  TrendingUp,
  Clock
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { stats, recentUsers = [], loading, error } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards: Array<{
    name: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    note?: string;
  }> = [
    {
      name: 'Total Users',
      value: stats.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Super Admins',
      value: stats.superAdmins ?? stats.adminUsers ?? 0,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      name: 'HR Users',
      value: stats.hrUsers ?? 0,
      icon: UserCheck,
      color: 'bg-teal-500',
    },
    {
      name: 'Regular Users',
      value: stats.regularUsers ?? 0,
      icon: UserX,
      color: 'bg-yellow-500',
    },
    {
      name: 'Guest Users',
      value: stats.guestUsers ?? 0,
      icon: UserX,
      color: 'bg-amber-500',
      note: 'Users without password',
    },
    {
      name: 'Total Answers',
      value: stats.totalAnswers ?? 0,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      name: 'ATS Results',
      value: stats.totalAtsResults ?? 0,
      icon: BarChart3,
      color: 'bg-indigo-500',
    },
    {
      name: 'Companies',
      value: stats.totalCompanies ?? 0,
      icon: Building2,
      color: 'bg-pink-500',
    },
    {
      name: 'Questions',
      value: stats.totalQuestions ?? 0,
      icon: HelpCircle,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome to the admin dashboard. Here's what's happening with your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {Number(stat.value ?? 0).toLocaleString()}
                    </dd>
                    {stat.note && (
                      <dd className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {stat.note}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Users
          </h3>
          {recentUsers.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.isGuest && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                              Guest
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {user.displayRole || user.role}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent users</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users have registered recently.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin/users"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Manage Users
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View, edit, and manage user accounts and roles.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/users?role=admin"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <UserCheck className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Admin Users
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and manage administrator accounts.
                </p>
              </div>
            </Link>

            <Link
              to="/positions"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Manage Positions
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage job positions and company information.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
