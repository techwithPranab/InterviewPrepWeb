const { body, param, query, validationResult } = require('express-validator');

// Handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
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

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Interview session validation
const validateInterviewSession = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Interview title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
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

// Question validation
const validateQuestion = [
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
  
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  
  handleValidationErrors
];

// Answer validation
const validateAnswer = [
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ min: 5, max: 5000 })
    .withMessage('Answer must be between 5 and 5000 characters'),
  
  handleValidationErrors
];

// Skill validation
const validateSkill = [
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
  
  handleValidationErrors
];

// ObjectId validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateInterviewSession,
  validateQuestion,
  validateAnswer,
  validateSkill,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};
