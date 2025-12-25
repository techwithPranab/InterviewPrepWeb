import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { authenticateToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// Configuration model
const configurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  defaultDuration: {
    type: Number,
    min: 15,
    max: 120,
    default: 30
  },
  defaultDifficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  autoGenerateQuestions: {
    type: Boolean,
    default: true
  },
  aiAssistanceEnabled: {
    type: Boolean,
    default: true
  },
  recordInterviews: {
    type: Boolean,
    default: false
  },
  allowCandidateRescheduling: {
    type: Boolean,
    default: true
  },
  notificationPreferences: {
    emailReminders: {
      type: Boolean,
      default: true
    },
    smsReminders: {
      type: Boolean,
      default: false
    },
    beforeInterviewHours: {
      type: Number,
      min: 1,
      max: 72,
      default: 24
    }
  }
}, {
  timestamps: true
});

const InterviewerConfiguration = mongoose.models.InterviewerConfiguration || mongoose.model('InterviewerConfiguration', configurationSchema);

// GET - Get interviewer configuration
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (auth as any).decoded.userId;
    const userRole = (auth as any).decoded.role;

    // Check if user is interviewer or admin
    if (userRole !== 'interviewer' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Interviewer role required.' },
        { status: 403 }
      );
    }

    // Get configuration for this user
    let configuration = await InterviewerConfiguration.findOne({ userId });

    // If no configuration exists, create default one
    if (!configuration) {
      configuration = new InterviewerConfiguration({ userId });
      await configuration.save();
    }

    return NextResponse.json(configuration);

  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save/Update interviewer configuration
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = (auth as any).decoded.userId;
    const userRole = (auth as any).decoded.role;

    // Check if user is interviewer or admin
    if (userRole !== 'interviewer' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Interviewer role required.' },
        { status: 403 }
      );
    }

    const configData = await request.json();

    // Update or create configuration
    const configuration = await InterviewerConfiguration.findOneAndUpdate(
      { userId },
      { ...configData, userId },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    return NextResponse.json({
      message: 'Configuration saved successfully',
      configuration
    });

  } catch (error) {
    console.error('Error saving configuration:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
