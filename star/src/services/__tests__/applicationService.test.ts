import { describe, it, expect, vi, beforeEach } from 'vitest';
import applicationService from '../applicationService';
import axiosInstance from '../axiosInstance';

// Mock axios instance
vi.mock('../axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('applicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyToJob', () => {
    it('should submit an application successfully', async () => {
      const mockFile = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      const mockApplication = {
        id: 1,
        candidateId: 'candidate-1',
        jobId: 1,
        cvUrl: 'cv.pdf',
        expectedSalary: 90000,
        experienceYears: 5,
        skills: ['React', 'TypeScript'],
        atsScore: 85.5,
        atsReport: 'Good match',
        status: 'NEW',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          message: 'Application submitted successfully',
          application: mockApplication,
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const payload = {
        cv: mockFile,
        expectedSalary: 90000,
        phone: '+1234567890',
        experienceYears: 5,
        skills: ['React', 'TypeScript'],
      };

      const result = await applicationService.applyToJob(1, payload);

      expect(axiosInstance.post).toHaveBeenCalled();
      const callArgs = (axiosInstance.post as any).mock.calls[0];
      expect(callArgs[0]).toBe('/applications/1');
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(callArgs[2].headers['Content-Type']).toBe('multipart/form-data');
      expect(result.message).toBe('Application submitted successfully');
      expect(result.application).toEqual(mockApplication);
    });

    it('should handle duplicate application error', async () => {
      const mockError = {
        response: {
          status: 409,
          data: { error: 'Already applied to this job' },
        },
      };

      (axiosInstance.post as any).mockRejectedValue(mockError);

      const mockFile = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
      const payload = {
        cv: mockFile,
        expectedSalary: 90000,
        phone: '+1234567890',
        experienceYears: 5,
        skills: [],
      };

      await expect(applicationService.applyToJob(1, payload)).rejects.toEqual(mockError);
    });
  });

  describe('getJobApplications', () => {
    it('should fetch applications for a job successfully', async () => {
      const mockApplications = [
        {
          id: 1,
          candidateId: 'candidate-1',
          jobId: 1,
          cvUrl: 'cv.pdf',
          expectedSalary: 90000,
          experienceYears: 5,
          skills: ['React'],
          atsScore: 85.5,
          atsReport: 'Good match',
          status: 'NEW',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        data: { applications: mockApplications },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await applicationService.getJobApplications(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/applications/job/1');
      expect(result.applications).toEqual(mockApplications);
    });
  });

  describe('getApplicationById', () => {
    it('should fetch an application by ID successfully', async () => {
      const mockApplication = {
        id: 1,
        candidateId: 'candidate-1',
        jobId: 1,
        cvUrl: 'cv.pdf',
        expectedSalary: 90000,
        experienceYears: 5,
        skills: ['React'],
        atsScore: 85.5,
        atsReport: 'Good match',
        status: 'NEW',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: { application: mockApplication },
      };

      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await applicationService.getApplicationById(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/applications/1');
      expect(result.application).toEqual(mockApplication);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status successfully', async () => {
      const mockApplication = {
        id: 1,
        status: 'REVIEWED',
      };

      const mockResponse = {
        data: { application: mockApplication },
      };

      (axiosInstance.patch as any).mockResolvedValue(mockResponse);

      const result = await applicationService.updateApplicationStatus(1, { status: 'REVIEWED' });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/applications/1/status', { status: 'REVIEWED' });
      expect(result.application.status).toBe('REVIEWED');
    });
  });
});

