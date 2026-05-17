import express, { Router } from 'express';
import { createDeepSeekQuestion, updateDeepSeekQuestion, deleteDeepSeekQuestion, listDeepSeekQuestions } from '../../Controllers/deepSeekQuestionController';
import { authenticateToken, requireRole } from "../../middlewares/authMiddleware";

const router: Router = express.Router();

router.post('/create', authenticateToken, requireRole(['superadmin']), createDeepSeekQuestion);
router.put('/update/:id', authenticateToken, requireRole(['superadmin']), updateDeepSeekQuestion);
router.delete('/delete/:id', authenticateToken, requireRole(['superadmin']), deleteDeepSeekQuestion);
router.get('/list', authenticateToken, requireRole(['superadmin']), listDeepSeekQuestions);

export default router;