import axiosInstance from './axiosInstance';
import { Job } from './jobService';

export interface AdminJobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateJobStatusPayload {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
}

export interface UpdateJobStatusResponse {
  message: string;
  job: Job;
}

const adminService = {
  getAllJobs: async (filters?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
    page?: number;
    limit?: number;
  }): Promise<AdminJobsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/admin/jobs${queryString ? `?${queryString}` : ''}`;
    
    const { data } = await axiosInstance.get<AdminJobsResponse>(url);
    return data;
  },

  updateJobStatus: async (
    jobId: number,
    payload: UpdateJobStatusPayload
  ): Promise<UpdateJobStatusResponse> => {
    const { data } = await axiosInstance.patch<UpdateJobStatusResponse>(
      `/admin/jobs/${jobId}/status`,
      payload
    );
    return data;
  },
};

export default adminService;

