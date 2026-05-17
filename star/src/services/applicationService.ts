import axiosInstance from './axiosInstance';

export interface ApplyToJobPayload {
  cv: File;
  expectedSalary: number;
  phone: string;
  experienceYears: number;
  skills: string[];
}

export interface Application {
  id: number;
  candidateId: string;
  jobId: number;
  cvUrl: string;
  expectedSalary: number;
  experienceYears: number;
  skills: string[];
  atsScore: number | null;
  atsReport: string | null;
  status: 'NEW' | 'REVIEWED' | 'INTERVIEW' | 'REJECTED';
  createdAt: string;
  candidate?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  job?: {
    id: number;
    title: string;
    location: string;
    employmentType: string;
    employer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface ApplyToJobResponse {
  message: string;
  application: Application;
}

export interface ApplicationsResponse {
  applications: Application[];
}

export interface ApplicationResponse {
  application: Application;
}

export interface UpdateApplicationStatusPayload {
  status: 'NEW' | 'REVIEWED' | 'INTERVIEW' | 'REJECTED';
}

const applicationService = {
  applyToJob: async (jobId: number, payload: ApplyToJobPayload): Promise<ApplyToJobResponse> => {
    // Validate inputs
    if (!payload.cv) {
      throw new Error('CV file is required');
    }
    if (!payload.phone || !payload.phone.trim()) {
      throw new Error('Phone number is required');
    }
    if (!payload.expectedSalary || payload.expectedSalary <= 0) {
      throw new Error('Expected salary must be greater than 0');
    }
    if (payload.experienceYears < 0) {
      throw new Error('Experience years must be 0 or greater');
    }

    const formData = new FormData();
    formData.append('cv', payload.cv);
    formData.append('expectedSalary', payload.expectedSalary.toString());
    formData.append('phone', payload.phone.trim());
    formData.append('experienceYears', payload.experienceYears.toString());
    
    // Append skills as array (only non-empty skills)
    if (payload.skills && Array.isArray(payload.skills)) {
      payload.skills
        .filter(skill => skill && skill.trim() !== '')
        .forEach(skill => {
          formData.append('skills', skill.trim());
        });
    }

    try {
      const { data } = await axiosInstance.post<ApplyToJobResponse>(
        `/applications/${jobId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error: any) {
      // Log detailed error for debugging
      console.error('Application submission error:', {
        jobId,
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors,
      });
      throw error;
    }
  },

  // Get applications for a job (Admin only) - replaces /applications/employer/applications/:jobId
  getJobApplications: async (jobId: number): Promise<ApplicationsResponse> => {
    const { data } = await axiosInstance.get<ApplicationsResponse>(
      `/applications/job/${jobId}`
    );
    return data;
  },

  // Get application by ID (User/Candidate - own applications only)
  getApplicationById: async (applicationId: number): Promise<ApplicationResponse> => {
    const { data } = await axiosInstance.get<ApplicationResponse>(
      `/applications/${applicationId}`
    );
    return data;
  },

  // Get application by ID (Admin - any application)
  getApplicationByIdAdmin: async (applicationId: number): Promise<ApplicationResponse> => {
    const { data } = await axiosInstance.get<ApplicationResponse>(
      `/applications/admin/${applicationId}`
    );
    return data;
  },

  updateApplicationStatus: async (
    applicationId: number,
    payload: UpdateApplicationStatusPayload
  ): Promise<ApplicationResponse> => {
    const { data } = await axiosInstance.patch<ApplicationResponse>(
      `/applications/${applicationId}/status`,
      payload
    );
    return data;
  },

  // Export applications for a job as an Excel file (backend returns xlsx blob)
  exportApplicationsForJob: async (jobId: number): Promise<Blob> => {
    const response = await axiosInstance.get(`/application/job/${jobId}/export`, {
      responseType: 'blob',
    } as any);
    return response.data as Blob;
  },
};

export default applicationService;

