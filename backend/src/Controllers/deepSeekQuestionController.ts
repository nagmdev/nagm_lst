import { PrismaClient, Question, DeepSeekInteraction, $Enums } from '@prisma/client';
import { Request, Response } from 'express';
import axios from 'axios';

const prisma = new PrismaClient();

interface DeepSeekRequestBody {
  questionType: $Enums.QuestionTypeEnum;
  positionId: number;
  companyId: number;
  leadershipPrincipleId: number;
}

interface DeepSeekUpdateBody extends DeepSeekRequestBody {
  text?: string;
  regenerate?: boolean;
}

interface DeepSeekApiResponse {
  choices: { message: { content: string } }[];
}

class DeepSeekService {
  private static DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
  private static DEEPSEEK_MODEL = 'deepseek-chat';
  private static MAX_TOKENS = 1000;
  private static TEMPERATURE = 0.7;

  static async generatePromptAndResponse(
    questionType: string,
    position: { title: string },
    company: { name: string },
    leadershipPrinciple: { name: string; description: string }
  ): Promise<{ prompt: string; response: string }> {
    const prompt = this.generatePrompt(questionType, position, company, leadershipPrinciple);
    const response = await this.fetchDeepSeekResponse(prompt);
    return { prompt, response };
  }

  private static generatePrompt(
    questionType: string,
    position: { title: string },
    company: { name: string },
    leadershipPrinciple: { name: string; description: string }
  ): string {
    return `Generate a ${questionType} interview question for a ${position.title} role at ${company.name}. 
The question should align with the leadership principle: "${leadershipPrinciple.name}" (${leadershipPrinciple.description}).
Return ONLY the interview question, cleanly, without any extra symbols or commentary. , Return the response to me without any symbols`;
  }

  private static async fetchDeepSeekResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post<DeepSeekApiResponse>(
        this.DEEPSEEK_API_URL,
        {
          model: this.DEEPSEEK_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.MAX_TOKENS,
          temperature: this.TEMPERATURE,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('Failed to get response from DeepSeek API');
    }
  }
}

export const createDeepSeekQuestion = async (req: Request<{}, {}, DeepSeekRequestBody>, res: Response): Promise<void> => {
  try {
    const { questionType, positionId, companyId, leadershipPrincipleId } = req.body;

    // Validate required fields
    if (!questionType || !positionId || !companyId || !leadershipPrincipleId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Fetch related entities in parallel
    const [position, company, leadershipPrinciple] = await Promise.all([
      prisma.position.findUnique({ where: { id: positionId } }),
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.leadershipPrinciple.findUnique({ where: { id: leadershipPrincipleId } }),
    ]);

    if (!position || !company || !leadershipPrinciple) {
      res.status(404).json({ error: 'One or more related entities not found' });
      return;
    }

    // Generate question using DeepSeek
    const { prompt, response } = await DeepSeekService.generatePromptAndResponse(
      questionType,
      position,
      company,
      leadershipPrinciple
    );

    // Create transaction to ensure data consistency
    const [deepSeekInteraction, question] = await prisma.$transaction([
      prisma.deepSeekInteraction.create({
        data: {
          prompt,
          response: JSON.stringify({ choices: [{ message: { content: response } }] }),
          questionType,
          positionId,
          companyId,
          leadershipPrincipleId,
        },
      }),
      prisma.question.create({
        data: {
          text: response,
          companyName: company.name,
          leadershipPrincipleName: leadershipPrinciple.name,
          questionType,
        },
      }),
    ]);

    // Update question with interaction ID
    await prisma.question.update({
      where: { id: question.id },
      data: { deepSeekInteractionId: deepSeekInteraction.id },
    });

    res.status(201).json({ question: { ...question, deepSeekInteractionId: deepSeekInteraction.id }, deepSeekInteraction });
  } catch (error) {
    console.error('Create Question Error:', error);
    res.status(500).json({ 
      error: 'Failed to create DeepSeek question',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateDeepSeekQuestion = async (req: Request<{ id: string }, {}, DeepSeekUpdateBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, questionType, positionId, companyId, leadershipPrincipleId, regenerate } = req.body;
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      res.status(400).json({ error: 'Invalid question ID' });
      return;
    }

    let updatedText = text;
    let updatedInteraction: DeepSeekInteraction | null = null;

    if (regenerate) {
      const [position, company, leadershipPrinciple] = await Promise.all([
        prisma.position.findUnique({ where: { id: positionId } }),
        prisma.company.findUnique({ where: { id: companyId } }),
        prisma.leadershipPrinciple.findUnique({ where: { id: leadershipPrincipleId } }),
      ]);

      if (!position || !company || !leadershipPrinciple) {
        res.status(404).json({ error: 'One or more related entities not found' });
        return;
      }

      const { prompt, response } = await DeepSeekService.generatePromptAndResponse(
        questionType,
        position,
        company,
        leadershipPrinciple
      );

      updatedText = response;
      updatedInteraction = await prisma.deepSeekInteraction.create({
        data: {
          prompt,
          response: JSON.stringify({ choices: [{ message: { content: updatedText } }] }),
          questionType,
          positionId,
          companyId,
          leadershipPrincipleId,
        },
      });
    }

    // Fetch updated company and principle if their IDs changed
    const company = companyId ? await prisma.company.findUnique({ where: { id: companyId } }) : null;
    const principle = leadershipPrincipleId ? await prisma.leadershipPrinciple.findUnique({ where: { id: leadershipPrincipleId } }) : null;

    const updateData = {
      text: updatedText,
      companyName: company?.name,
      leadershipPrincipleName: principle?.name,
      questionType,
      deepSeekInteractionId: updatedInteraction?.id,
    };

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });

    res.json({ 
      question: updatedQuestion, 
      deepSeekInteraction: updatedInteraction 
    });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({ 
      error: 'Failed to update DeepSeek question',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteDeepSeekQuestion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const questionId = parseInt(req.params.id);
    
    if (isNaN(questionId)) {
      res.status(400).json({ error: 'Invalid question ID' });
      return;
    }

    await prisma.$transaction([
      prisma.deepSeekInteraction.deleteMany({ where: { questionId } }),
      prisma.question.delete({ where: { id: questionId } }),
    ]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ 
      error: 'Failed to delete DeepSeek question',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const listDeepSeekQuestions = async (
  req: Request<{}, {}, {}, { 
    id?: string; 
    questionType?: string; 
    positionId?: string; 
    companyId?: string; 
    leadershipPrincipleId?: string 
  }>, 
  res: Response
): Promise<void> => {
  try {
    const { id, questionType, positionId, companyId, leadershipPrincipleId } = req.query;

    if (id) {
      const questionId = parseInt(id);
      if (isNaN(questionId)) {
        res.status(400).json({ error: 'Invalid question ID' });
        return;
      }

      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          deepSeekInteraction: {
            include: {
              position: true,
              company: true,
              leadershipPrinciple: true,
            },
          },
        },
      });

      if (!question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }
      res.json(question);
      return;
    }

    // Build filter for multiple questions
    const whereClause = {
      questionType: questionType as $Enums.QuestionTypeEnum,
      deepSeekInteraction: {
        positionId: positionId ? parseInt(positionId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        leadershipPrincipleId: leadershipPrincipleId ? parseInt(leadershipPrincipleId) : undefined,
      },
    };

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        deepSeekInteraction: {
          include: {
            position: true,
            company: true,
            leadershipPrinciple: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(questions);
  } catch (error) {
    console.error('List Questions Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch DeepSeek questions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};