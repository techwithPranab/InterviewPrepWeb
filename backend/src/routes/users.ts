import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { validateUserUpdate, validatePagination } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import fileService from '../services/fileService';
import multer from 'multer';

const router = Router();

// Configure multer for resume uploads (memory storage since we upload to Cloudinary)
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed. Please upload a PDF file.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .select('-password')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

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
 * GET /api/users/me
 * Get current authenticated user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  })
);

/**
 * PUT /api/users/me
 * Update current authenticated user profile
 */
router.put(
  '/me',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { firstName, lastName, profile } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    // Update profile fields
    if (profile) {
      if (profile.experience !== undefined) user.profile.experience = profile.experience;
      if (profile.skills !== undefined) user.profile.skills = profile.skills;
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
    }

    await user.save();

    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  })
);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  })
);

/**
 * PUT /api/users/:id
 * Update user profile
 */
router.put(
  '/:id',
  authenticate,
  validateUserUpdate,
  asyncHandler(async (req: any, res: Response) => {
    // Users can only update their own profile unless they are admin
    if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const { firstName, lastName, email, bio, profileImage } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userResponse
    });
  })
);

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete(
  '/:id',
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
 * GET /api/users/:id/interviews
 * Get user's interviews
 */
router.get(
  '/:id/interviews',
  authenticate,
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Note: Interview sessions should be retrieved from InterviewSession model
    // This is a placeholder that shows the pattern
    res.json({
      success: true,
      message: 'User interviews endpoint - implement with InterviewSession model',
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    });
  })
);

/**
 * GET /api/users/:id/skills
 * Get user's skills
 */
router.get(
  '/:id/skills',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).populate('skills');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      skills: user.skills
    });
  })
);

/**
 * POST /api/users/:id/skills
 * Add skill to user
 */
router.post(
  '/:id/skills',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    // Users can only add skills to their own profile
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own skills'
      });
    }

    const { skillId } = req.body;

    if (!skillId) {
      return res.status(400).json({
        success: false,
        message: 'Skill ID is required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add skill if not already added
    if (!user.skills.includes(skillId)) {
      user.skills.push(skillId);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Skill added successfully'
    });
  })
);

/**
 * DELETE /api/users/:id/skills/:skillId
 * Remove skill from user
 */
router.delete(
  '/:id/skills/:skillId',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    // Users can only remove skills from their own profile
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own skills'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove skill
    user.skills = user.skills.filter((id: any) => id.toString() !== req.params.skillId);
    await user.save();

    res.json({
      success: true,
      message: 'Skill removed successfully'
    });
  })
);

/**
 * POST /api/users/resume/upload
 * Upload and parse resume (PDF only)
 */
router.post(
  '/resume/upload',
  authenticate,
  resumeUpload.single('resume'),
  asyncHandler(async (req: any, res: Response) => {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    const file = req.file;

    try {
      // Process the resume upload
      const result = await fileService.processResumeUpload(file, req.user.userId);

      if (!result) {
        return res.status(500).json({
          success: false,
          message: 'Failed to process resume upload'
        });
      }

      res.json({
        success: true,
        message: 'Resume uploaded and parsed successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Resume upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload and parse resume'
      });
    }
  })
);

export default router;
