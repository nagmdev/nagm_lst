
export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: 'superadmin' | 'hr' | 'user';
  roles?: string[]; // e.g., ['superadmin'] | ['hr'] | ['user']
}