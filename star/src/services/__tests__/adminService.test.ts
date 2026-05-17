import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminService from '../adminService';
import axiosInstance from '../axiosInstance';

// Mock axios instance
vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllJobs', () => {
    it('should fetch all jobs without filters', async () => {
      const mockJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          status: 'PENDING',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        data: {
          jobs: mockJobs,
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await adminService.getAllJobs();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/jobs');
      expect(result.jobs).toEqual(mockJobs);
      expect(result.pagination.total).toBe(1);
    });

    it('should fetch jobs with status filter', async () => {
      const mockJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          status: 'PENDING',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        data: {
          jobs: mockJobs,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
          },
        },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await adminService.getAllJobs({
        status: 'PENDING',
        page: 1,
        limit: 10,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/jobs?status=PENDING&page=1&limit=10');
      expect(result.jobs).toEqual(mockJobs);
    });
  });

  describe('updateJobStatus', () => {
    it('should update job status to APPROVED', async () => {
      const mockJob = {
        id: 1,
        title: 'Software Engineer',
        status: 'APPROVED',
      };

      const mockResponse = {
        data: {
          message: 'Job approved successfully',
          job: mockJob,
        },
      };

      (axiosInstance.patch as any).mockResolvedValue(mockResponse);

      const result = await adminService.updateJobStatus(1, { status: 'APPROVED' });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/admin/jobs/1/status', { status: 'APPROVED' });
      expect(result.job.status).toBe('APPROVED');
    });

    it('should update job status to REJECTED', async () => {
      const mockJob = {
        id: 1,
        title: 'Software Engineer',
        status: 'REJECTED',
      };

      const mockResponse = {
        data: {
          message: 'Job rejected successfully',
          job: mockJob,
        },
      };

      (axiosInstance.patch as any).mockResolvedValue(mockResponse);

      const result = await adminService.updateJobStatus(1, { status: 'REJECTED' });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/admin/jobs/1/status', { status: 'REJECTED' });
      expect(result.job.status).toBe('REJECTED');
    });
  });
});

