import { updateJob, getMyJobs } from '../src/Controllers/JobController';
import { getJobApplications } from '../src/Controllers/ApplicationController';
import prisma from '../src/config/prismaClient';

jest.mock('../src/config/prismaClient', () => ({
  __esModule: true,
  default: {
    job: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    application: {
      findMany: jest.fn(),
    },
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('RBAC guardrails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents HR from updating a job they do not own', async () => {
    (prisma.job.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      createdBy: 'owner-123',
      requirements: [],
      salaryMin: null,
      salaryMax: null,
      employmentType: 'FULL_TIME',
      status: 'APPROVED',
    });

    const req: any = {
      user: { id: 'hr-user', role: 'hr' },
      params: { id: '1' },
      body: {},
    };
    const res = mockResponse();

    await updateJob(req, res as any);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('only update your own') })
    );
  });

  it('allows SuperAdmin to update any job', async () => {
    (prisma.job.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      createdBy: 'someone-else',
      title: 'Old',
      description: 'desc',
      responsibilities: 'resp',
      requirements: [],
      salaryMin: null,
      salaryMax: null,
      location: 'CA',
      employmentType: 'FULL_TIME',
      status: 'APPROVED',
    });
    (prisma.job.update as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'New title',
    });

    const req: any = {
      user: { id: 'super-1', role: 'superadmin' },
      params: { id: '1' },
      body: { title: 'New title' },
    };
    const res = mockResponse();

    await updateJob(req, res as any);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Job updated successfully' })
    );
  });

  it('blocks basic users from admin-only jobs listing', async () => {
    const req: any = {
      user: { id: 'user-1', role: 'user' },
    };
    const res = mockResponse();

    await getMyJobs(req, res as any);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('prevents HR from viewing candidates for jobs they do not own', async () => {
    (prisma.job.findUnique as jest.Mock).mockResolvedValue({
      id: 10,
      createdBy: 'another-hr',
    });

    const req: any = {
      user: { id: 'hr-user', role: 'hr' },
      params: { jobId: '10' },
    };
    const res = mockResponse();

    await getJobApplications(req, res as any);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('only view candidates for your jobs') })
    );
  });
});

