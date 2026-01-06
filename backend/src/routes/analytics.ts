import { Router, Request, Response } from 'express';
import InterviewSession from '../models/InterviewSession';
import User from '../models/User';
import InterviewGuide from '../models/InterviewGuide';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/analytics/personal
 * Get personal interview analytics for the logged-in user
 */
router.get(
  '/personal',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const interviews = await InterviewSession.find({
      userId
    });

    const completedInterviews = interviews.filter((i: any) => i.status === 'completed');
    const totalInterviews = interviews.length;
    const averageScore = completedInterviews.length > 0
      ? (completedInterviews.reduce((sum: number, i: any) => sum + ((i as any).score || 0), 0) / completedInterviews.length).toFixed(2)
      : 0;

    const interviewsBySkill: any = {};
    interviews.forEach((interview: any) => {
      if (interview.skillId) {
        interviewsBySkill[interview.skillId] = (interviewsBySkill[interview.skillId] || 0) + 1;
      }
    });

    res.json({
      success: true,
      analytics: {
        totalInterviews,
        completedInterviews: completedInterviews.length,
        inProgressInterviews: interviews.filter((i: any) => i.status === 'in-progress').length,
        averageScore,
        averageDuration: completedInterviews.length > 0
          ? (completedInterviews.reduce((sum: number, i: any) => sum + ((i as any).duration || 0), 0) / completedInterviews.length).toFixed(2)
          : 0,
        interviewsBySkill
      }
    });
  })
);

/**
 * GET /api/analytics/interviews/distribution
 * Get distribution of interviews by status
 */
router.get(
  '/interviews/distribution',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const distribution = await InterviewSession.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result: any = {
      scheduled: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };

    distribution.forEach((item: any) => {
      if (item._id in result) {
        result[item._id] = item.count;
      }
    });

    res.json({
      success: true,
      distribution: result
    });
  })
);

/**
 * GET /api/analytics/interviews/by-skill
 * Get interview statistics by skill
 */
router.get(
  '/interviews/by-skill',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const skillStats = await InterviewSession.aggregate([
      {
        $group: {
          _id: '$skillId',
          totalInterviews: { $sum: 1 },
          completedInterviews: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          averageScore: {
            $avg: '$score'
          }
        }
      },
      {
        $sort: { totalInterviews: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      skillStats
    });
  })
);

/**
 * GET /api/analytics/users/growth
 * Get user growth statistics over time
 */
router.get(
  '/users/growth',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      monthlyGrowth: userGrowth,
      roleDistribution: Object.fromEntries(
        roleDistribution.map((r: any) => [r._id, r.count])
      )
    });
  })
);

/**
 * GET /api/analytics/interview-guides/popular
 * Get most popular interview guides
 */
router.get(
  '/interview-guides/popular',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const popularGuides = await InterviewGuide.find({ published: true })
      .sort({ views: -1 })
      .limit(10)
      .select('title domain difficulty views votes')
      .lean();

    res.json({
      success: true,
      guides: popularGuides
    });
  })
);

/**
 * GET /api/analytics/engagement
 * Get platform engagement metrics
 */
router.get(
  '/engagement',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const intervieswToday = await InterviewSession.countDocuments({
      createdAt: { $gte: today }
    });

    const interviewsYesterday = await InterviewSession.countDocuments({
      createdAt: { $gte: yesterday, $lt: today }
    });

    const usersActive24h = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const totalUsersSessions = await User.countDocuments();

    res.json({
      success: true,
      engagement: {
        intervieswToday,
        interviewsYesterday,
        percentageChange: interviewsYesterday > 0
          ? (((intervieswToday - interviewsYesterday) / interviewsYesterday) * 100).toFixed(2)
          : 'N/A',
        activeUsers24h: usersActive24h,
        totalUsersSessions,
        engagementRate: totalUsersSessions > 0
          ? ((usersActive24h / totalUsersSessions) * 100).toFixed(2)
          : 0
      }
    });
  })
);

/**
 * GET /api/analytics/performance
 * Get performance metrics for the current user
 */
router.get(
  '/performance',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const interviews = await InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(20);

    const scores = interviews
      .filter((i: any) => i.status === 'completed' && i.score)
      .map((i: any) => i.score);

    const recentAverage = scores.length > 0
      ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2)
      : 0;

    const trend = scores.length >= 2
      ? scores[0] > scores[scores.length - 1] ? 'improving' : 'declining'
      : 'no-data';

    res.json({
      success: true,
      performance: {
        totalAttempts: interviews.length,
        completedAttempts: interviews.filter((i: any) => i.status === 'completed').length,
        recentAverage,
        trend,
        scores: scores.slice(0, 10)
      }
    });
  })
);

export default router;
