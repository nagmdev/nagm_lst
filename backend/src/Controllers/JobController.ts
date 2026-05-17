import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const isSuperAdmin = (role?: string) => role === 'superadmin';
const isHr = (role?: string) => role === 'hr';

// Create new job post (HR or SuperAdmin)
export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    const {
      title,
      description,
      responsibilities,
      requirements,
      salaryMin,
      salaryMax,
      location,
      employmentType,
    } = req.body;

    // Validate required fields
    if (!title || !description || !responsibilities || !location) {
      res.status(400).json({ error: 'Title, description, responsibilities, and location are required' });
      return;
    }
    
    const job = await prisma.job.create({
      data: {
        title,
        description,
        responsibilities,
        requirements: Array.isArray(requirements) ? requirements : [],
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        location,
        employmentType: employmentType || 'FULL_TIME',
        status: 'APPROVED', // Keep existing behavior
        createdBy: userId,
      },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job post' });
  }
};

// Get jobs for HR or SuperAdmin
export const getMyJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: isSuperAdmin(userRole) ? {} : { createdBy: userId },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Update job post (HR owner or SuperAdmin)
export const updateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    // Validate ID is a valid number
    const jobId = parseInt(id);
    if (isNaN(jobId) || jobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (isHr(userRole) && job.createdBy !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only update your own job posts' });
      return;
    }

    const {
      title,
      description,
      responsibilities,
      requirements,
      salaryMin,
      salaryMax,
      location,
      employmentType,
    } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        responsibilities,
        requirements: Array.isArray(requirements) ? requirements : job.requirements,
        salaryMin: salaryMin ? parseFloat(salaryMin) : job.salaryMin,
        salaryMax: salaryMax ? parseFloat(salaryMax) : job.salaryMax,
        location,
        employmentType: employmentType || job.employmentType,
        status: job.status, // Admin keeps current status
      },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete job post (HR owner or SuperAdmin)
export const deleteJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    // Validate ID is a valid number
    const jobId = parseInt(id);
    if (isNaN(jobId) || jobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (isHr(userRole) && job.createdBy !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only delete your own job posts' });
      return;
    }

    // Delete job (applications will be cascade deleted if needed)
    await prisma.job.delete({
      where: { id: jobId },
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// Get all approved jobs (Public - for job browsing, HR gets only owned, SuperAdmin gets all)
export const getAllApprovedJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      location, 
      employmentType,
      search 
    } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const whereClause: any = {};
    if (isHr(userRole)) {
      whereClause.createdBy = userId;
    } else if (!isSuperAdmin(userRole)) {
      // Public and regular users see only approved jobs
      whereClause.status = 'APPROVED';
    }

    // Filter by location if provided
    if (location && typeof location === 'string') {
      whereClause.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Filter by employment type if provided
    if (employmentType && typeof employmentType === 'string') {
      whereClause.employmentType = employmentType;
    }

    // Search in title, description, or location
    if (search && typeof search === 'string') {
      const searchConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
      
      // If we have location filter, combine with search using AND
      if (whereClause.location) {
        whereClause.AND = [
          { location: whereClause.location },
          { OR: searchConditions },
        ];
        delete whereClause.location;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        include: {
          employer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.job.count({ where: whereClause }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all approved jobs error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Get single job by ID (for viewing)
export const getJobById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID is a valid number
    const jobId = parseInt(id);
    if (isNaN(jobId) || jobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Only show approved jobs to public or users
    const userRole = (req as AuthenticatedRequest).user?.role;
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!isSuperAdmin(userRole) && !isHr(userRole) && job.status !== 'APPROVED') {
      res.status(403).json({ error: 'Job is not available' });
      return;
    }

    if (isHr(userRole) && job.createdBy !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only view your own jobs' });
      return;
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

