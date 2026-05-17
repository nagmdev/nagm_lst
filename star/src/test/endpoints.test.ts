import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../services/axiosInstance';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import adminService from '../services/adminService';

// Mock axios instance
vi.mock('../services/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('API Endpoints Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Job Endpoints', () => {
    it('POST /jobs - Create job', async () => {
      const payload = {
        title: 'Software Engineer',
        description: 'Test',
        responsibilities: 'Test',
        location: 'Remote',
        requirements: ['React'],
        salaryMin: 80000,
        salaryMax: 120000,
        employmentType: 'FULL_TIME' as const,
      };

      (axiosInstance.post as any).mockResolvedValue({
        data: { message: 'Job posted successfully', job: { id: 1, ...payload } },
      });

      await jobService.createJob(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/jobs', payload);
    });

    it('GET /jobs/all - Get all jobs (admin)', async () => {
      (axiosInstance.get as any).mockResolvedValue({
        data: { jobs: [] },
      });

      await jobService.getAllJobs();

      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs/all');
    });

    it('GET /jobs/:id - Get job by ID', async () => {
      (axiosInstance.get as any).mockResolvedValue({
        data: { job: { id: 1, title: 'Test' } },
      });

      await jobService.getJobById(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs/1');
    });

    it('PUT /jobs/:id - Update job', async () => {
      (axiosInstance.put as any).mockResolvedValue({
        data: { message: 'Updated', job: { id: 1 } },
      });

      await jobService.updateJob(1, { title: 'Updated' });

      expect(axiosInstance.put).toHaveBeenCalledWith('/jobs/1', { title: 'Updated' });
    });

    it('DELETE /jobs/:id - Delete job', async () => {
      (axiosInstance.delete as any).mockResolvedValue({
        data: { message: 'Deleted' },
      });

      await jobService.deleteJob(1);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/jobs/1');
    });
  });

  describe('Application Endpoints', () => {
    it('POST /applications/:jobId - Apply to job', async () => {
      const file = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      const payload = {
        cv: file,
        expectedSalary: 90000,
        phone: '+1234567890',
        experienceYears: 5,
        skills: ['React'],
      };

      (axiosInstance.post as any).mockResolvedValue({
        data: { message: 'Applied', application: { id: 1 } },
      });

      await applicationService.applyToJob(1, payload);

      expect(axiosInstance.post).toHaveBeenCalled();
      const callArgs = (axiosInstance.post as any).mock.calls[0];
      expect(callArgs[0]).toBe('/applications/1');
      expect(callArgs[1]).toBeInstanceOf(FormData);
    });

    it('GET /applications/job/:jobId - Get job applications (admin)', async () => {
      (axiosInstance.get as any).mockResolvedValue({
        data: { applications: [] },
      });

      await applicationService.getJobApplications(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/applications/job/1');
    });

    it('GET /applications/:id - Get application by ID', async () => {
      (axiosInstance.get as any).mockResolvedValue({
        data: { application: { id: 1 } },
      });

      await applicationService.getApplicationById(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/applications/1');
    });

    it('PATCH /applications/:id/status - Update application status', async () => {
      (axiosInstance.patch as any).mockResolvedValue({
        data: { application: { id: 1, status: 'REVIEWED' } },
      });

      await applicationService.updateApplicationStatus(1, { status: 'REVIEWED' });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/applications/1/status', { status: 'REVIEWED' });
    });
  });

  describe('Admin Endpoints', () => {
    it('GET /admin/jobs - Get all jobs with filters', async () => {
      (axiosInstance.get as any).mockResolvedValue({
        data: { jobs: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } },
      });

      await adminService.getAllJobs({ status: 'PENDING', page: 1, limit: 20 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/jobs?status=PENDING&page=1&limit=20');
    });

    it('PATCH /admin/jobs/:id/status - Update job status', async () => {
      (axiosInstance.patch as any).mockResolvedValue({
        data: { message: 'Updated', job: { id: 1, status: 'APPROVED' } },
      });

      await adminService.updateJobStatus(1, { status: 'APPROVED' });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/admin/jobs/1/status', { status: 'APPROVED' });
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Validation failed' },
        },
      };

      (axiosInstance.post as any).mockRejectedValue(error);

      await expect(
        jobService.createJob({
          title: '',
          description: '',
          responsibilities: '',
          location: '',
          requirements: [],
          salaryMin: 0,
          salaryMax: 0,
          employmentType: 'FULL_TIME',
        })
      ).rejects.toEqual(error);
    });

    it('should handle 401 Unauthorized', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };

      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(jobService.getMyJobs()).rejects.toEqual(error);
    });

    it('should handle 403 Forbidden', async () => {
      const error = {
        response: {
          status: 403,
          data: { error: 'Forbidden' },
        },
      };

      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(jobService.getJobById(1)).rejects.toEqual(error);
    });

    it('should handle 404 Not Found', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
      };

      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(jobService.getJobById(999)).rejects.toEqual(error);
    });

    it('should handle 409 Conflict', async () => {
      const error = {
        response: {
          status: 409,
          data: { error: 'Already applied' },
        },
      };

      const file = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      (axiosInstance.post as any).mockRejectedValue(error);

      await expect(
        applicationService.applyToJob(1, {
          cv: file,
          expectedSalary: 90000,
          phone: '+1234567890',
          experienceYears: 5,
          skills: [],
        })
      ).rejects.toEqual(error);
    });

    it('should handle 500 Internal Server Error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      };

      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(jobService.getMyJobs()).rejects.toEqual(error);
    });

    it('should handle network errors', async () => {
      const error = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
      };

      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(jobService.getMyJobs()).rejects.toEqual(error);
    });
  });
});

