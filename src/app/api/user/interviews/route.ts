import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

// GET - Get user's interview history
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
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'completed', 'in-progress', etc.
    const skill = searchParams.get('skill');
    const difficulty = searchParams.get('difficulty');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { candidate: userId };
    if (status) query.status = status;
    if (skill) query.skills = { $in: [skill] };
    if (difficulty) query.difficulty = difficulty;

    // Get sessions
    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-questions.answer -questions.evaluation'); // Exclude detailed answers for list view

    const total = await InterviewSession.countDocuments(query);

    // Calculate statistics
    const stats = await InterviewSession.aggregate([
      { $match: { candidate: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: 1 },
          avgScore: { $avg: '$overallEvaluation.averageScore' },
          totalDuration: { $sum: '$totalDuration' }
        }
      }
    ]);

    const statistics = stats.length > 0 ? {
      totalCompleted: stats[0].totalCompleted,
      averageScore: parseFloat((stats[0].avgScore || 0).toFixed(2)),
      totalHours: parseFloat((stats[0].totalDuration / 60 || 0).toFixed(1))
    } : {
      totalCompleted: 0,
      averageScore: 0,
      totalHours: 0
    };

    // Format sessions
    const formattedSessions = sessions.map((session: any) => ({
      _id: session._id,
      title: session.title,
      type: session.type,
      difficulty: session.difficulty,
      skills: session.skills,
      status: session.status,
      questionCount: session.questions.length,
      answeredCount: session.questions.filter((q: any) => q.answer && q.answer.text).length,
      averageScore: session.overallEvaluation?.averageScore || null,
      duration: session.totalDuration || session.duration,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      createdAt: session.createdAt
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      statistics
    });

  } catch (error) {
    console.error('Get user interviews error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
