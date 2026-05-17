// routes/questionTypeRoutes.ts
import { Router } from 'express';
import { listQuestionTypes } from '../../Controllers/question-types';

const router = Router();

router.get('/question-types', listQuestionTypes);

export default router;
