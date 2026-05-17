import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllJobs,
  updateJobStatus,
} from '../../Controllers/AdminJobController';
import { authenticateToken, requireRole } from '../../middlewares/authMiddleware';
import { updateJobStatusValidation } from '../../middlewares/jobValidation';
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

// SuperAdmin routes (protected)
router.get('/', authenticateToken, requireRole(['superadmin']), getAllJobs);
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(['superadmin']),
  updateJobStatusValidation,
  handleValidationErrors,
  updateJobStatus
);

export default router;

