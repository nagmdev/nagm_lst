import { Request, Response } from 'express';
import { $Enums } from '@prisma/client';

export const listQuestionTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = Object.values($Enums.QuestionTypeEnum);
    res.json(types);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch question types' });
  }
};
