import express from "express";
import {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
} from "../../Controllers/Positions";

const router = express.Router();

router.post("/", createPosition);
router.get("/", getAllPositions);
router.get("/:id", getPositionById);
router.put("/:id", updatePosition);
router.delete("/:id", deletePosition);

export default router;