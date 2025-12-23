import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

// GET - Retrieve interview session details
export async function GET(
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

    // Find session and verify ownership
    const session = await InterviewSession.findOne({
      _id: id,
      candidate: userId
    }).populate('candidate', 'firstName lastName email');

    if (!session) {
      return NextResponse.json(
        { message: 'Interview session not found' },
        { status: 404 }
      );
    }

    // Calculate progress
    const answeredQuestions = session.questions.filter((q: any) => q.answer && q.answer.text).length;
    const totalQuestions = session.questions.length;
    const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return NextResponse.json({
      session: {
        _id: session._id,
        title: session.title,
        description: session.description,
        type: session.type,
        difficulty: session.difficulty,
        skills: session.skills,
        duration: session.duration,
        status: session.status,
        questions: session.questions.map((q: any, index: number) => ({
          questionId: q.questionId,
          questionNumber: index + 1,
          question: q.question,
          type: q.type,
          difficulty: q.difficulty,
          answer: q.answer?.text || null,
          timeSpent: q.timeSpent || 0,
          evaluation: q.evaluation || null
        })),
        progress,
        answeredQuestions,
        totalQuestions,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        totalDuration: session.totalDuration,
        overallEvaluation: session.overallEvaluation || null
      }
    });

  } catch (error) {
    console.error('Get interview session error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
