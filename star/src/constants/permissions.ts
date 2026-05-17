export const ROLES = {
  SUPERADMIN: 'superadmin',
  HR: 'hr',
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Helper to check if user is an applicant-level user
export const isCandidate = (role: string | undefined): boolean => {
  return role === ROLES.USER;
};

export const PERMISSIONS = {
  // Application permissions
  UPDATE_APPLICATION_STATUS: [ROLES.HR, ROLES.SUPERADMIN],
  VIEW_APPLICATIONS: [ROLES.HR, ROLES.SUPERADMIN],
  
  // Application permissions - User
  CREATE_APPLICATION: [ROLES.USER],
  VIEW_OWN_APPLICATION: [ROLES.USER],

  // Job permissions
  CREATE_JOB: [ROLES.HR, ROLES.SUPERADMIN],
  UPDATE_JOB: [ROLES.HR, ROLES.SUPERADMIN],
  DELETE_JOB: [ROLES.HR, ROLES.SUPERADMIN],
  APPROVE_JOB: [ROLES.SUPERADMIN],
  VIEW_ALL_JOBS: [ROLES.SUPERADMIN],
  VIEW_OWN_JOBS: [ROLES.HR],

  // Public permissions (no auth required for browsing approved jobs)
  VIEW_JOBS: [],
  VIEW_JOB_DETAILS: [],

  // Superadmin permissions
  MANAGE_USERS: [ROLES.SUPERADMIN],
  VIEW_SYSTEM_STATS: [ROLES.SUPERADMIN],
  ATS_ALL_RESULTS: [ROLES.SUPERADMIN],
  DEEPSEEK_ADMIN: [ROLES.SUPERADMIN],
  ADMIN_DASHBOARD: [ROLES.SUPERADMIN],
} as const;

// Helper function to check if user has permission
export const hasPermission = (userRole: UserRole | string | undefined, permission: keyof typeof PERMISSIONS): boolean => {
  if (!userRole) return false;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`Unknown permission "${permission}" requested in hasPermission`);
    }
    return false;
  }
  return allowedRoles.includes(userRole as UserRole);
};

// Helper function to check if user has any of the provided roles
export const hasAnyRole = (userRole: UserRole | string | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
};

