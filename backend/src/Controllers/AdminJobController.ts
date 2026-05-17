import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Get all job posts (Admin only)
export const getAllJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, page = 1, limit = 20 } = req.query;

    const whereClause: any = {
      createdBy: userId,
    };
    if (status) {
      whereClause.status = status;
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
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Update job status (Approve/Reject/Request Changes)
export const updateJobStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate job ID
    const jobId = parseInt(id);
    if (isNaN(jobId) || jobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    if (!status || !['APPROVED', 'REJECTED', 'PENDING', 'CLOSED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be APPROVED, REJECTED, PENDING, or CLOSED' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.createdBy !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only change status for your own job posts' });
      return;
    }

    const updateData: any = { status };
    
    // If rejecting, you might want to store rejection reason
    // For now, we'll just update status

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
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

    res.json({
      message: `Job ${status.toLowerCase()} successfully`,
      job: updatedJob,
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
};

