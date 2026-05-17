import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id?: string; groups?: string[] };
}

export const CreateAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { situation, task, action, result, audioUrl, questionId } = req.body;
  
  // Get userId from authenticated request
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    // Verify user exists before creating answer
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const newAnswer = await prisma.answer.create({
      data: {
        situation,
        task,
        action,
        result,
        audioUrl,
        questionId: questionId || null, // Allow null value for questionId
        userId,
      },
    });

    res.status(201).json(newAnswer);
  } catch (error) {
    console.error(`Failed to create an answer:`, error);
    res.status(500).json({ message: "Internal server error. Please contact support." });
  }
};

export const getUserAnswers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Get userId from authenticated request instead of params for security
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const answers = await prisma.answer.findMany({
      where: { userId },
      include: { question: true },
    });

    res.status(200).json(answers);
  } catch (error) {
    console.error(`Failed fetching user answers:`, error);
    res.status(500).json({ message: "Internal server error. Please contact support." });
  }
};

export const UpdateAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { situation, task, action, result, audioUrl, questionId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: Number(id) },
      select: { userId: true },
    });

    if (!existingAnswer) {
      res.status(404).json({ message: "Answer not found." });
      return;
    }

    // Ensure user can only update their own answers
    if (existingAnswer.userId !== userId) {
      res.status(403).json({ message: "You can only update your own answers." });
      return;
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id: Number(id) },
      data: {
        situation,
        task,
        action,
        result,
        audioUrl,
        questionId: questionId || null, // Allow null value for questionId
      },
    });

    res.status(200).json({ message: "Updated answer successfully", updatedAnswer });
  } catch (error) {
    console.error("Failed updating an answer:", error);
    res.status(500).json({ message: "Internal server error. Please contact support." });
  }
};

export const DeleteAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const answer = await prisma.answer.findUnique({
      where: { id: Number(id) },
      select: { userId: true },
    });

    if (!answer) {
      res.status(404).json({ message: "Answer not found" });
      return;
    }

    // Ensure user can only delete their own answers
    if (answer.userId !== userId) {
      res.status(403).json({ message: "You can only delete your own answers." });
      return;
    }

    await prisma.answerRevision.deleteMany({
      where: { answerId: Number(id) },
    });

    await prisma.answer.update({
      where: { id: Number(id) },
      data: {
        tags: { set: [] },
      },
    });

    await prisma.answer.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Deleted answer successfully" });
  } catch (error) {
    console.error(`Failed deleting an answer:`, error);
    res.status(500).json({ message: "Internal server error. Please contact support." });
  }
};