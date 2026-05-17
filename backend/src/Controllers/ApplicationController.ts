import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import prisma from '../config/prismaClient';
import axios from 'axios';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { v4 as uuidv4 } from 'uuid';
import ExcelJS from 'exceljs';

const isSuperAdmin = (role?: string) => role === 'superadmin';
const isHr = (role?: string) => role === 'hr';

// Ensure upload directory exists
// Use absolute path to ensure it works in both development and production
// __dirname in compiled code points to dist/Controllers, so we go up to dist, then to src/cv
// Or use process.cwd() to get project root
const getUploadDir = () => {
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '../cv'), // From dist/Controllers -> dist/cv (if compiled)
    path.join(__dirname, '../../src/cv'), // From dist/Controllers -> src/cv
    path.join(process.cwd(), 'src/cv'), // From project root -> src/cv
    path.join(process.cwd(), 'dist/cv'), // From project root -> dist/cv (if compiled)
  ];
  
  // Return the first path that exists, or create the first one
  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      return dirPath;
    }
  }
  
  // If none exist, create the first one (most likely location)
  const defaultPath = path.join(process.cwd(), 'src/cv');
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath, { recursive: true });
  }
  return defaultPath;
};

const uploadDir = getUploadDir();
console.log(`[CV Upload] Using upload directory: ${uploadDir}`);

// Set up multer for CV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Helper function to run ATS check (reusing existing ATS logic)
const runAtsCheck = async (
  cvPath: string,
  jobDescription: string,
  fileMimeType?: string
): Promise<{ atsScore: number; recommendations: string; pass: boolean; cvText: string; rawJson: string }> => {
  const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepSeekApiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  // Parse file to text
  const cvBuffer = fs.readFileSync(cvPath);
  let cvText: string;

  // Handle PDF files
  if (fileMimeType === 'application/pdf' || cvPath.endsWith('.pdf')) {
    cvText = (await pdfParse(cvBuffer)).text;
  } 
  // Handle DOCX files - Note: Requires additional library for full support
  // For now, DOCX files will need manual text extraction or additional library
  else if (fileMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || cvPath.endsWith('.docx')) {
    // TODO: Add DOCX parsing library (e.g., mammoth)
    // For now, throw error to indicate DOCX needs additional setup
    throw new Error('DOCX file parsing requires additional library. Please use PDF or install mammoth library.');
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX are supported.');
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
  const rawJson = apiResponse.choices[0].message.content;
  const { atsScore, recommendations, pass } = JSON.parse(rawJson);

  return { atsScore, recommendations, pass, cvText, rawJson };
};

// Apply to job (Candidate only)
export const applyToJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const candidateId = req.user?.id;
    const userRole = req.user?.role;
    if (!candidateId || userRole !== 'user') {
      res.status(403).json({ error: 'Forbidden: Only users can apply to jobs' });
      return;
    }

    const { jobId } = req.params;
    const cvFile = req.file;
    const { expectedSalary, phone, experienceYears, skills } = req.body;

    // Validate job ID
    const parsedJobId = parseInt(jobId);
    if (isNaN(parsedJobId) || parsedJobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    // Validate required fields
    if (!cvFile) {
      res.status(400).json({ error: 'CV file is required (PDF or DOCX)' });
      return;
    }

    if (!expectedSalary || !phone || experienceYears === undefined) {
      res.status(400).json({ error: 'Expected salary, phone, and years of experience are required' });
      return;
    }

    // Check if job exists and is approved
    const job = await prisma.job.findUnique({
      where: { id: parsedJobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.status !== 'APPROVED') {
      res.status(400).json({ error: 'Cannot apply to this job. Job is not approved yet.' });
      return;
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId: parsedJobId,
        },
      },
    });

    if (existingApplication) {
      res.status(409).json({ error: 'You have already applied to this job' });
      return;
    }

    // Run ATS check using existing logic
    let atsScore: number | null = null;
    let atsReport: string | null = null;

    try {
      const jobDescription = `${job.title}\n\n${job.description}\n\nResponsibilities:\n${job.responsibilities}\n\nRequirements:\n${job.requirements.join('\n')}`;

      const atsResult = await runAtsCheck(cvFile.path, jobDescription, cvFile.mimetype);
      atsScore = atsResult.atsScore;
      atsReport = atsResult.recommendations;

      // Persist ATS history record linked to this job and user
      await prisma.aTSResult.create({
        data: {
          userId: candidateId,
          jobId: parsedJobId,
          cvPath: cvFile.filename,
          cvText: atsResult.cvText,
          jobDescription,
          atsScore: atsResult.atsScore,
          recommendations: atsResult.recommendations,
          fullReportJson: atsResult.rawJson,
          pass: atsResult.pass,
        },
      });
    } catch (atsError) {
      console.error('ATS check failed:', atsError);
      // Continue with application even if ATS fails
      // You might want to handle this differently based on requirements
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId: parsedJobId,
        cvUrl: cvFile.filename,
        expectedSalary: parseFloat(expectedSalary),
        experienceYears: parseInt(experienceYears),
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        atsScore,
        atsReport,
        status: 'NEW',
      },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error: any) {
    console.error('Apply to job error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'You have already applied to this job' });
    } else {
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
};

// Apply to job as guest (Public - No authentication required)
export const applyToJobAsGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const cvFile = req.file;
    const { email, firstName, lastName, phone, expectedSalary, experienceYears, skills } = req.body;

    // Validate job ID
    const parsedJobId = parseInt(jobId);
    if (isNaN(parsedJobId) || parsedJobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    // Validate required fields
    if (!cvFile) {
      res.status(400).json({ error: 'CV file is required (PDF or DOCX)' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    if (!expectedSalary || !phone || experienceYears === undefined) {
      res.status(400).json({ error: 'Expected salary, phone, and years of experience are required' });
      return;
    }

    // Check if job exists and is approved
    const job = await prisma.job.findUnique({
      where: { id: parsedJobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.status !== 'APPROVED') {
      res.status(400).json({ error: 'Cannot apply to this job. Job is not approved yet.' });
      return;
    }

    // Check if user exists with this email
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Case 1: Existing User - Link application to this user
      // Update user info if provided
      if (firstName || lastName || phone) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
          },
        });
      }

      // Check if already applied
      const existingApplication = await prisma.application.findUnique({
        where: {
          candidateId_jobId: {
            candidateId: user.id,
            jobId: parsedJobId,
          },
        },
      });

      if (existingApplication) {
        res.status(409).json({ error: 'You have already applied to this job' });
        return;
      }
    } else {
      // Case 2: New User (Guest) - Create guest user without password
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
          password: null, // Guest user has no password
          role: 'user',
          status: 'ACTIVE',
          isVerified: false, // Guest users are not verified
        },
      });
    }

    // Run ATS check using existing logic
    let atsScore: number | null = null;
    let atsReport: string | null = null;

    try {
      const jobDescription = `${job.title}\n\n${job.description}\n\nResponsibilities:\n${job.responsibilities}\n\nRequirements:\n${job.requirements.join('\n')}`;

      const atsResult = await runAtsCheck(cvFile.path, jobDescription, cvFile.mimetype);
      atsScore = atsResult.atsScore;
      atsReport = atsResult.recommendations;

      // Persist ATS history record linked to this job and user
      await prisma.aTSResult.create({
        data: {
          userId: user.id,
          jobId: parsedJobId,
          cvPath: cvFile.filename,
          cvText: atsResult.cvText,
          jobDescription,
          atsScore: atsResult.atsScore,
          recommendations: atsResult.recommendations,
          fullReportJson: atsResult.rawJson,
          pass: atsResult.pass,
        },
      });
    } catch (atsError) {
      console.error('ATS check failed:', atsError);
      // Continue with application even if ATS fails
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId: user.id,
        jobId: parsedJobId,
        cvUrl: cvFile.filename,
        expectedSalary: parseFloat(expectedSalary),
        experienceYears: parseInt(experienceYears),
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        atsScore,
        atsReport,
        status: 'NEW',
      },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
          },
        },
      },
    });

    // Check if user is a guest (no password)
    const isGuest = !user.password;

    res.status(201).json({
      message: 'Your application has been submitted successfully.',
      application,
      isGuest, // Indicate if user needs to create account
      canCreateAccount: isGuest, // Frontend can use this to show account creation option
    });
  } catch (error: any) {
    console.error('Guest application error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'You have already applied to this job' });
    } else {
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
};

// Get applications for a job (HR owner or SuperAdmin)
export const getJobApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    const { jobId } = req.params;

    if (!requesterId || (!isHr(requesterRole) && !isSuperAdmin(requesterRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    // Validate job ID
    const parsedJobId = parseInt(jobId);
    if (isNaN(parsedJobId) || parsedJobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: parsedJobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (isHr(requesterRole) && job.createdBy !== requesterId) {
      res.status(403).json({ error: 'Forbidden: You can only view candidates for your jobs' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { jobId: parsedJobId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { atsScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Sort applications: those with ATS scores first, then by score, then by date
    applications.sort((a: typeof applications[0], b: typeof applications[0]) => {
      // Applications with ATS scores come first
      if (a.atsScore === null && b.atsScore !== null) return 1;
      if (a.atsScore !== null && b.atsScore === null) return -1;
      // If both have scores, sort by score
      if (a.atsScore !== null && b.atsScore !== null) {
        return b.atsScore - a.atsScore;
      }
      // If both are null, sort by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get single application by ID (HR owner or SuperAdmin)
export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { applicationId } = req.params;

    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    // Validate application ID
    const parsedApplicationId = parseInt(applicationId);
    if (isNaN(parsedApplicationId) || parsedApplicationId <= 0) {
      res.status(400).json({ error: 'Invalid application ID. ID must be a positive number.' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: parsedApplicationId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
            createdBy: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (isHr(userRole) && application.job?.createdBy !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only view candidates for your jobs' });
      return;
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

// Update application status (HR owner or SuperAdmin)
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    // Validate application ID
    const parsedApplicationId = parseInt(applicationId);
    if (isNaN(parsedApplicationId) || parsedApplicationId <= 0) {
      res.status(400).json({ error: 'Invalid application ID. ID must be a positive number.' });
      return;
    }

    if (!status || !['NEW', 'REVIEWED', 'INTERVIEW', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be NEW, REVIEWED, INTERVIEW, or REJECTED' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: parsedApplicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (isHr(userRole) && application.job?.createdBy !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only manage candidates for your jobs' });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id: parsedApplicationId },
      data: { status },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Download CV file for an application (HR owner or SuperAdmin)
export const downloadCv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { applicationId } = req.params;

    console.log(`[Download CV] Request for application ${applicationId} by user ${userId} with role ${userRole}`);

    if (!userId || (!isHr(userRole) && !isSuperAdmin(userRole))) {
      console.log(`[Download CV] Access denied: User ${userId} with role ${userRole} is not HR or SuperAdmin`);
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    const parsedApplicationId = parseInt(applicationId);
    if (isNaN(parsedApplicationId) || parsedApplicationId <= 0) {
      console.log(`[Download CV] Invalid application ID: ${applicationId}`);
      res.status(400).json({ error: 'Invalid application ID. ID must be a positive number.' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: parsedApplicationId },
      select: {
        id: true,
        candidateId: true,
        cvUrl: true,
        job: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (!application) {
      console.log(`[Download CV] Application ${parsedApplicationId} not found`);
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // HR only for owned jobs; superadmin can download all
    if (isHr(userRole) && application.job?.createdBy !== userId) {
      console.log(`[Download CV] Access denied: HR user ${userId} does not own job ${application.job?.createdBy}`);
      res.status(403).json({ error: 'Forbidden: You can only download CVs for your jobs' });
      return;
    }

    if (!application.cvUrl) {
      console.log(`[Download CV] No CV URL found for application ${parsedApplicationId}`);
      res.status(404).json({ error: 'CV file not found for this application' });
      return;
    }

    const filePath = path.join(uploadDir, application.cvUrl);
    console.log(`[Download CV] Looking for file at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`[Download CV] File not found at path: ${filePath}`);
      res.status(404).json({ error: 'CV file not found on server' });
      return;
    }

    const fileExtension = path.extname(application.cvUrl).toLowerCase();
    const originalFileName = application.cvUrl.split('-').slice(1).join('-'); // Remove timestamp prefix
    
    if (fileExtension === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    } else if (fileExtension === '.docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    }

    console.log(`[Download CV] Sending file: ${filePath}`);
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error(`[Download CV] Error sending file:`, err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download CV file' });
        }
      } else {
        console.log(`[Download CV] File sent successfully`);
      }
    });
  } catch (error) {
    console.error('[Download CV] Unexpected error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download CV' });
    }
  }
};

// Export all applications for a job to Excel (HR owner or SuperAdmin)
export const exportApplicationsForJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    const { jobId } = req.params;

    if (!requesterId || (!isHr(requesterRole) && !isSuperAdmin(requesterRole))) {
      res.status(403).json({ error: 'Forbidden: HR or SuperAdmin only' });
      return;
    }

    const parsedJobId = parseInt(jobId);
    if (isNaN(parsedJobId) || parsedJobId <= 0) {
      res.status(400).json({ error: 'Invalid job ID. ID must be a positive number.' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id: parsedJobId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (isHr(requesterRole) && job.createdBy !== requesterId) {
      res.status(403).json({ error: 'Forbidden: You can only export candidates for your jobs' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { jobId: parsedJobId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Applicants');

    sheet.columns = [
      { header: 'Candidate Email', key: 'email', width: 30 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Experience Years', key: 'experienceYears', width: 18 },
      { header: 'Applied At', key: 'appliedAt', width: 20 },
      { header: 'Expected Salary', key: 'expectedSalary', width: 18 },
      { header: 'ATS Score', key: 'atsScore', width: 12 },
      { header: 'CV Filename', key: 'cvUrl', width: 40 },
    ];

    applications.forEach((app: any) => {
      sheet.addRow({
        email: app.candidate?.email || '',
        firstName: app.candidate?.firstName || '',
        lastName: app.candidate?.lastName || '',
        phone: app.candidate?.phone || '',
        experienceYears: app.experienceYears ?? '',
        appliedAt: app.createdAt ? new Date(app.createdAt).toLocaleString() : '',
        expectedSalary: typeof app.expectedSalary === 'number' ? `$${app.expectedSalary}` : '',
        atsScore: typeof app.atsScore === 'number' ? `${Math.round(app.atsScore)}%` : '',
        cvUrl: app.cvUrl || '',
      });
    });

    // Prepare buffer and send as attachment
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `applications-job-${parsedJobId}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({ error: 'Failed to export applications' });
  }
};

