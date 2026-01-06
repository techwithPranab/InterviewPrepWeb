import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Load from backend/.env first
dotenv.config({ path: path.join(__dirname, '../..', '.env') }); // Then load from root/.env if needed

// Import database connection
import { connectDB, disconnectDB } from './config/database';

// Import models (for schema registration)
import './models/User';
import './models/Skill';
import './models/ScheduledInterview';
import './models/InterviewGuide';
import './models/Interviewer';
import './models/Achievement';
import './models/CollaborativeSession';
import './models/SystemSettings';
import './models/InterviewSession';
import './models/QuestionBank';

// Import middleware
import errorHandler, { notFound, asyncHandler } from './middleware/errorHandler';

// Import services
import emailService from './services/emailService';
import aiService from './services/aiService';
import fileService from './services/fileService';

const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date(),
    environment: NODE_ENV
  });
});

// API routes - Import and mount route groups here
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import skillRoutes from './routes/skills';
import interviewsRoutes from './routes/interviews';
import interviewGuidesRoutes from './routes/interviewGuides';
import scheduledInterviewsRoutes from './routes/scheduledInterviews';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import interviewersRoutes from './routes/interviewers';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/interview-guides', interviewGuidesRoutes);
app.use('/api/scheduled-interviews', scheduledInterviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/interviewers', interviewersRoutes);

// Service availability endpoints (for development)
if (NODE_ENV === 'development') {
  app.get('/api/services/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Services status',
      services: {
        email: 'initialized',
        ai: 'initialized',
        file: 'initialized'
      }
    });
  });

  app.post('/api/services/test-email', asyncHandler(async (req: Request, res: Response) => {
    try {
      const sent = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email from the Mock Interview Backend</p>'
      });

      res.json({
        success: true,
        message: 'Test email sent',
        result: sent
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message
      });
    }
  }));
}

// 404 handler - must be before error handler
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

/**
 * Database connection and server startup
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✓ MongoDB connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║ Mock Interview Backend Server               ║`);
      console.log(`║ Server running on: http://localhost:${PORT}     ║`);
      console.log(`║ Environment: ${NODE_ENV.padEnd(30)} ║`);
      console.log(`║ Database: MongoDB (connected)              ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    await disconnectDB();
    console.log('✓ Database disconnected');
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }

  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
export { startServer };
