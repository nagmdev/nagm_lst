import express, { Request, Response } from "express";
import { registerUserToWaitingList } from "../../Controllers/waitingListController";

const router = express.Router();

// Health Check Route (Optional, for debugging)
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Waiting List API is working!" });
});

// Register user to waiting list
router.post("/", async (req: Request, res: Response) => {
  try {
    await registerUserToWaitingList(req, res);
  } catch (error: any) {
    console.error("Waiting List Route Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

export default router;