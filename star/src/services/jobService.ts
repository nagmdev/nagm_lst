import axiosInstance from './axiosInstance';

export interface CreateJobPayload {
  title: string;
  description: string;
  responsibilities: string;
  location: string;
  requirements: string[];
  salaryMin: number;
  salaryMax: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
}

export interface Job {
  id: number;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string[];
  salaryMin: number;
  salaryMax: number;
  location: string;
  employmentType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  employer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
  _count?: {
    applications: number;
  };
}

export interface CreateJobResponse {
  message: string;
  job: Job;
}

export interface MyJobsResponse {
  jobs: Job[];
}

export interface JobResponse {
  job: Job;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PublicJobsResponse {
  jobs: Job[];
  pagination: PaginationInfo;
}

export interface PublicJobsFilters {
  page?: number;
  limit?: number;
  location?: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  search?: string;
}

export interface UpdateJobPayload {
  title?: string;
  description?: string;
  responsibilities?: string;
  location?: string;
  requirements?: string[];
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
}

const jobService = {
  createJob: async (payload: CreateJobPayload): Promise<CreateJobResponse> => {
    const { data } = await axiosInstance.post<CreateJobResponse>('/jobs', payload);
    return data;
  },

  // Get jobs based on role:
  // - Public/user: approved jobs
  // - HR: only jobs created by HR
  // - Superadmin: all jobs
  getAllJobs: async (): Promise<MyJobsResponse> => {
    const { data } = await axiosInstance.get<MyJobsResponse>('/jobs');
    return data;
  },

  getJobById: async (id: number): Promise<JobResponse> => {
    const { data } = await axiosInstance.get<JobResponse>(`/jobs/${id}`);
    return data;
  },

  updateJob: async (id: number, payload: UpdateJobPayload): Promise<CreateJobResponse> => {
    const { data } = await axiosInstance.put<CreateJobResponse>(`/jobs/${id}`, payload);
    return data;
  },

  deleteJob: async (id: number): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete<{ message: string }>(`/jobs/${id}`);
    return data;
  },

  // Get public job listings (approved jobs only)
  // Supports pagination, filters (location, employmentType), and search
  getPublicJobs: async (filters?: PublicJobsFilters): Promise<PublicJobsResponse> => {
    const params = new URLSearchParams();
    
    // Always include page and limit with defaults
    params.append('page', (filters?.page || 1).toString());
    params.append('limit', (filters?.limit || 20).toString());
    
    if (filters?.location && filters.location.trim()) {
      params.append('location', filters.location.trim());
    }
    if (filters?.employmentType && filters.employmentType.trim()) {
      params.append('employmentType', filters.employmentType);
    }
    if (filters?.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }
    
    const url = `/jobs?${params.toString()}`;
    
    try {
      const { data } = await axiosInstance.get<PublicJobsResponse>(url);
      return data;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Error fetching public jobs:', {
        url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

export default jobService;

