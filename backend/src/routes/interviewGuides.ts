import { Router, Request, Response } from 'express';
import InterviewGuide from '../models/InterviewGuide';
import { authenticate, authorize } from '../middleware/auth';
import { validateInterviewGuide, validatePagination } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/interview-guides
 * Create interview guide (admin/teacher only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateInterviewGuide,
  asyncHandler(async (req: any, res: Response) => {
    const { title, description, domain, technology, difficulty, questions, tags } = req.body;

    const guide = new InterviewGuide({
      title,
      description,
      domain,
      technology,
      difficulty,
      questions,
      tags,
      createdBy: req.user.userId,
      isPublished: false
    });

    await guide.save();

    res.status(201).json({
      success: true,
      message: 'Interview guide created successfully',
      guide
    });
  })
);

/**
 * GET /api/interview-guides
 * Get all interview guides (with filters)
 */
router.get(
  '/',
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;
    const domain = req.query.domain as string;
    const technology = req.query.technology as string;
    const difficulty = req.query.difficulty as string;
    const search = req.query.search as string;

    // Build filter
    const filter: any = { isPublished: true };

    if (domain) filter.domain = domain;
    if (technology) filter.technology = technology;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const guides = await InterviewGuide.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    const total = await InterviewGuide.countDocuments(filter);

    res.json({
      success: true,
      data: guides,
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
 * GET /api/interview-guides/:id
 * Get interview guide details
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const guide = await InterviewGuide.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    if (!guide.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'This guide is not yet published'
      });
    }

    // Increment view count
    guide.views = (guide.views || 0) + 1;
    await guide.save();

    res.json({
      success: true,
      guide
    });
  })
);

/**
 * PUT /api/interview-guides/:id
 * Update interview guide (creator or admin)
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { title, description, domain, technology, difficulty, questions, tags } = req.body;

    const guide = await InterviewGuide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    // Check authorization
    if (guide.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this guide'
      });
    }

    // Update fields
    if (title) guide.title = title;
    if (description) guide.description = description;
    if (domain) guide.domain = domain;
    if (technology) guide.technology = technology;
    if (difficulty) guide.difficulty = difficulty;
    if (questions) guide.questions = questions;
    if (tags) guide.tags = tags;

    guide.lastUpdatedBy = req.user.userId;
    guide.lastUpdatedAt = new Date();

    await guide.save();

    res.json({
      success: true,
      message: 'Interview guide updated successfully',
      guide
    });
  })
);

/**
 * POST /api/interview-guides/:id/publish
 * Publish interview guide
 */
router.post(
  '/:id/publish',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: any, res: Response) => {
    const guide = await InterviewGuide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    if (guide.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Guide is already published'
      });
    }

    guide.isPublished = true;
    guide.publishedAt = new Date();
    await guide.save();

    res.json({
      success: true,
      message: 'Interview guide published successfully',
      guide
    });
  })
);

/**
 * POST /api/interview-guides/:id/unpublish
 * Unpublish interview guide (admin only)
 */
router.post(
  '/:id/unpublish',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: any, res: Response) => {
    const guide = await InterviewGuide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    guide.isPublished = false;
    await guide.save();

    res.json({
      success: true,
      message: 'Interview guide unpublished',
      guide
    });
  })
);

/**
 * DELETE /api/interview-guides/:id
 * Delete interview guide (creator or admin)
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const guide = await InterviewGuide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    if (guide.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this guide'
      });
    }

    await InterviewGuide.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Interview guide deleted successfully'
    });
  })
);

/**
 * POST /api/interview-guides/:id/vote
 * Vote on interview guide
 */
router.post(
  '/:id/vote',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { vote } = req.body; // vote should be: 'up' or 'down'

    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be "up" or "down"'
      });
    }

    const guide = await InterviewGuide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Interview guide not found'
      });
    }

    // Check if user already voted
    const existingVote = guide.votes?.find((v: any) => v.userId?.toString() === req.user.userId);

    if (existingVote) {
      // Update existing vote
      existingVote.voteType = vote;
    } else {
      // Add new vote
      if (!guide.votes) guide.votes = [];
      guide.votes.push({
        userId: req.user.userId,
        voteType: vote,
        timestamp: new Date()
      });
    }

    await guide.save();

    const upvotes = (guide.votes || []).filter((v: any) => v.voteType === 'up').length;
    const downvotes = (guide.votes || []).filter((v: any) => v.voteType === 'down').length;

    res.json({
      success: true,
      message: 'Vote recorded',
      stats: {
        upvotes,
        downvotes,
        ratio: upvotes + downvotes > 0 ? (upvotes / (upvotes + downvotes) * 100).toFixed(2) : 0
      }
    });
  })
);

/**
 * GET /api/interview-guides/domains
 * Get all unique domains
 */
router.get(
  '/domains',
  asyncHandler(async (req: Request, res: Response) => {
    const domains = await InterviewGuide.distinct('domain', { isPublished: true });

    res.json({
      success: true,
      domains
    });
  })
);

/**
 * GET /api/interview-guides/technologies/:domain
 * Get technologies for a domain
 */
router.get(
  '/technologies/:domain',
  asyncHandler(async (req: Request, res: Response) => {
    const technologies = await InterviewGuide.distinct('technology', {
      domain: req.params.domain,
      isPublished: true
    });

    res.json({
      success: true,
      technologies
    });
  })
);

export default router;
