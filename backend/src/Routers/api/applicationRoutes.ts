import { Router, Request, Response, NextFunction } from 'express';
import {
  applyToJob,
  applyToJobAsGuest,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  exportApplicationsForJob,
  upload,
  downloadCv,
} from '../../Controllers/ApplicationController';
import { authenticateToken, requireRole } from '../../middlewares/authMiddleware';
import { applicationValidation, updateApplicationStatusValidation, guestApplicationValidation } from '../../middlewares/jobValidation';
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

// Guest application route (public - no authentication required) - must come before authenticated routes
router.post(
  '/guest/:jobId',
  upload.single('cv'),
  guestApplicationValidation,
  handleValidationErrors,
  applyToJobAsGuest
);

// HR / SuperAdmin routes (protected) - specific routes first
// Export all applicants for a job to Excel
router.get('/job/:jobId/export', authenticateToken, requireRole(['hr', 'superadmin']), exportApplicationsForJob);

router.get('/job/:jobId', authenticateToken, requireRole(['hr', 'superadmin']), getJobApplications);
router.get('/admin/:applicationId', authenticateToken, requireRole(['hr', 'superadmin']), getApplicationById);

// Update application status (HR/SuperAdmin) - specific route first
router.patch(
  '/:applicationId/status',
  authenticateToken,
  requireRole(['hr', 'superadmin']),
  updateApplicationStatusValidation,
  handleValidationErrors,
  updateApplicationStatus
);

// Candidate routes (protected) - generic route
router.post(
  '/:jobId',
  authenticateToken,
  requireRole(['user']),
  upload.single('cv'),
  applicationValidation,
  handleValidationErrors,
  applyToJob
);

// Download CV for application (Admin or Candidate/User) - more specific than /:applicationId
router.get(
  '/:applicationId/cv',
  authenticateToken,
  requireRole(['hr', 'superadmin']),
  downloadCv
);

// Shared route (Admin or Candidate/User can view their own) - generic route last
router.get(
  '/:applicationId',
  authenticateToken,
  requireRole(['hr', 'superadmin']),
  getApplicationById
);

export default router;

