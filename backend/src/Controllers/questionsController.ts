import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id?: string; groups?: string[] };
}

// Get all questions
export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        text: true,
        companyName: true,
        leadershipPrincipleName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(questions);
  } catch (error) {
    next(error);
  }
};

// Get a single question by ID
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  try {
    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        text: true,
        companyName: true,
        leadershipPrincipleName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    res.json(question);
  } catch (error) {
    next(error);
  }
};

// Create a new question
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { text, companyName, leadershipPrincipleName } = req.body;

  // Require text, but allow companyName and leadershipPrincipleName to be null/undefined
  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  try {
    let finalCompanyName: string | undefined;
    let finalLeadershipPrincipleName: string | undefined;
    let companyId: number | undefined;

    // Handle companyName (null/undefined allowed)
    if (companyName) {
      let company = await prisma.company.findFirst({
        where: { name: companyName },
      });
      if (!company) {
        // Create company if it doesn't exist
        company = await prisma.company.create({
          data: {
            name: companyName,
            status: "active", // Default status
          },
        });
      }
      finalCompanyName = company.name;
      companyId = company.id;
    }

    // Handle leadershipPrincipleName (null/undefined allowed)
    if (leadershipPrincipleName) {
      if (!companyId) {
        // If leadershipPrincipleName is provided but no company, return error
        res
          .status(400)
          .json({
            error:
              "companyName is required when leadershipPrincipleName is provided",
          });
        return;
      }
      let leadershipPrinciple = await prisma.leadershipPrinciple.findFirst({
        where: { name: leadershipPrincipleName, companyId },
      });
      if (!leadershipPrinciple) {
        // Create leadership principle if it doesn't exist
        leadershipPrinciple = await prisma.leadershipPrinciple.create({
          data: {
            name: leadershipPrincipleName,
            description: "Auto-created leadership principle",
            companyId,
          },
        });
      }
      finalLeadershipPrincipleName = leadershipPrinciple.name;
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        text,
        companyName: finalCompanyName,
        leadershipPrincipleName: finalLeadershipPrincipleName,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

// Update an existing question
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { text, companyName, leadershipPrincipleName } = req.body;

  try {
    // Check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: Number(id) },
    });
    if (!existingQuestion) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    // Handle companyName (null/undefined allowed)
    let finalCompanyName: string | undefined = companyName;
    let finalLeadershipPrincipleName: string | undefined = leadershipPrincipleName;
    let companyId: number | undefined;

    if (companyName) {
      let company = await prisma.company.findFirst({
        where: { name: companyName },
      });
      if (!company) {
        // Create company if it doesn't exist
        company = await prisma.company.create({
          data: {
            name: companyName,
            status: "active",
          },
        });
      }
      finalCompanyName = company.name;
      companyId = company.id;
    }

    // Handle leadershipPrincipleName (null/undefined allowed)
    if (leadershipPrincipleName) {
      if (!companyId && companyName) {
        // Fetch companyId if companyName was provided
        const company = await prisma.company.findFirst({
          where: { name: companyName },
        });
        if (company) {
          companyId = company.id;
        }
      }
      if (!companyId) {
        res
          .status(400)
          .json({
            error:
              "companyName is required when leadershipPrincipleName is provided",
          });
        return;
      }
      let leadershipPrinciple = await prisma.leadershipPrinciple.findFirst({
        where: { name: leadershipPrincipleName, companyId },
      });
      if (!leadershipPrinciple) {
        // Create leadership principle if it doesn't exist
        leadershipPrinciple = await prisma.leadershipPrinciple.create({
          data: {
            name: leadershipPrincipleName,
            description: "Auto-created leadership principle",
            companyId,
          },
        });
      }
      finalLeadershipPrincipleName = leadershipPrinciple.name;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: Number(id) },
      data: {
        text,
        companyName: finalCompanyName,
        leadershipPrincipleName: finalLeadershipPrincipleName,
      },
    });

    res.json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

// Delete a question (only if it has no answers)
export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  try {
    // Check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: Number(id) },
    });
    if (!existingQuestion) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    // Check if any answers reference this question
    const answers = await prisma.answer.findMany({
      where: { questionId: Number(id) },
    });

    if (answers.length > 0) {
      res
        .status(400)
        .json({ error: "Cannot delete question with existing answers" });
      return;
    }

    await prisma.question.delete({ where: { id: Number(id) } });
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    next(error);
  }
};
