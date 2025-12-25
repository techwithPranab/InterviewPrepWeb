import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Achievement from '@/lib/models/Achievement';
import InterviewSession from '@/lib/models/InterviewSession';
import { AVAILABLE_BADGES } from '@/lib/utils/badges';
import { verifyToken } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.decoded.userId;

    await dbConnect();

    // Get user's earned achievements
    const earnedAchievements = await Achievement.find({ userId });

    // Get user's interview stats
    const completedInterviews = await InterviewSession.countDocuments({
      userId,
      status: 'completed'
    });

    // Check for new achievements
    const newAchievements = [];

    for (const badge of AVAILABLE_BADGES) {
      const alreadyEarned = earnedAchievements.find(a => a.badgeId === badge.id);
      
      if (!alreadyEarned) {
        let earned = false;
        let progress = 0;

        switch (badge.criteria.type) {
          case 'interviews_completed':
            progress = completedInterviews;
            earned = completedInterviews >= badge.criteria.target;
            break;

          case 'perfect_score':
            const perfectScores = await InterviewSession.countDocuments({
              userId,
              status: 'completed',
              'overallEvaluation.overallScore': { $gte: 10 }
            });
            progress = perfectScores;
            earned = perfectScores >= badge.criteria.target;
            break;

          case 'high_scores':
            const highScores = await InterviewSession.countDocuments({
              userId,
              status: 'completed',
              'overallEvaluation.overallScore': { $gte: 8 }
            });
            progress = highScores;
            earned = highScores >= badge.criteria.target;
            break;

          // Add more criteria checks as needed
        }

        if (earned) {
          const achievement = await Achievement.create({
            userId,
            badgeId: badge.id,
            badgeName: badge.name,
            badgeDescription: badge.description,
            badgeIcon: badge.icon,
            badgeCategory: badge.category,
            progress: {
              current: progress,
              target: badge.criteria.target
            }
          });
          newAchievements.push(achievement);
        }
      }
    }

    // Get all earned achievements
    const allAchievements = await Achievement.find({ userId })
      .sort({ earnedAt: -1 });

    // Get progress for unearned badges
    const unearnedBadges = AVAILABLE_BADGES.filter(
      badge => !allAchievements.find(a => a.badgeId === badge.id)
    ).map(badge => ({
      ...badge,
      progress: 0, // Simplified - would calculate actual progress
      earned: false
    }));

    return NextResponse.json({
      success: true,
      earnedAchievements: allAchievements,
      unearnedBadges,
      newAchievements,
      totalEarned: allAchievements.length,
      totalAvailable: AVAILABLE_BADGES.length
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
