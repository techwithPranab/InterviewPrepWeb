import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

const aiService = require('@/lib/services/aiService');

// POST - Submit answer and get AI evaluation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

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
      questionId,
      answer,
      timeSpent = 0
    } = body;

    // Validate required fields
    if (!questionId || !answer) {
      return NextResponse.json(
        { message: 'Question ID and answer are required' },
        { status: 400 }
      );
    }

    // Find session and verify ownership
    const session = await InterviewSession.findOne({
      _id: id,
      candidate: userId
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Interview session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { message: 'This interview session has already been completed' },
        { status: 400 }
      );
    }

    // Find the question
    const questionIndex = session.questions.findIndex(
      (q: any) => q.questionId.toString() === questionId
    );

    if (questionIndex === -1) {
      return NextResponse.json(
        { message: 'Question not found in this session' },
        { status: 404 }
      );
    }

    const question = session.questions[questionIndex];

    // Get AI evaluation
    let evaluation: any = {
      score: 5,
      feedback: 'Answer submitted successfully. Evaluation pending.',
      criteria: {
        technical_accuracy: 5,
        communication: 5,
        problem_solving: 5,
        confidence: 5
      }
    };

    try {
      const aiEvaluation = await aiService.evaluateAnswer(
        question.question,
        answer,
        question.expectedAnswer
      );

      evaluation = {
        score: aiEvaluation.overallScore || 5,
        feedback: aiEvaluation.feedback || 'Good effort!',
        criteria: {
          technical_accuracy: aiEvaluation.technicalAccuracy || 5,
          communication: aiEvaluation.communication || 5,
          problem_solving: aiEvaluation.problemSolving || 5,
          confidence: aiEvaluation.confidence || 5
        }
      };

      // Add AI analysis if available
      if (aiEvaluation.sentiment || aiEvaluation.keywords) {
        evaluation.aiAnalysis = {
          sentiment: aiEvaluation.sentiment || 'neutral',
          keywords: aiEvaluation.keywords || [],
          clarity_score: aiEvaluation.clarityScore || 5,
          confidence_level: aiEvaluation.confidenceLevel || 'medium'
        };
      }
    } catch (aiError) {
      console.error('AI evaluation failed:', aiError);
      // Continue with default evaluation
    }

    // Update the question with answer and evaluation
    session.questions[questionIndex] = {
      ...(question as any),
      answer: {
        text: answer,
        timestamp: new Date()
      },
      timeSpent,
      evaluation
    };

    await session.save();

    // Calculate session progress
    const answeredQuestions = session.questions.filter((q: any) => q.answer && q.answer.text).length;
    const totalQuestions = session.questions.length;
    const progress = Math.round((answeredQuestions / totalQuestions) * 100);

    return NextResponse.json({
      message: 'Answer submitted and evaluated successfully',
      evaluation,
      progress,
      answeredQuestions,
      totalQuestions,
      isLastQuestion: answeredQuestions === totalQuestions
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
