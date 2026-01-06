import { Router, Request, Response } from 'express';
import User from '../models/User';
import InterviewSession from '../models/InterviewSession';
import Skill from '../models/Skill';
import { authenticate, authorize } from '../middleware/auth';
import { validatePagination } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/admin/users/:id/ban
 * Ban a user (admin only)
 */
router.post(
  '/users/:id/ban',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    (user as any).isBanned = true;
    (user as any).bannedAt = new Date();
    (user as any).banReason = req.body.reason || 'No reason provided';

    await user.save();

    res.json({
      success: true,
      message: 'User banned successfully'
    });
  })
);

/**
 * POST /api/admin/users/:id/unban
 * Unban a user (admin only)
 */
router.post(
  '/users/:id/unban',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    (user as any).isBanned = false;
    (user as any).bannedAt = null;
    (user as any).banReason = null;

    await user.save();

    res.json({
      success: true,
      message: 'User unbanned successfully'
    });
  })
);

/**
 * POST /api/admin/users/:id/role
 * Change user role (admin only)
 */
router.post(
  '/users/:id/role',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body;

    if (!['candidate', 'interviewer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  })
);

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get(
  '/dashboard',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalInterviewers = await User.countDocuments({ role: 'interviewer' });
    const totalInterviews = await InterviewSession.countDocuments();
    const completedInterviews = await InterviewSession.countDocuments({ status: 'completed' });
    const totalSkills = await Skill.countDocuments();

    res.json({
      success: true,
      dashboard: {
        users: {
          total: totalUsers,
          candidates: totalCandidates,
          interviewers: totalInterviewers,
          admins: await User.countDocuments({ role: 'admin' })
        },
        interviews: {
          total: totalInterviews,
          completed: completedInterviews,
          inProgress: await InterviewSession.countDocuments({ status: 'in-progress' }),
          scheduled: await InterviewSession.countDocuments({ status: 'scheduled' })
        },
        skills: {
          total: totalSkills
        }
      }
    });
  })
);

/**
 * GET /api/admin/users
 * Get all users (admin only, with admin-specific details)
 */
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;

    const filter: any = {};
    if (role && ['candidate', 'interviewer', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .select('-password')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

/**
 * GET /api/admin/reports/user-activity
 * Get user activity report
 */
router.get(
  '/reports/user-activity',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: lastMonth }
    });

    const newUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    const interviewsLastMonth = await InterviewSession.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    res.json({
      success: true,
      report: {
        period: 'Last 30 days',
        activeUsers,
        newUsers,
        interviews: interviewsLastMonth,
        averageInterviewsPerUser: newUsers > 0 ? (interviewsLastMonth / newUsers).toFixed(2) : 0
      }
    });
  })
);

/**
 * GET /api/admin/system-logs
 * Get system logs and events
 */
router.get(
  '/system-logs',
  authenticate,
  authorize('admin'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    // This would normally query a logs collection
    // For now, return empty array as placeholder
    res.json({
      success: true,
      logs: [],
      message: 'System logs endpoint - implement with logging service'
    });
  })
);

export default router;
