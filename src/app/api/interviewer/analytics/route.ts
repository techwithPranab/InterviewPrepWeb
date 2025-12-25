import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (auth as any).decoded.userId;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '90d';

    await connectDB();

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Fetch all interviews created by this interviewer within time range
    const interviews = await InterviewSession.find({
      interviewer: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Calculate analytics
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const pendingInterviews = interviews.filter(i => i.status === 'scheduled' || i.status === 'in-progress').length;
    
    const completedWithScores = interviews.filter(i => i.status === 'completed' && i.overallEvaluation?.averageScore);
    const averageRating = completedWithScores.length > 0
      ? completedWithScores.reduce((sum, interview) => sum + (interview.overallEvaluation?.averageScore || 0), 0) / completedWithScores.length
      : 0;

    // Monthly trend
    const monthlyMap = new Map<string, { total: number; completed: number }>();
    interviews.forEach(interview => {
      const monthKey = interview.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { total: 0, completed: 0 });
      }
      const current = monthlyMap.get(monthKey)!;
      current.total += 1;
      if (interview.status === 'completed') current.completed += 1;
    });

    const monthlyProgress = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        interviews: data.total,
        completed: data.completed
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top performers (candidates with highest average scores)
    const candidateMap = new Map<string, { totalScore: number; count: number; candidateName: string }>();
    interviews.forEach(interview => {
      if (interview.status === 'completed' && interview.candidate) {
        const candidateId = interview.candidate.toString();
        if (!candidateMap.has(candidateId)) {
          candidateMap.set(candidateId, { 
            totalScore: 0, 
            count: 0,
            candidateName: `Candidate ${interview.candidate.toString().slice(-6)}`
          });
        }
        const current = candidateMap.get(candidateId)!;
        current.totalScore += interview.overallEvaluation?.averageScore || 0;
        current.count += 1;
      }
    });

    const topPerformers = Array.from(candidateMap.entries())
      .map(([id, data]) => ({
        candidateId: id,
        candidateName: data.candidateName,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0,
        interviewCount: data.count
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    return NextResponse.json({
      totalInterviews,
      completedInterviews,
      pendingInterviews,
      averageRating: Math.round(averageRating * 10) / 10,
      monthlyProgress,
      topPerformers,
      completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
