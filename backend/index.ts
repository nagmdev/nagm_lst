import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import waitingListRoutes from "./src/Routers/api/waitingListRoutes";
import questionRoutes from "./src/Routers/api/questionRoutes";
import companyRoutes from "./src/Routers/api/companyRoutes";
import leadershipPrincipleRoutes from "./src/Routers/api/leadershipPrincipleRoutes";
import PostionRoutes from "./src/Routers/api/positionRoutes";
// import generateRoutes from './src/Controllers/OllamaController';
import  deepSeekQuestionRoutes  from './src/Routers/api/deepSeekQuestions';
import  listQuestionTypes  from './src/Routers/api/listQuestionTypes';
import atsRoutes from './src/Routers/api/atsRoutes';
import authRoutes from './src/Routers/api/authRoutes';
import answerRoutes from './src/Routers/api/answerRoutes';
import userRoutes from './src/Routers/api/userRoutes';
import jobRoutes from './src/Routers/api/jobRoutes';
import adminJobRoutes from './src/Routers/api/adminJobRoutes';
import applicationRoutes from './src/Routers/api/applicationRoutes';


dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL || "",
  ].filter(Boolean) as string[],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;
  console.log(`[REQ] ${method} ${originalUrl}`, {
    query: req.query,
    params: req.params,
    body: req.body,
  });
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(`[RES] ${method} ${originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });
  next();
});

app.use('/api/answers', answerRoutes); // Answers routes
app.use('/api/user', userRoutes);   // User routes
app.use("/api/waiting-list", waitingListRoutes);  // Waiting list routes
app.use("/api/questions", questionRoutes); // Questions routes
app.use("/api/companies", companyRoutes); // Company routes
app.use("/api/leadership-principles", leadershipPrincipleRoutes); // Leadership Principles routes
app.use("/api/positions", PostionRoutes); // Position routes
app.use('/api/deepseek/questions', deepSeekQuestionRoutes); // DeepSeek Questions routes
app.use('/api', listQuestionTypes);
app.use('/api/ats', atsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin/jobs', adminJobRoutes);
app.use('/api/applications', applicationRoutes);
// Backwards-compatible alias: some callers use singular `/api/application`
app.use('/api/application', applicationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'NAGM Backend API', version: '1.0.0' });
});

// app.use('/', generateRoutes); // Ollama routes

export default app;

const DEFAULT_PORT = Number(process.env.PORT) || 3000;

function startServer(port: number, remainingAttempts: number = 10): void {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (error: any) => {
    if (error && error.code === 'EADDRINUSE' && remainingAttempts > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Trying ${nextPort}...`);
      startServer(ne
    console.error('FaixtPort, remainingAttempts - 1);
      return;
    }led to start server:', error);
    process.exit(1);
  });
}

if (!process.env.VERCEL) {
  startServer(DEFAULT_PORT);
}

