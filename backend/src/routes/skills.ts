import { Router, Request, Response } from 'express';
import Skill from '../models/Skill';
import { authenticate, authorize } from '../middleware/auth';
import { validateSkill, validatePagination } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/skills
 * Get all skills with pagination
 */
router.get(
  '/',
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
      data: skills,
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
 * GET /api/skills/categories
 * Get all skill categories
 */
router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await Skill.distinct('category');

    res.json({
      success: true,
      categories
    });
  })
);

/**
 * GET /api/skills/:id
 * Get skill by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      skill
    });
  })
);

/**
 * POST /api/skills
 * Create new skill (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateSkill,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, category, description, level, icon } = req.body;

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
      level,
      icon
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
 * PUT /api/skills/:id
 * Update skill (admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, level, icon, difficulty } = req.body;

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Update fields
    if (name) skill.name = name;
    if (description) skill.description = description;
    if (level) skill.level = level;
    if (icon) skill.icon = icon;
    if (difficulty !== undefined) skill.difficulty = difficulty;

    await skill.save();

    res.json({
      success: true,
      message: 'Skill updated successfully',
      skill
    });
  })
);

/**
 * DELETE /api/skills/:id
 * Delete skill (admin only)
 */
router.delete(
  '/:id',
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
 * GET /api/skills/:id/questions
 * Get questions for a skill
 */
router.get(
  '/:id/questions',
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Note: This would need to be implemented with QuestionBank model
    // This is a placeholder showing the pattern
    res.json({
      success: true,
      message: 'Skill questions endpoint - implement with QuestionBank model',
      skill: skill.name,
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    });
  })
);

export default router;
