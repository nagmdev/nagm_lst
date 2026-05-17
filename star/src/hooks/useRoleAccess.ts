import { useAuth } from './useAuth';
import { hasPermission, hasAnyRole as checkAnyRole, PERMISSIONS, UserRole, ROLES } from '../constants/permissions';

export const useRoleAccess = () => {
  const { isSuperAdmin, isHr, isUserRole, isAuthenticated, user, role } = useAuth();

  // Get user's role(s)
  const userRole = role || user?.role;
  const userRoles = user?.roles || (userRole ? [userRole] : []);

  const requireAdmin = () => {
    if (!isAuthenticated) {
      return { hasAccess: false, reason: 'not_authenticated' };
    }
    if (!isSuperAdmin) {
      return { hasAccess: false, reason: 'not_admin' };
    }
    return { hasAccess: true, reason: null };
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      return { hasAccess: false, reason: 'not_authenticated' };
    }
    return { hasAccess: true, reason: null };
  };

  const hasRole = (requiredRole: string) => {
    if (!isAuthenticated) {
      return { hasAccess: false, reason: 'not_authenticated' };
    }
    // Support both single role and multiple roles
    const hasSingleRole = user?.role === requiredRole;
    const hasMultipleRoles = user?.roles?.includes(requiredRole) || false;
    if (!hasSingleRole && !hasMultipleRoles) {
      return { hasAccess: false, reason: 'insufficient_permissions' };
    }
    return { hasAccess: true, reason: null };
  };

  // Check if user has any of the provided roles
  const hasAnyRole = (requiredRoles: string[]) => {
    if (!isAuthenticated) {
      return { hasAccess: false, reason: 'not_authenticated' };
    }
    const hasAccess = requiredRoles.some(role => 
      userRole === role || userRoles.includes(role)
    );
    if (!hasAccess) {
      return { hasAccess: false, reason: 'insufficient_permissions' };
    }
    return { hasAccess: true, reason: null };
  };

  // Check if user has a specific permission
  const hasPermissionCheck = (permission: keyof typeof PERMISSIONS) => {
    if (!isAuthenticated || !userRole) {
      return false;
    }
    return hasPermission(userRole, permission);
  };

  const isCandidate = userRole === ROLES.USER || userRoles.includes(ROLES.USER);
  const isUser = isCandidate; // Alias for clarity

  return {
    isSuperAdmin,
    isHr,
    isUserRole,
    isAdmin: isSuperAdmin,
    isAuthenticated,
    user,
    userRole,
    userRoles,
    requireAdmin,
    requireAuth,
    hasRole,
    hasAnyRole,
    hasPermission: hasPermissionCheck,
    // Convenience methods
    isCandidate,
    isUser,
  };
}; 