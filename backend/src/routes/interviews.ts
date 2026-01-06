import { Router, Request, Response } from 'express';
import InterviewSession from '../models/InterviewSession';
import { authenticate } from '../middleware/auth';
import { validateInterviewSession, validateAnswer, validatePagination } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import aiService from '../services/aiService';

const router = Router();

/**
 * POST /api/interviews
 * Create a new interview session
 */
router.post(
  '/',
  authenticate,
  validateInterviewSession,
  asyncHandler(async (req: any, res: Response) => {
    const { title, description, type, difficulty, skills, duration } = req.body;

    const interview = new InterviewSession({
      title,
      description,
      type,
      difficulty,
      skills,
      duration,
      candidate: req.user.userId,
      status: 'scheduled'
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      interview
    });
  })
);

/**
 * GET /api/interviews
 * Get user's interviews
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  asyncHandler(async (req: any, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    const interviews = await InterviewSession.find({ candidate: req.user.userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('candidate', 'firstName lastName email')
      .populate('interviewer', 'firstName lastName');

    const total = await InterviewSession.countDocuments({ candidate: req.user.userId });

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
 * GET /api/interviews/:id
 * Get interview details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const interview = await InterviewSession.findById(req.params.id)
      .populate('candidate', 'firstName lastName email')
      .populate('interviewer', 'firstName lastName')
      .populate('skills', 'name category');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check authorization
    if (interview.candidate.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this interview'
      });
    }

    res.json({
      success: true,
      interview
    });
  })
);

/**
 * POST /api/interviews/:id/start
 * Start an interview session
 */
router.post(
  '/:id/start',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.candidate.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Interview cannot be started in current status'
      });
    }

    // Generate questions if not already generated
    if (!interview.questions || interview.questions.length === 0) {
      try {
        const generatedQuestions = await aiService.generateOnlineInterviewQuestions({
          skills: interview.skills as string[],
          difficulty: interview.difficulty,
          questionCount: 10
        });

        interview.questions = generatedQuestions.map((q: any) => ({
          question: q.question || q.text,
          type: q.type || 'technical',
          difficulty: interview.difficulty,
          answer: undefined,
          evaluation: undefined
        }));
      } catch (error) {
        console.error('Error generating questions:', error);
      }
    }

    interview.status = 'in-progress';
    interview.startedAt = new Date();
    await interview.save();

    res.json({
      success: true,
      message: 'Interview started',
      interview
    });
  })
);

/**
 * POST /api/interviews/:id/submit-answer
 * Submit an answer to a question
 */
router.post(
  '/:id/submit-answer',
  authenticate,
  validateAnswer,
  asyncHandler(async (req: any, res: Response) => {
    const { questionId, answer } = req.body;

    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.candidate.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find and update the question
    const questionIndex = interview.questions.findIndex((q: any) => q._id?.toString() === questionId);

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    interview.questions[questionIndex].answer = {
      text: answer,
      timestamp: new Date()
    };

    // Evaluate the answer using AI
    try {
      const evaluation = await aiService.evaluateAnswer(
        interview.questions[questionIndex].question,
        answer,
        interview.questions[questionIndex].evaluation?.feedback
      );

      interview.questions[questionIndex].evaluation = {
        score: evaluation.score,
        feedback: evaluation.feedback,
        criteria: evaluation.criteria
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
    }

    await interview.save();

    res.json({
      success: true,
      message: 'Answer submitted and evaluated',
      evaluation: interview.questions[questionIndex].evaluation
    });
  })
);

/**
 * POST /api/interviews/:id/complete
 * Complete an interview session
 */
router.post(
  '/:id/complete',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.candidate.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();

    // Calculate overall score from question evaluations
    let totalScore = 0;
    let completedQuestions = 0;
    interview.questions.forEach((q: any) => {
      if (q.evaluation && q.evaluation.score) {
        totalScore += q.evaluation.score;
        completedQuestions++;
      }
    });
    const averageScore = completedQuestions > 0 ? totalScore / completedQuestions : 0;

    // Generate overall feedback
    try {
      const feedback = await aiService.generateOverallFeedback({
        questions: interview.questions,
        candidate: interview.candidate.toString(),
        skills: interview.skills as string[]
      });

      interview.overallEvaluation = {
        totalScore: totalScore,
        averageScore: averageScore,
        totalQuestions: interview.questions.length,
        completedQuestions: completedQuestions,
        feedback: feedback.overall_assessment || '',
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        recommendation: feedback.recommendation || 'neutral'
      };
    } catch (error) {
      console.error('Error generating feedback:', error);
      interview.overallEvaluation = {
        totalScore: totalScore,
        averageScore: averageScore,
        totalQuestions: interview.questions.length,
        completedQuestions: completedQuestions,
        feedback: 'Interview completed successfully',
        strengths: [],
        improvements: [],
        recommendation: 'neutral'
      };
    }

    await interview.save();

    res.json({
      success: true,
      message: 'Interview completed',
      interview
    });
  })
);

/**
 * DELETE /api/interviews/:id
 * Delete an interview (only drafts/scheduled)
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.candidate.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (interview.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an in-progress interview'
      });
    }

    await InterviewSession.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  })
);

/**
 * GET /api/interviews/:id/results
 * Get interview results and feedback
 */
router.get(
  '/:id/results',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.candidate.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to these results'
      });
    }

    if (interview.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview is not yet completed'
      });
    }

    res.json({
      success: true,
      results: {
        interview: interview._id,
        title: interview.title,
        completedAt: interview.completedAt,
        duration: interview.completedAt && interview.startedAt 
          ? Math.round((interview.completedAt.getTime() - interview.startedAt.getTime()) / 60000)
          : 0,
        overallScore: interview.overallEvaluation?.totalScore || 0,
        evaluation: interview.overallEvaluation,
        questionDetails: interview.questions.map((q: any) => ({
          question: q.question,
          answer: q.answer?.text,
          score: q.evaluation?.score || 0,
          feedback: q.evaluation?.feedback
        }))
      }
    });
  })
);

export default router;
