import { describe, it, expect, vi, beforeEach } from 'vitest';
import jobService from '../jobService';
import axiosInstance from '../axiosInstance';

// Mock axios instance
vi.mock('../axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('jobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createJob', () => {
    it('should create a job successfully', async () => {
      const mockJob = {
        id: 1,
        title: 'Software Engineer',
        description: 'Test description',
        responsibilities: 'Test responsibilities',
        location: 'Remote',
        requirements: ['React', 'TypeScript'],
        salaryMin: 80000,
        salaryMax: 120000,
        employmentType: 'FULL_TIME',
        status: 'PENDING',
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          message: 'Job posted successfully',
          job: mockJob,
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const payload = {
        title: 'Software Engineer',
        description: 'Test description',
        responsibilities: 'Test responsibilities',
        location: 'Remote',
        requirements: ['React', 'TypeScript'],
        salaryMin: 80000,
        salaryMax: 120000,
        employmentType: 'FULL_TIME' as const,
      };

      const result = await jobService.createJob(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/jobs', payload);
      expect(result.message).toBe('Job posted successfully');
      expect(result.job).toEqual(mockJob);
    });

    it('should handle errors when creating a job', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Validation failed' },
        },
      };

      (axiosInstance.post as any).mockRejectedValue(mockError);

      const payload = {
        title: '',
        description: 'Test',
        responsibilities: 'Test',
        location: 'Remote',
        requirements: [],
        salaryMin: 0,
        salaryMax: 0,
        employmentType: 'FULL_TIME' as const,
      };

      await expect(jobService.createJob(payload)).rejects.toEqual(mockError);
    });
  });

  describe('getAllJobs', () => {
    it('should fetch jobs successfully', async () => {
      const mockJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          status: 'APPROVED',
          createdAt: '2024-01-01T00:00:00Z',
          _count: { applications: 5 },
        },
      ];

      const mockResponse = {
        data: { jobs: mockJobs },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await jobService.getAllJobs();

      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs');
      expect(result.jobs).toEqual(mockJobs);
    });
  });

  describe('getJobById', () => {
    it('should fetch a job by ID successfully', async () => {
      const mockJob = {
        id: 1,
        title: 'Software Engineer',
        description: 'Test',
        responsibilities: 'Test',
        location: 'Remote',
        requirements: [],
        salaryMin: 80000,
        salaryMax: 120000,
        employmentType: 'FULL_TIME',
        status: 'APPROVED',
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: { job: mockJob },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await jobService.getJobById(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs/1');
      expect(result.job).toEqual(mockJob);
    });

    it('should handle 404 error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Job not found' },
        },
      };

      (axiosInstance.get as any).mockRejectedValue(mockError);

      await expect(jobService.getJobById(999)).rejects.toEqual(mockError);
    });
  });

  describe('updateJob', () => {
    it('should update a job successfully', async () => {
      const mockJob = {
        id: 1,
        title: 'Updated Title',
        status: 'PENDING',
      };

      const mockResponse = {
        data: {
          message: 'Job updated successfully',
          job: mockJob,
        },
      };

      (axiosInstance.put as any).mockResolvedValue(mockResponse);

      const payload = {
        title: 'Updated Title',
      };

      const result = await jobService.updateJob(1, payload);

      expect(axiosInstance.put).toHaveBeenCalledWith('/jobs/1', payload);
      expect(result.message).toBe('Job updated successfully');
    });
  });

  describe('deleteJob', () => {
    it('should delete a job successfully', async () => {
      const mockResponse = {
        data: { message: 'Job deleted successfully' },
      };

      (axiosInstance.delete as any).mockResolvedValue(mockResponse);

      const result = await jobService.deleteJob(1);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/jobs/1');
      expect(result.message).toBe('Job deleted successfully');
    });
  });

  describe('getPublicJobs', () => {
    it('should fetch public jobs successfully', async () => {
      const mockJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          status: 'APPROVED',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        data: { jobs: mockJobs },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await jobService.getPublicJobs();

      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs');
      expect(result.jobs).toEqual(mockJobs);
    });
  });
});

