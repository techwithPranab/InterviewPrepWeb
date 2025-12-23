import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

const aiService = require('@/lib/services/aiService');

// POST - Create new interview session with AI-generated questions
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
    const body = await request.json();
    
    const {
      title = 'Mock Interview Session',
      skills = [],
      duration = 30,
      difficulty = 'intermediate',
      type = 'technical',
      questionCount = 5,
      resumeContent = ''
    } = body;

    // Validate required fields
    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { message: 'At least one skill is required' },
        { status: 400 }
      );
    }

    if (questionCount < 1 || questionCount > 20) {
      return NextResponse.json(
        { message: 'Question count must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Generate AI questions
    let questions = [];
    try {
      const aiQuestions = await aiService.generateQuestions({
        skills,
        resumeContent,
        difficulty,
        questionCount,
        questionType: type,
        experience: 'intermediate'
      });

      // Format questions for the session model
      questions = aiQuestions.map((q: any, index: number) => ({
        question: q.question,
        type: type === 'mixed' ? (index % 2 === 0 ? 'technical' : 'behavioral') : type,
        difficulty,
        expectedAnswer: q.expectedAnswer || q.hints || ''
      }));
    } catch (aiError) {
      console.error('AI question generation failed:', aiError);
      // Fallback to default questions if AI fails
      questions = skills.slice(0, questionCount).map((skill: string) => ({
        question: `Explain your experience with ${skill} and provide examples of projects where you used it.`,
        type: 'technical',
        difficulty,
        expectedAnswer: `The candidate should discuss practical applications of ${skill}, specific projects, challenges faced, and solutions implemented.`
      }));
    }

    // Create interview session
    const session = await InterviewSession.create({
      candidate: userId,
      title,
      description: `${type} interview covering: ${skills.join(', ')}`,
      type,
      difficulty,
      skills,
      duration,
      status: 'in-progress',
      questions,
      startedAt: new Date()
    });

    return NextResponse.json({
      message: 'Interview session created successfully',
      session: {
        _id: session._id,
        title: session.title,
        type: session.type,
        difficulty: session.difficulty,
        skills: session.skills,
        duration: session.duration,
        questionCount: session.questions.length,
        startedAt: session.startedAt,
        questions: session.questions.map((q: any, index: number) => ({
          questionId: q.questionId,
          questionNumber: index + 1,
          question: q.question,
          type: q.type,
          difficulty: q.difficulty
        }))
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create interview session error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
