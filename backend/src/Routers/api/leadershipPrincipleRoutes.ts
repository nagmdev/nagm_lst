// src/Routers/api/leadershipPrincipleRoutes.ts
import express from "express";
import {
  createLeadershipPrinciple,
  getAllLeadershipPrinciples,
  getLeadershipPrincipleById,
  updateLeadershipPrinciple,
  deleteLeadershipPrinciple,
} from "../../Controllers/LeadershipPrincipleController";
import { authenticateToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Public Routes
router.get("/", getAllLeadershipPrinciples);
router.get("/:id", getLeadershipPrincipleById);

// Admin Routes (Protected)
router.post("/", authenticateToken, createLeadershipPrinciple);
router.put("/:id", authenticateToken, updateLeadershipPrinciple);
router.delete("/:id", authenticateToken, deleteLeadershipPrinciple);

export default router;