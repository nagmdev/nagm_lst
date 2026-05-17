import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { UserRole } from '../../constants/permissions';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAny?: boolean; // If true, user needs ANY of the roles. If false, user needs ALL roles (default: true)
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  requireAny = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyRole, userRole, userRoles } = useRoleAccess();
  const location = useLocation();
  const redirectPath = `${location.pathname}${location.search}${location.hash}`;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: redirectPath }} />;
  }

  // If no role restrictions, just check authentication
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has access
  let hasAccess = false;
  
  if (requireAny) {
    // User needs ANY of the allowed roles
    hasAccess = hasAnyRole(allowedRoles).hasAccess;
  } else {
    // User needs ALL of the allowed roles
    const userRoleList = userRoles.length > 0 ? userRoles : (userRole ? [userRole] : []);
    hasAccess = allowedRoles.every(role => userRoleList.includes(role));
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

