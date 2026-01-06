import { Router, Request, Response } from 'express';
import User from '../models/User';
import ScheduledInterview from '../models/ScheduledInterview';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/interviewers
 * Get list of available interviewers
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const skill = req.query.skill as string;
    const availability = req.query.availability as string;

    const filter: any = { role: 'interviewer' };

    if (skill) {
      filter['skills'] = skill;
    }

    const interviewers = await User.find(filter)
      .select('name email skills photo avgRating')
      .lean();

    const formattedInterviewers = interviewers.map((interviewer: any) => ({
      id: interviewer._id,
      name: interviewer.name,
      email: interviewer.email,
      skills: interviewer.skills || [],
      photo: interviewer.photo,
      rating: interviewer.avgRating || 0
    }));

    res.json({
      success: true,
      data: formattedInterviewers
    });
  })
);

/**
 * GET /api/interviewers/stats
 * Get statistics for the authenticated interviewer
 */
router.get(
  '/stats',
  authenticate,
  authorize('interviewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const interviewerId = (req as any).user.userId;

    // Get the interviewer's completed interviews count
    const totalInterviews = await ScheduledInterview.countDocuments({
      interviewerId,
      status: 'completed'
    });

    // Get scheduled interviews count
    const scheduledInterviews = await ScheduledInterview.countDocuments({
      interviewerId,
      status: 'scheduled'
    });

    // Get completed assessments count (same as completed interviews for now)
    const completedAssessments = totalInterviews;

    // Get active candidates count (unique candidates with scheduled interviews)
    const activeCandidates = await ScheduledInterview.distinct('candidateId', {
      interviewerId,
      status: { $in: ['scheduled', 'in-progress'] }
    });

    // Get interviewer's average rating from User model
    const interviewer = await User.findById(interviewerId).select('avgRating');
    const avgRating = interviewer ? (interviewer as any).avgRating || 0 : 0;

    const stats = {
      scheduledInterviews,
      completedAssessments,
      activeCandidates: activeCandidates.length,
      avgRating: Number(avgRating.toFixed(1))
    };

    res.json({
      success: true,
      stats
    });
  })
);

/**
 * GET /api/interviewers/scheduled-interviews
 * Get scheduled interviews for the authenticated interviewer
 */
router.get(
  '/scheduled-interviews',
  authenticate,
  authorize('interviewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const interviewerId = (req as any).user.userId;
    const { sortBy = 'scheduledAt', sortOrder = 'desc', status } = req.query;

    const filter: any = { interviewerId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const interviews = await ScheduledInterview.find(filter)
      .populate('candidateId', 'firstName lastName email')
      .populate('interviewerId', 'firstName lastName email')
      .sort(sortOptions)
      .lean();

    const formattedInterviews = interviews.map((interview: any) => ({
      id: interview._id,
      candidate: {
        id: interview.candidateId?._id,
        name: `${interview.candidateId?.firstName} ${interview.candidateId?.lastName}`,
        email: interview.candidateId?.email
      },
      interviewer: {
        id: interview.interviewerId?._id,
        name: `${interview.interviewerId?.firstName} ${interview.interviewerId?.lastName}`,
        email: interview.interviewerId?.email
      },
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      status: interview.status,
      meetingLink: interview.meetingLink,
      notes: interview.notes,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt
    }));

    res.json({
      success: true,
      interviews: formattedInterviews
    });
  })
);

/**
 * GET /api/interviewers/:id
 * Get interviewer profile with detailed information
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interviewer = await User.findById(req.params.id)
      .select('-password');

    if (!interviewer || interviewer.role !== 'interviewer') {
      return res.status(404).json({
        success: false,
        message: 'Interviewer not found'
      });
    }

    res.json({
      success: true,
      interviewer: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        bio: (interviewer as any).bio || '',
        skills: interviewer.skills || [],
        phone: (interviewer as any).phone || '',
        photo: interviewer.photo,
        avgRating: (interviewer as any).avgRating || 0,
        totalInterviews: (interviewer as any).totalInterviews || 0,
        createdAt: interviewer.createdAt
      }
    });
  })
);

/**
 * PUT /api/interviewers/profile
 * Update interviewer profile (interviewers only)
 */
router.put(
  '/profile',
  authenticate,
  authorize('interviewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { bio, phone, skills } = req.body;

    const interviewer = await User.findById(userId);

    if (!interviewer) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (bio) (interviewer as any).bio = bio;
    if (phone) (interviewer as any).phone = phone;
    if (skills && Array.isArray(skills)) interviewer.skills = skills;

    await interviewer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      interviewer: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        bio: (interviewer as any).bio,
        skills: interviewer.skills,
        phone: (interviewer as any).phone
      }
    });
  })
);

/**
 * GET /api/interviewers/availability/:id
 * Get availability slots for an interviewer
 */
router.get(
  '/availability/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interviewer = await User.findById(req.params.id);

    if (!interviewer || interviewer.role !== 'interviewer') {
      return res.status(404).json({
        success: false,
        message: 'Interviewer not found'
      });
    }

    // Mock availability slots - would come from a scheduling service
    const availabilitySlots = [
      {
        date: new Date(Date.now() + 86400000),
        slots: ['09:00-10:00', '10:30-11:30', '14:00-15:00', '15:30-16:30']
      },
      {
        date: new Date(Date.now() + 172800000),
        slots: ['10:00-11:00', '13:00-14:00', '16:00-17:00']
      },
      {
        date: new Date(Date.now() + 259200000),
        slots: ['09:30-10:30', '11:00-12:00', '14:30-15:30']
      }
    ];

    res.json({
      success: true,
      interviewerId: req.params.id,
      availabilitySlots
    });
  })
);

/**
 * GET /api/interviewers/:id/ratings
 * Get rating summary for an interviewer
 */
router.get(
  '/:id/ratings',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interviewer = await User.findById(req.params.id);

    if (!interviewer || interviewer.role !== 'interviewer') {
      return res.status(404).json({
        success: false,
        message: 'Interviewer not found'
      });
    }

    // Mock rating data - would come from reviews collection
    const ratingData = {
      avgRating: (interviewer as any).avgRating || 4.5,
      totalRatings: (interviewer as any).totalRatings || 0,
      ratingBreakdown: {
        5: Math.floor(((interviewer as any).avgRating || 4.5) * 20),
        4: Math.floor(((interviewer as any).avgRating || 4.5) * 15),
        3: Math.floor(((interviewer as any).avgRating || 4.5) * 8),
        2: Math.floor(((interviewer as any).avgRating || 4.5) * 4),
        1: Math.floor(((interviewer as any).avgRating || 4.5) * 2)
      },
      recentReviews: []
    };

    res.json({
      success: true,
      ratingData
    });
  })
);

/**
 * POST /api/interviewers/:id/rate
 * Rate an interviewer (must have completed interview with them)
 */
router.post(
  '/:id/rate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const userId = (req as any).user?.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const interviewer = await User.findById(req.params.id);

    if (!interviewer || interviewer.role !== 'interviewer') {
      return res.status(404).json({
        success: false,
        message: 'Interviewer not found'
      });
    }

    // In a real system, this would create a Review document
    // and update the interviewer's average rating
    (interviewer as any).totalRatings = ((interviewer as any).totalRatings || 0) + 1;
    const currentAvg = (interviewer as any).avgRating || 0;
    (interviewer as any).avgRating = (currentAvg + rating) / 2;

    await interviewer.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      newAvgRating: (interviewer as any).avgRating
    });
  })
);

/**
 * GET /api/interviewers/:id/interview-history
 * Get interview history with an interviewer (interviewers only see their own)
 */
router.get(
  '/:id/interview-history',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const requestedId = req.params.id;

    // Interviewers can only see their own history
    // Candidates can't see interviewer's history
    if ((req as any).user?.role === 'interviewer' && userId !== requestedId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Mock interview history - would query InterviewSession collection
    const history = [
      {
        id: '1',
        candidateName: 'John Doe',
        skill: 'React',
        date: new Date(Date.now() - 86400000),
        duration: 45,
        score: 85
      },
      {
        id: '2',
        candidateName: 'Jane Smith',
        skill: 'Node.js',
        date: new Date(Date.now() - 172800000),
        duration: 60,
        score: 92
      }
    ];

    res.json({
      success: true,
      interviewHistory: history
    });
  })
);

export default router;
