import { Router, Request, Response } from 'express';
import User from '../models/User';
import InterviewSession from '../models/InterviewSession';
import Skill from '../models/Skill';
import InterviewGuide from '../models/InterviewGuide';
import SystemSettings from '../models/SystemSettings';
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
 * POST /api/admin/users
 * Create new user (admin only)
 */
router.post(
  '/users',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, role, isActive } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Validate role
    if (!['candidate', 'interviewer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be candidate, interviewer, or admin'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate a temporary password (user should change it on first login)
    const tempPassword = Math.random().toString(36).slice(-8) + 'Temp123!';

    const user = new User({
      firstName,
      lastName,
      email,
      password: tempPassword, // Will be hashed by pre-save middleware
      role,
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse,
      tempPassword // Admin should communicate this to the user
    });
  })
);

/**
 * PUT /api/admin/users/:id
 * Update user (admin only)
 */
router.put(
  '/users/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate role if provided
    if (role && !['candidate', 'interviewer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be candidate, interviewer, or admin'
      });
    }

    // Check email uniqueness if email is being changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userResponse
    });
  })
);

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin only)
 */
router.delete(
  '/users/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
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

/**
 * GET /api/admin/interview-guides
 * Get all interview guides (admin can see unpublished too)
 */
router.get(
  '/interview-guides',
  authenticate,
  authorize('admin'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;
    const domain = req.query.domain as string;
    const technology = req.query.technology as string;
    const difficulty = req.query.difficulty as string;
    const isPublished = req.query.isPublished as string;

    // Build filter - admin can see all guides
    const filter: any = {};

    if (domain) filter.domain = domain;
    if (technology) filter.technology = technology;
    if (difficulty) filter.difficulty = difficulty;
    if (isPublished !== undefined && isPublished !== '') {
      filter.isPublished = isPublished === 'true';
    }

    const guides = await InterviewGuide.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email');

    const total = await InterviewGuide.countDocuments(filter);

    res.json({
      success: true,
      data: {
        guides,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * GET /api/admin/interview-guides/stats
 * Get interview guides statistics
 */
router.get(
  '/interview-guides/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const total = await InterviewGuide.countDocuments();
    const published = await InterviewGuide.countDocuments({ isPublished: true });
    const draft = await InterviewGuide.countDocuments({ isPublished: false });
    
    // Get total views across all guides
    const viewsResult = await InterviewGuide.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    res.json({
      success: true,
      data: {
        total,
        published,
        draft,
        totalViews
      }
    });
  })
);

/**
 * GET /api/admin/interview-guides/:id
 * Get single interview guide details (admin)
 */
router.get(
  '/interview-guides/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const guide = await InterviewGuide.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    res.json({
      success: true,
      data: guide
    });
  })
);

/**
 * PUT /api/admin/interview-guides/:id
 * Update interview guide (admin)
 */
router.put(
  '/interview-guides/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, domain, technology, difficulty, questions, tags, isPublished } = req.body;

    const guide = await InterviewGuide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    // Update fields
    if (title !== undefined) guide.title = title;
    if (description !== undefined) guide.description = description;
    if (domain !== undefined) guide.domain = domain;
    if (technology !== undefined) guide.technology = technology;
    if (difficulty !== undefined) guide.difficulty = difficulty;
    if (questions !== undefined) guide.questions = questions;
    if (tags !== undefined) guide.tags = tags;
    if (isPublished !== undefined) guide.isPublished = isPublished;

    await guide.save();

    res.json({
      success: true,
      message: 'Interview guide updated successfully',
      data: guide
    });
  })
);

/**
 * DELETE /api/admin/interview-guides/:id
 * Delete interview guide
 */
router.delete(
  '/interview-guides/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const guide = await InterviewGuide.findByIdAndDelete(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview guide deleted successfully'
    });
  })
);

/**
 * GET /api/admin/skills
 * Get all skills (admin view with full details)
 */
router.get(
  '/skills',
  authenticate,
  authorize('admin'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;

    // Build filter
    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Skill.countDocuments(filter);

    res.json({
      success: true,
      data: {
        skills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * POST /api/admin/skills
 * Create new skill
 */
router.post(
  '/skills',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, category, description, isActive } = req.body;

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    const skill = new Skill({
      name,
      category,
      description,
      isActive: isActive !== undefined ? isActive : true
    });

    await skill.save();

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill
    });
  })
);

/**
 * PUT /api/admin/skills/:id
 * Update skill
 */
router.put(
  '/skills/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, category, description, isActive } = req.body;

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Update fields
    if (name) skill.name = name;
    if (category) skill.category = category;
    if (description !== undefined) skill.description = description;
    if (isActive !== undefined) skill.isActive = isActive;

    await skill.save();

    res.json({
      success: true,
      message: 'Skill updated successfully',
      skill
    });
  })
);

/**
 * DELETE /api/admin/skills/:id
 * Delete skill
 */
router.delete(
  '/skills/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  })
);

/**
 * GET /api/admin/analytics
 * Get analytics data for admin dashboard
 */
router.get(
  '/analytics',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    // Get current date and date from 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalSessions = await InterviewSession.countDocuments();
    const totalQuestions = await InterviewGuide.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$questions' } } } }
    ]);
    const totalQuestionsCount = totalQuestions.length > 0 ? totalQuestions[0].total : 0;

    // Get active users today (users who logged in today)
    const activeUsersToday = await User.countDocuments({
      lastLogin: { $gte: today }
    });

    // Calculate growth percentages (comparing last 30 days to previous 30 days)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const usersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const usersPrevious30Days = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const userGrowth = usersPrevious30Days > 0 ?
      ((usersLast30Days - usersPrevious30Days) / usersPrevious30Days * 100) : 0;

    const sessionsLast30Days = await InterviewSession.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const sessionsPrevious30Days = await InterviewSession.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const sessionGrowth = sessionsPrevious30Days > 0 ?
      ((sessionsLast30Days - sessionsPrevious30Days) / sessionsPrevious30Days * 100) : 0;

    // For questions growth, we'll use interview guides created in last 30 days
    const guidesLast30Days = await InterviewGuide.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const guidesPrevious30Days = await InterviewGuide.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const questionGrowth = guidesPrevious30Days > 0 ?
      ((guidesLast30Days - guidesPrevious30Days) / guidesPrevious30Days * 100) : 0;

    // Active users growth (simplified - using login activity)
    const activeUsersLast30Days = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });
    const activeUsersPrevious30Days = await User.countDocuments({
      lastLogin: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const activeUsersGrowth = activeUsersPrevious30Days > 0 ?
      ((activeUsersLast30Days - activeUsersPrevious30Days) / activeUsersPrevious30Days * 100) : 0;

    // Generate monthly stats for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthUsers = await User.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      const monthSessions = await InterviewSession.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      const monthQuestions = await InterviewGuide.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: null, total: { $sum: { $size: '$questions' } } } }
      ]);
      const monthQuestionsCount = monthQuestions.length > 0 ? monthQuestions[0].total : 0;

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: monthUsers,
        sessions: monthSessions,
        questions: monthQuestionsCount
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSessions,
        totalQuestions: totalQuestionsCount,
        activeUsersToday,
        userGrowth: Math.round(userGrowth * 100) / 100,
        sessionGrowth: Math.round(sessionGrowth * 100) / 100,
        questionGrowth: Math.round(questionGrowth * 100) / 100,
        activeUsersGrowth: Math.round(activeUsersGrowth * 100) / 100,
        monthlyStats
      }
    });
  })
);

/**
 * GET /api/admin/interviewees
 * Get all interviewees (candidates) with their interview history and performance data
 */
router.get(
  '/interviewees',
  authenticate,
  authorize('admin'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const skill = req.query.skill as string;
    const status = req.query.status as string;
    const experience = req.query.experience as string;

    // Build filter for candidates only
    const filter: any = { role: 'candidate' };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (skill) {
      filter['profile.skills'] = { $in: [skill] };
    }

    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    if (experience && experience !== 'all') {
      filter['profile.experience'] = experience;
    }

    const candidates = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .select('-password')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    // For each candidate, get their interview sessions and calculate performance stats
    const interviewees = await Promise.all(candidates.map(async (candidate) => {
      const sessions = await InterviewSession.find({ candidate: candidate._id })
        .sort({ completedAt: -1 });

      // Calculate performance stats
      const completedSessions = sessions.filter(session => 
        session.status === 'completed' && session.overallEvaluation
      );

      const totalInterviews = sessions.length;
      const completedInterviews = completedSessions.length;
      
      // Calculate average score from completed sessions with evaluations
      let averageScore = 0;
      let improvementTrend = 'stable';

      if (completedSessions.length > 0) {
        const scores = completedSessions.map(session => 
          session.overallEvaluation?.averageScore || session.overallEvaluation?.totalScore || 0
        );
        averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        // Calculate improvement trend (compare last 2 sessions)
        if (scores.length >= 2) {
          const recentScore = scores[0];
          const previousScore = scores[1];
          if (recentScore > previousScore) {
            improvementTrend = 'up';
          } else if (recentScore < previousScore) {
            improvementTrend = 'down';
          }
        }
      }

      const lastInterviewDate = completedSessions.length > 0 
        ? completedSessions[0].completedAt 
        : undefined;

      return {
        profile: candidate.toObject(),
        sessions: sessions.map(session => ({
          _id: session._id,
          title: session.title,
          type: session.type,
          difficulty: session.difficulty,
          skills: session.skills,
          status: session.status,
          completedAt: session.completedAt,
          overallEvaluation: session.overallEvaluation
        })),
        stats: {
          totalInterviews,
          averageScore: Math.round(averageScore),
          completedInterviews,
          lastInterviewDate,
          improvementTrend
        }
      };
    }));

    res.json({
      success: true,
      data: {
        interviewees,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * GET /api/admin/interviewees/:id
 * Get detailed information about a specific interviewee
 */
router.get(
  '/interviewees/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const candidate = await User.findById(req.params.id).select('-password');

    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({
        success: false,
        message: 'Interviewee not found'
      });
    }

    // Get all interview sessions for this candidate
    const sessions = await InterviewSession.find({ candidate: candidate._id })
      .populate('interviewer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate detailed performance analytics
    const completedSessions = sessions.filter(session => 
      session.status === 'completed' && session.overallEvaluation
    );

    let performanceAnalytics = {
      skillPerformance: {} as { [key: string]: number },
      difficultyPerformance: {} as { [key: string]: number },
      timeBasedTrends: [] as Array<{ month: string; averageScore: number; sessionCount: number }>,
      criteriaBreakdown: {
        technical_accuracy: 0,
        communication: 0,
        problem_solving: 0,
        confidence: 0
      },
      strengths: [] as string[],
      areasForImprovement: [] as string[]
    };

    if (completedSessions.length > 0) {
      // Skill-wise performance
      const skillScores: { [key: string]: number[] } = {};
      completedSessions.forEach(session => {
        session.skills.forEach(skill => {
          if (!skillScores[skill]) skillScores[skill] = [];
          skillScores[skill].push(session.overallEvaluation?.averageScore || session.overallEvaluation?.totalScore || 0);
        });
      });

      Object.keys(skillScores).forEach(skill => {
        performanceAnalytics.skillPerformance[skill] = 
          skillScores[skill].reduce((sum, score) => sum + score, 0) / skillScores[skill].length;
      });

      // Difficulty-wise performance
      const difficultyScores: { [key: string]: number[] } = {};
      completedSessions.forEach(session => {
        const difficulty = session.difficulty;
        if (!difficultyScores[difficulty]) difficultyScores[difficulty] = [];
        difficultyScores[difficulty].push(session.overallEvaluation?.averageScore || session.overallEvaluation?.totalScore || 0);
      });

      Object.keys(difficultyScores).forEach(difficulty => {
        performanceAnalytics.difficultyPerformance[difficulty] = 
          difficultyScores[difficulty].reduce((sum, score) => sum + score, 0) / difficultyScores[difficulty].length;
      });

      // Average criteria breakdown - simplified approach
      const totalSessions = completedSessions.length;
      let techSum = 0, commSum = 0, probSum = 0, confSum = 0;

      completedSessions.forEach(session => {
        // Use overall score for all criteria if detailed breakdown not available
        const score = session.overallEvaluation?.averageScore || session.overallEvaluation?.totalScore || 0;
        techSum += score;
        commSum += score;
        probSum += score;
        confSum += score;
      });

      performanceAnalytics.criteriaBreakdown = {
        technical_accuracy: techSum / totalSessions,
        communication: commSum / totalSessions,
        problem_solving: probSum / totalSessions,
        confidence: confSum / totalSessions
      };

      // Collect strengths and areas for improvement
      const strengthsSet = new Set<string>();
      const improvementsSet = new Set<string>();

      completedSessions.forEach(session => {
        if (session.overallEvaluation?.strengths) {
          session.overallEvaluation.strengths.forEach(strength => strengthsSet.add(strength));
        }
        if (session.overallEvaluation?.improvements) {
          session.overallEvaluation.improvements.forEach(improvement => improvementsSet.add(improvement));
        }
      });

      performanceAnalytics.strengths = Array.from(strengthsSet);
      performanceAnalytics.areasForImprovement = Array.from(improvementsSet);

      // Time-based performance trends (last 6 months)
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthSessions = completedSessions.filter(session => 
          session.completedAt && session.completedAt >= monthStart && session.completedAt < monthEnd
        );

        if (monthSessions.length > 0) {
          const monthAverage = monthSessions.reduce((sum, session) => 
            sum + (session.overallEvaluation?.averageScore || session.overallEvaluation?.totalScore || 0), 0
          ) / monthSessions.length;

          performanceAnalytics.timeBasedTrends.push({
            month: monthStart.toISOString().substr(0, 7), // YYYY-MM format
            averageScore: Math.round(monthAverage),
            sessionCount: monthSessions.length
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        profile: candidate.toObject(),
        sessions: sessions.map(session => ({
          _id: session._id,
          title: session.title,
          type: session.type,
          difficulty: session.difficulty,
          skills: session.skills,
          status: session.status,
          createdAt: session.createdAt,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          duration: session.duration,
          interviewer: session.interviewer,
          overallEvaluation: session.overallEvaluation
        })),
        performanceAnalytics
      }
    });
  })
);

/**
 * GET /api/admin/settings
 * Get system settings (admin)
 */
router.get(
  '/settings',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    let settings = await SystemSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    res.json({
      success: true,
      data: {
        settings
      }
    });
  })
);

/**
 * PUT /api/admin/settings
 * Update system settings (admin)
 */
router.put(
  '/settings',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      siteName,
      siteDescription,
      contactEmail,
      enableRegistration,
      enableEmailNotifications,
      maxSessionsPerUser,
      sessionTimeoutMinutes,
      enableAnalytics,
      maintenanceMode
    } = req.body;

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings();
    }

    // Update fields
    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (enableRegistration !== undefined) settings.enableRegistration = enableRegistration;
    if (enableEmailNotifications !== undefined) settings.enableEmailNotifications = enableEmailNotifications;
    if (maxSessionsPerUser !== undefined) settings.maxSessionsPerUser = maxSessionsPerUser;
    if (sessionTimeoutMinutes !== undefined) settings.sessionTimeoutMinutes = sessionTimeoutMinutes;
    if (enableAnalytics !== undefined) settings.enableAnalytics = enableAnalytics;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings
      }
    });
  })
);

export default router;
