import { Router } from 'express';
import { CreateAnswer, getUserAnswers, UpdateAnswer, DeleteAnswer } from '../../Controllers/AnswerController';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/create', authenticateToken, CreateAnswer);
router.get('/get_user_answers', authenticateToken, getUserAnswers);
router.put('/update/:id', authenticateToken, UpdateAnswer);
router.delete('/delete/:id', authenticateToken, DeleteAnswer);

export default router;
