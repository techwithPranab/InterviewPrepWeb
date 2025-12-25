import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { authenticateToken } from '@/lib/middleware/auth';

// Import or create InterviewTemplate model
import mongoose from 'mongoose';

const interviewTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed'],
    default: 'technical'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  duration: {
    type: Number,
    min: 15,
    max: 120,
    default: 30
  },
  skills: [{
    type: String,
    required: true
  }],
  questionCount: {
    type: Number,
    min: 1,
    max: 20,
    default: 5
  },
  autoGenerate: {
    type: Boolean,
    default: true
  },
  customQuestions: [{
    question: {
      type: String,
      required: true
    },
    expectedAnswer: String,
    timeLimit: {
      type: String,
      default: "3"
    },
    assessmentCriteria: {
      type: [String],
      default: ['technical_accuracy']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const InterviewTemplate = mongoose.models.InterviewTemplate || mongoose.model('InterviewTemplate', interviewTemplateSchema);

// GET - Get all templates for the interviewer
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

    // Get templates created by this interviewer or default templates
    const templates = await InterviewTemplate.find({
      $or: [
        { createdBy: userId },
        { isDefault: true }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      templates
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new template
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

    const templateData = await request.json();

    // Validate required fields
    if (!templateData.name || !templateData.skills || templateData.skills.length === 0) {
      return NextResponse.json(
        { message: 'Template name and at least one skill are required' },
        { status: 400 }
      );
    }

    // Create new template
    const template = new InterviewTemplate({
      ...templateData,
      createdBy: userId
    });

    await template.save();

    return NextResponse.json({
      message: 'Template created successfully',
      template
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
