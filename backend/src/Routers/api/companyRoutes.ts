import express from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  forceDeleteCompany,
} from "../../Controllers/CompanyController";
import { authenticateToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Public Routes  
router.get('/getAllCompanies', getAllCompanies);
router.get("/:id", getCompanyById);

// Admin Routes (Protected Routes)
router.post("/", authenticateToken, createCompany);
router.put("/:id", authenticateToken, updateCompany);
router.delete("/:id", authenticateToken, deleteCompany);
router.delete("/force/:id", authenticateToken, forceDeleteCompany);

export default router;