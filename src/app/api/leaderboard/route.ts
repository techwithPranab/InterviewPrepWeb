import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all-time'; // all-time, month, week
    const skill = searchParams.get('skill') || null;

    // Calculate date filter
    let dateFilter = {};
    const now = new Date();
    
    if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { completedAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { completedAt: { $gte: monthAgo } };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          status: 'completed',
          ...dateFilter,
          ...(skill ? { skills: skill } : {})
        }
      },
      {
        $group: {
          _id: '$userId',
          totalInterviews: { $sum: 1 },
          averageScore: { $avg: '$overallEvaluation.overallScore' },
          totalQuestions: { $sum: { $size: '$questions' } },
          lastInterviewDate: { $max: '$completedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalInterviews: 1,
          averageScore: { $round: ['$averageScore', 2] },
          totalQuestions: 1,
          lastInterviewDate: 1
        }
      },
      {
        $sort: { averageScore: -1, totalInterviews: -1 }
      },
      {
        $limit: 100
      }
    ];

    const leaderboard = await InterviewSession.aggregate(pipeline);

    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      // Mask email for privacy
      email: entry.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    }));

    return NextResponse.json({
      success: true,
      leaderboard: rankedLeaderboard,
      timeframe,
      skill,
      totalUsers: rankedLeaderboard.length
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
