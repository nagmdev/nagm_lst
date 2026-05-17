import { Router, Request, Response, NextFunction } from 'express';
import {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJobById,
  getAllApprovedJobs,
} from '../../Controllers/JobController';
import { authenticateToken, maybeAuthenticate, requireRole } from '../../middlewares/authMiddleware';
import { createJobValidation } from '../../middlewares/jobValidation';
import { validationResult } from 'express-validator';

const router = Router();

// Validation middleware helper
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// IMPORTANT: Specific routes must come before generic parameterized routes

// Public route - get all approved jobs (must come before /:id)
router.get('/', maybeAuthenticate, getAllApprovedJobs);

// HR + SuperAdmin routes (protected) - specific routes first
router.post('/', authenticateToken, requireRole(['hr', 'superadmin']), createJobValidation, handleValidationErrors, createJob);
router.get('/all', authenticateToken, requireRole(['hr', 'superadmin']), getMyJobs); // HR or SuperAdmin gets jobs

// Public route - view approved job (generic route) with optional auth for HR visibility
router.get('/:id', maybeAuthenticate, getJobById);

// HR + SuperAdmin routes (protected) - parameterized routes
router.put('/:id', authenticateToken, requireRole(['hr', 'superadmin']), createJobValidation, handleValidationErrors, updateJob);
router.delete('/:id', authenticateToken, requireRole(['hr', 'superadmin']), deleteJob);

export default router;

