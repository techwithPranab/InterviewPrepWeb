import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { verifyToken } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify user authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.decoded?.userId;
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');

    // Get user's performance data
    const userQuery: any = { userId, status: 'completed' };
    if (skill) {
      userQuery.skills = skill;
    }

    const userInterviews = await InterviewSession.find(userQuery).lean();

    if (userInterviews.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          userStats: {
            totalInterviews: 0,
            averageScore: 0,
            scoreDistribution: [],
          },
          industryBenchmark: {
            averageScore: 0,
            percentile: 0,
            totalParticipants: 0,
          },
          skillComparison: [],
          progressTrend: [],
        },
      });
    }

    // Calculate user stats
    const userScores = userInterviews
      .map(i => (i as any).evaluation?.overallScore)
      .filter((score: any) => score !== undefined && score !== null);

    const userAvgScore = userScores.length > 0
      ? userScores.reduce((a: number, b: number) => a + b, 0) / userScores.length
      : 0;

    // Get industry benchmark data (all users)
    const industryQuery: any = { status: 'completed' };
    if (skill) {
      industryQuery.skills = skill;
    }

    const allInterviews = await InterviewSession.aggregate([
      { $match: industryQuery },
      {
        $group: {
          _id: null,
          scores: { $push: '$evaluation.overallScore' },
          totalInterviews: { $sum: 1 },
        },
      },
    ]);

    let industryAvgScore = 0;
    let percentile = 0;
    let totalParticipants = 0;

    if (allInterviews.length > 0) {
      const industryScores = allInterviews[0].scores.filter((s: any) => s !== undefined && s !== null);
      totalParticipants = allInterviews[0].totalInterviews;

      if (industryScores.length > 0) {
        industryAvgScore = industryScores.reduce((a: number, b: number) => a + b, 0) / industryScores.length;

        // Calculate percentile
        const scoresBelow = industryScores.filter((s: number) => s < userAvgScore).length;
        percentile = Math.round((scoresBelow / industryScores.length) * 100);
      }
    }

    // Score distribution
    const scoreRanges = [
      { label: '0-2', min: 0, max: 2, count: 0 },
      { label: '3-4', min: 3, max: 4, count: 0 },
      { label: '5-6', min: 5, max: 6, count: 0 },
      { label: '7-8', min: 7, max: 8, count: 0 },
      { label: '9-10', min: 9, max: 10, count: 0 },
    ];

    userScores.forEach((score: number) => {
      const range = scoreRanges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    // Skill comparison
    const skillComparison = await InterviewSession.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
        },
      },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          averageScore: { $avg: '$evaluation.overallScore' },
          count: { $sum: 1 },
        },
      },
      { $sort: { averageScore: -1 } },
      { $limit: 10 },
    ]);

    // Progress trend (last 10 interviews)
    const progressTrend = userInterviews
      .sort((a: any, b: any) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .slice(-10)
      .map((interview: any) => ({
        date: new Date(interview.startedAt).toLocaleDateString(),
        score: interview.evaluation?.overallScore || 0,
      }));

    return NextResponse.json({
      success: true,
      analytics: {
        userStats: {
          totalInterviews: userInterviews.length,
          averageScore: Math.round(userAvgScore * 10) / 10,
          scoreDistribution: scoreRanges,
        },
        industryBenchmark: {
          averageScore: Math.round(industryAvgScore * 10) / 10,
          percentile,
          totalParticipants,
        },
        skillComparison: skillComparison.map((item: any) => ({
          skill: item._id,
          averageScore: Math.round(item.averageScore * 10) / 10,
          interviewCount: item.count,
        })),
        progressTrend,
      },
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
