import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id: sessionId } = await params;

    // Find the interview session and make it publicly shareable
    const session = await InterviewSession.findById(sessionId)
      .select('-userId') // Don't expose user ID in public share
      .lean();

    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const answeredQuestions = session.questions.filter((q: any) => q.answer);
    const avgScore = answeredQuestions.length > 0
      ? answeredQuestions.reduce((sum: number, q: any) => sum + (q.evaluation?.score || 0), 0) / answeredQuestions.length
      : 0;

    // Return public-friendly data
    return NextResponse.json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        type: session.type,
        difficulty: session.difficulty,
        skills: session.skills,
        completedAt: session.completedAt,
        totalQuestions: session.questions.length,
        answeredQuestions: answeredQuestions.length,
        averageScore: avgScore.toFixed(1),
        overallEvaluation: session.overallEvaluation,
      }
    });

  } catch (error) {
    console.error('Error fetching shared interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared interview' },
      { status: 500 }
    );
  }
}
