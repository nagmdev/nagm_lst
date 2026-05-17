import { Router } from 'express';
import { atsCheck, upload, getAllAtsResults, getMyAtsHistory } from '../../Controllers/ATSController';
import { authenticateToken, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

// POST /api/ats/check - Upload CV and job description
router.post('/check', authenticateToken, upload.single('cv'), atsCheck);

// SuperAdmin-only: get all ATS results
router.get('/', authenticateToken, requireRole(['superadmin']), getAllAtsResults);

// Authenticated user: get own ATS history
router.get('/history', authenticateToken, getMyAtsHistory);

export default router; 