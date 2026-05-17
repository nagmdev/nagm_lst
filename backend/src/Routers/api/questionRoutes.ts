import { Router } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion } from "../../Controllers/questionsController";

const router = Router();

router.get("/" , getQuestions);
router.get("/:id", authenticateToken,  getQuestionById);
router.post("/", authenticateToken, createQuestion);
router.put("/:id", authenticateToken, updateQuestion);
router.delete("/:id", authenticateToken, deleteQuestion);

export default router;