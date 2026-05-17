import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import prisma from '../config/prismaClient';
import axios from 'axios';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Ensure upload directory exists before using multer
const uploadDir = path.join(__dirname, '../cv');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({ storage });

/**
 * Standalone ATS check endpoint.
 * - Requires authenticated user
 * - Uploads CV + job description
 * - Runs DeepSeek ATS analysis
 * - Persists result into ATSResult history (no jobId link)
 */
export const atsCheck = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const cvFile = req.file;
    const jobDescription = req.body.jobDescription;
    if (!cvFile || !jobDescription) {
      res.status(400).json({ error: 'CV and job description are required.' });
      return;
    }

    // Parse PDF to text
    if (!cvFile.path || !fs.existsSync(cvFile.path)) {
      res.status(400).json({ error: 'Uploaded CV file not found on server.' });
      return;
    }
    const cvBuffer = fs.readFileSync(cvFile.path);
    const cvText = (await pdfParse(cvBuffer)).text;

    // Call DeepSeek API
    const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepSeekApiKey) {
      console.error('DEEPSEEK_API_KEY is not set in .env file');
      res.status(500).json({ error: 'API key for AI service is not configured.' });
      return;
    }
    const prompt = `
      As an expert Applicant Tracking System (ATS), analyze the following CV against the provided job description.
      Provide a JSON response with the following structure:
      {
        "atsScore": <A score from 0 to 100>,
        "recommendations": "<Detailed recommendations for improvement, as a single string>",
        "pass": <true or false, based on a 70% score threshold>
      }

      Job Description:
      ---
      ${jobDescription}
      ---

      CV:
      ---
      ${cvText}
      ---
    `;

    const deepSeekResponse = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekApiKey}`,
        },
      }
    );

    const apiResponse = deepSeekResponse.data as { choices: { message: { content: string } }[] };
    const rawContent = apiResponse.choices[0].message.content;
    const { atsScore, recommendations, pass } = JSON.parse(rawContent);

    // Store result in DB (standalone ATS, no specific jobId)
    const atsResult = await prisma.aTSResult.create({
      data: {
        userId,
        cvPath: cvFile.filename,
        cvText,
        jobDescription,
        atsScore,
        recommendations,
        fullReportJson: rawContent,
        pass,
      },
    });

    res.json({
      atsScore,
      recommendations,
      pass,
      atsResultId: atsResult.id,
    });
  } catch (error: any) {
    if (error.isAxiosError) {
      console.error('DeepSeek API Error:', error.response?.data);
      res.status(500).json({ error: 'Failed to get analysis from AI service.', details: error.response?.data });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Admin-only endpoint to view all ATS results across all users.
 */
export const getAllAtsResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'superadmin') {
      res.status(403).json({ error: 'Forbidden: SuperAdmin only' });
      return;
    }
    const results = await prisma.aTSResult.findMany({
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get ATS history for the currently authenticated user.
 * Returns all ATS scans (standalone or job-linked) ordered by most recent first.
 */
export const getMyAtsHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const results = await prisma.aTSResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
