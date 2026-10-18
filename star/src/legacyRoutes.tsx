import { Navigate, useParams } from 'react-router-dom';

// The 2025 site had eight feature pages and six solution verticals. They were
// retired in Oct 2026 for two solution pages by audience; old links land on
// the closest section so nothing bookmarked or indexed goes to a 404.
export const FEATURE_REDIRECTS: Record<string, string> = {
  'profile': '/job-seekers#profile', 'candidate-profile': '/job-seekers#profile',
  'cv-builder': '/job-seekers#cv', 'resume-builder': '/job-seekers#cv', 'cv': '/job-seekers#cv',
  'ats': '/job-seekers#match', 'ats-analysis': '/job-seekers#match', 'ats-check': '/job-seekers#match', 'match': '/job-seekers#match',
  'interview': '/job-seekers#interview', 'interview-practice': '/job-seekers#interview', 'practice': '/job-seekers#interview',
  'jobs': '/companies#jobs', 'job-posting': '/companies#jobs', 'ai-job-posting': '/companies#jobs',
  'pipeline': '/companies#stages', 'applicants': '/companies#review', 'ats-pipeline': '/companies#stages',
  'talent-pool': '/companies#base', 'candidate-base': '/companies#base', 'rediscovery': '/companies#rediscover',
  'workspace': '/companies#workspace', 'team': '/companies#workspace', 'analytics': '/companies#analytics',
};
export const SOLUTION_REDIRECTS: Record<string, string> = {
  'job-seekers': '/job-seekers', 'candidates': '/job-seekers', 'seekers': '/job-seekers',
  'companies': '/companies', 'recruiters': '/companies', 'agencies': '/companies', 'enterprise': '/pricing?for=companies',
  'startups': '/companies', 'smb': '/companies',
};

export function LegacyRedirect({ table, fallback }: { table: Record<string, string>; fallback: string }) {
  const { slug } = useParams();
  const to = (slug && table[slug.toLowerCase()]) || fallback;
  return <Navigate to={to} replace />;
}
