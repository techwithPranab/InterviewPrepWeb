import { Router, Request, Response } from 'express';
import ScheduledInterview from '../models/ScheduledInterview';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { validatePagination } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import EmailService from '../services/emailService';

const router = Router();

/**
 * POST /api/scheduled-interviews
 * Schedule a new interview
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      interviewerId,
      title,
      description,
      candidateName,
      candidateEmail,
      candidatePhone,
      skills,
      scheduledAt,
      duration,
      registrationLink
    } = req.body;

    const userId = (req as any).user?.userId;

    // Validate required fields
    if (!title || !candidateName || !candidateEmail || !scheduledAt || !skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if interviewer exists
    if (interviewerId) {
      const interviewer = await User.findById(interviewerId);
      if (!interviewer || interviewer.role !== 'interviewer') {
        return res.status(404).json({
          success: false,
          message: 'Interviewer not found'
        });
      }
    }

    const newInterview = new ScheduledInterview({
      userId,
      interviewerId,
      title,
      description,
      candidateName,
      candidateEmail,
      candidatePhone,
      skills,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      registrationLink,
      status: 'scheduled'
    });

    await newInterview.save();

    // Send confirmation email to candidate
    try {
      await EmailService.sendEmail({
        to: candidateEmail,
        subject: `Interview Scheduled: ${title}`,
        html: `
          <h2>Interview Scheduled</h2>
          <p>Your interview has been scheduled for ${new Date(scheduledAt).toLocaleString()}</p>
          <p>Title: ${title}</p>
          <p>Duration: ${duration || 60} minutes</p>
          <p>Skills: ${skills.join(', ')}</p>
          ${registrationLink ? `<p><a href="${registrationLink}">Join Interview</a></p>` : ''}
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: {
        id: newInterview._id,
        title: newInterview.title,
        scheduledAt: newInterview.scheduledAt,
        status: newInterview.status
      }
    });
  })
);

/**
 * GET /api/scheduled-interviews
 * Get scheduled interviews (list based on user role)
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    let filter: any = {};

    // Filter based on user role
    if (userRole === 'candidate') {
      filter.userId = userId;
    } else if (userRole === 'interviewer') {
      filter.interviewerId = userId;
    }
    // Admin can see all

    if (status && ['scheduled', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const interviews = await ScheduledInterview.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ scheduledAt: -1 })
      .populate('userId', 'name email')
      .populate('interviewerId', 'name email');

    const total = await ScheduledInterview.countDocuments(filter);

    res.json({
      success: true,
      data: interviews,
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
 * GET /api/scheduled-interviews/:id
 * Get interview details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interview = await ScheduledInterview.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('interviewerId', 'name email skills avgRating');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check authorization
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (userRole === 'candidate' && interview.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (userRole === 'interviewer' && interview.interviewerId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      interview
    });
  })
);

/**
 * PUT /api/scheduled-interviews/:id
 * Update interview details (before confirmation)
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interview = await ScheduledInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only candidate who scheduled it can update (and only if not confirmed/completed)
    const userId = (req as any).user?.userId;
    if (interview.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Can only update scheduled interviews'
      });
    }

    const { title, description, scheduledAt, duration, registrationLink } = req.body;

    if (title) interview.title = title;
    if (description) interview.description = description;
    if (scheduledAt) interview.scheduledAt = new Date(scheduledAt);
    if (duration) interview.duration = duration;
    if (registrationLink) interview.registrationLink = registrationLink;

    await interview.save();

    res.json({
      success: true,
      message: 'Interview updated successfully',
      interview
    });
  })
);

/**
 * POST /api/scheduled-interviews/:id/confirm
 * Confirm interview (interviewer confirms)
 */
router.post(
  '/:id/confirm',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interview = await ScheduledInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only assigned interviewer can confirm
    const userId = (req as any).user?.userId;
    if (interview.interviewerId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Interview is not in scheduled status'
      });
    }

    interview.status = 'confirmed';
    await interview.save();

    // Send confirmation to candidate
    try {
      await EmailService.sendEmail({
        to: interview.candidateEmail,
        subject: `Interview Confirmed: ${interview.title}`,
        html: `
          <h2>Interview Confirmed</h2>
          <p>Your interview has been confirmed for ${interview.scheduledAt.toLocaleString()}</p>
          <p>Interviewer: ${(interview as any).interviewerId?.name}</p>
          ${interview.meetingLink ? `<p><a href="${interview.meetingLink}">Join Meeting</a></p>` : ''}
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
    }

    res.json({
      success: true,
      message: 'Interview confirmed successfully',
      interview
    });
  })
);

/**
 * POST /api/scheduled-interviews/:id/cancel
 * Cancel interview
 */
router.post(
  '/:id/cancel',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interview = await ScheduledInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only the person who scheduled it or the interviewer can cancel
    const userId = (req as any).user?.userId;
    if (interview.userId.toString() !== userId && interview.interviewerId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status === 'completed' || interview.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed or already cancelled interview'
      });
    }

    interview.status = 'cancelled';
    interview.notes = req.body.reason || interview.notes;
    await interview.save();

    // Notify both parties
    try {
      await EmailService.sendEmail({
        to: interview.candidateEmail,
        subject: `Interview Cancelled: ${interview.title}`,
        html: `
          <h2>Interview Cancelled</h2>
          <p>Your interview scheduled for ${interview.scheduledAt.toLocaleString()} has been cancelled.</p>
          ${req.body.reason ? `<p>Reason: ${req.body.reason}</p>` : ''}
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
    }

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      interview
    });
  })
);

/**
 * POST /api/scheduled-interviews/:id/start
 * Mark interview as in progress (interviewer starts the interview)
 */
router.post(
  '/:id/start',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interview = await ScheduledInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only the assigned interviewer can start
    const userId = (req as any).user?.userId;
    if (interview.interviewerId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Interview must be confirmed to start'
      });
    }

    // Update meeting link if provided
    if (req.body.meetingLink) {
      interview.meetingLink = req.body.meetingLink;
    }

    // Store actual start time by tracking in a separate field
    (interview as any).actualStartTime = new Date();

    await interview.save();

    res.json({
      success: true,
      message: 'Interview started',
      interview
    });
  })
);

/**
 * POST /api/scheduled-interviews/:id/complete
 * Complete interview and save feedback/notes
 */
router.post(
  '/:id/complete',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interview = await ScheduledInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only the assigned interviewer can complete
    const userId = (req as any).user?.userId;
    if (interview.interviewerId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Interview must be confirmed to complete'
      });
    }

    interview.status = 'completed';
    interview.notes = req.body.notes || interview.notes;
    (interview as any).actualEndTime = new Date();

    await interview.save();

    // Send completion email
    try {
      await EmailService.sendEmail({
        to: interview.candidateEmail,
        subject: `Interview Completed: ${interview.title}`,
        html: `
          <h2>Interview Completed</h2>
          <p>Your interview on ${interview.scheduledAt.toLocaleString()} has been completed.</p>
          <p>Thank you for participating!</p>
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
    }

    res.json({
      success: true,
      message: 'Interview completed successfully',
      interview
    });
  })
);

/**
 * GET /api/scheduled-interviews/availability/:interviewerId
 * Get available time slots for an interviewer
 */
router.get(
  '/availability/:interviewerId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const interviewer = await User.findById(req.params.interviewerId);

    if (!interviewer || interviewer.role !== 'interviewer') {
      return res.status(404).json({
        success: false,
        message: 'Interviewer not found'
      });
    }

    // Get interviewer's scheduled interviews
    const scheduledInterviews = await ScheduledInterview.find({
      interviewerId: req.params.interviewerId,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Mock availability - in real system would check calendar/availability settings
    const availabilitySlots = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const slots = [
        '09:00-10:00',
        '10:30-11:30',
        '13:00-14:00',
        '14:30-15:30',
        '16:00-17:00'
      ];

      // Remove slots that conflict with scheduled interviews
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayScheduled = scheduledInterviews.filter(
        (int) => int.scheduledAt >= dayStart && int.scheduledAt < dayEnd
      );

      const availableSlots = slots.filter((slot) => {
        const [start] = slot.split('-');
        const [hours, mins] = start.split(':');
        const slotTime = new Date(date);
        slotTime.setHours(parseInt(hours), parseInt(mins), 0, 0);

        return !dayScheduled.some(
          (int) =>
            slotTime >= int.scheduledAt &&
            slotTime < new Date(int.scheduledAt.getTime() + int.duration * 60000)
        );
      });

      if (availableSlots.length > 0) {
        availabilitySlots.push({
          date: date.toISOString().split('T')[0],
          slots: availableSlots
        });
      }
    }

    res.json({
      success: true,
      interviewerId: req.params.interviewerId,
      availabilitySlots
    });
  })
);

export default router;
