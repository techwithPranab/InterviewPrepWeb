import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * User registration validation
 */
export const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['candidate', 'interviewer', 'admin'])
    .withMessage('Invalid role'),
  
  handleValidationErrors
];

/**
 * User login validation
 */
export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * User profile update validation
 */
export const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Interview session validation
 */
export const validateInterviewSession = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Interview title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('type')
    .isIn(['technical', 'behavioral', 'mixed'])
    .withMessage('Invalid interview type'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  
  body('skills.*')
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),
  
  body('duration')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('Duration must be between 5 and 180 minutes'),
  
  handleValidationErrors
];

/**
 * Question validation
 */
export const validateQuestion = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question must be between 10 and 1000 characters'),
  
  body('type')
    .isIn(['technical', 'behavioral', 'situational'])
    .withMessage('Invalid question type'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  
  body('skills.*')
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),
  
  body('expectedAnswer')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Expected answer must be between 10 and 2000 characters'),
  
  handleValidationErrors
];

/**
 * Answer validation
 */
export const validateAnswer = [
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ min: 5, max: 5000 })
    .withMessage('Answer must be between 5 and 5000 characters'),
  
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  
  handleValidationErrors
];

/**
 * Skill validation
 */
export const validateSkill = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  
  body('category')
    .isIn(['programming', 'framework', 'database', 'tool', 'soft-skill', 'other'])
    .withMessage('Invalid skill category'),
  
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid skill level'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Scheduled interview validation
 */
export const validateScheduledInterview = [
  body('interviewerId')
    .notEmpty()
    .withMessage('Interviewer ID is required'),
  
  body('scheduledTime')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('duration')
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * ObjectId validation
 */
export const validateObjectId = (paramName = 'id'): ValidationChain[] => [
  param(paramName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${paramName}`)
];

/**
 * Pagination validation
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),
  
  handleValidationErrors
];

/**
 * Interview guide validation
 */
export const validateInterviewGuide = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('domain')
    .trim()
    .notEmpty()
    .withMessage('Domain is required'),
  
  body('technology')
    .trim()
    .notEmpty()
    .withMessage('Technology is required'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  
  handleValidationErrors
];

/**
 * Achievement validation
 */
export const validateAchievement = [
  body('badgeName')
    .trim()
    .notEmpty()
    .withMessage('Badge name is required'),
  
  body('category')
    .isIn(['interview', 'skill', 'milestone', 'special'])
    .withMessage('Invalid achievement category'),
  
  body('badgeIcon')
    .optional()
    .trim()
    .isURL()
    .withMessage('Badge icon must be a valid URL'),
  
  handleValidationErrors
];
