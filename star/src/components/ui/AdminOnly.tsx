import React from 'react';
import { Shield } from 'lucide-react';
import { useRoleAccess } from '../../hooks/useRoleAccess';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ 
  children, 
  fallback,
  showAccessDenied = true 
}) => {
  const { requireAdmin } = useRoleAccess();
  const { hasAccess, reason } = requireAdmin();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Superadmin Access Required
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {reason === 'not_authenticated' 
            ? 'Please log in to access this feature.'
            : 'You need superadmin privileges to access this feature.'
          }
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AdminOnly; 