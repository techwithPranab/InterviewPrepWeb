import express, { Request, Response } from 'express';
import CandidateProfile from '../models/CandidateProfile';
import { authenticate } from '../middleware/auth';
import resumeParserService from '../services/resumeParserService';

const router = express.Router();

// Helper function to wrap async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * GET /api/candidate-profiles/me
 * Get current user's candidate profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;

    const profile = await CandidateProfile.findOne({ userId })
      .populate('userId', 'firstName lastName email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found. Please upload your resume first.',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  })
);

/**
 * GET /api/candidate-profiles/:id
 * Get a specific candidate profile
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await CandidateProfile.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  })
);

/**
 * PUT /api/candidate-profiles/:id
 * Update a candidate profile
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const profile = await CandidateProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    // Ensure user can only update their own profile
    if (profile.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
    }

    const {
      personalInfo,
      summary,
      skills,
      experience,
      projects,
      education,
      certifications,
      totalExperience,
      currentRole,
    } = req.body;

    // Update fields
    if (personalInfo) profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    if (summary !== undefined) profile.summary = summary;
    if (skills) profile.skills = { ...profile.skills, ...skills };
    if (experience) profile.experience = experience;
    if (projects) profile.projects = projects;
    if (education) profile.education = education;
    if (certifications) profile.certifications = certifications;
    if (totalExperience !== undefined) profile.totalExperience = totalExperience;
    if (currentRole !== undefined) profile.currentRole = currentRole;

    profile.extractionMethod = 'manual'; // Mark as manually updated

    await profile.save();

    res.json({
      success: true,
      message: 'Candidate profile updated successfully',
      data: profile,
    });
  })
);

/**
 * DELETE /api/candidate-profiles/:id
 * Delete a candidate profile
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const profile = await CandidateProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    // Ensure user can only delete their own profile
    if (profile.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own profile',
      });
    }

    await CandidateProfile.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Candidate profile deleted successfully',
    });
  })
);

/**
 * POST /api/candidate-profiles/:id/generate-questions
 * Generate interview questions based on candidate profile
 */
router.post(
  '/:id/generate-questions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await CandidateProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    const { skillFocus } = req.body;

    try {
      const questions = await resumeParserService.generateInterviewQuestions(
        profile,
        skillFocus
      );

      res.json({
        success: true,
        data: {
          questions,
          generatedFor: {
            name: profile.personalInfo.fullName,
            skills: skillFocus || profile.skills.technical.slice(0, 5),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate questions',
        error: error.message,
      });
    }
  })
);

/**
 * POST /api/candidate-profiles/:id/reparse
 * Re-parse the resume using AI
 */
router.post(
  '/:id/reparse',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const profile = await CandidateProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    // Ensure user can only reparse their own profile
    if (profile.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reparse your own profile',
      });
    }

    if (!profile.rawText) {
      return res.status(400).json({
        success: false,
        message: 'No raw resume text available for reparsing',
      });
    }

    try {
      const parsedData = await resumeParserService.parseResumeWithAI(profile.rawText);
      
      // Update profile with new parsed data
      profile.personalInfo = parsedData.personalInfo;
      profile.summary = parsedData.summary;
      profile.skills = parsedData.skills;
      profile.experience = parsedData.experience;
      profile.projects = parsedData.projects;
      profile.education = parsedData.education;
      profile.certifications = parsedData.certifications;
      profile.totalExperience = parsedData.totalExperience;
      profile.currentRole = parsedData.currentRole;
      profile.extractedAt = new Date();
      profile.extractionMethod = 'ai';

      await profile.save();

      res.json({
        success: true,
        message: 'Profile reparsed successfully',
        data: profile,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to reparse profile',
        error: error.message,
      });
    }
  })
);

export default router;
