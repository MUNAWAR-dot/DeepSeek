const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        errors: errors.array(),
      },
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('displayName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  handleValidationErrors,
];

// User validations
const validateUpdateProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('status')
    .optional()
    .trim()
    .isLength({ max: 139 })
    .withMessage('Status must be 139 characters or less'),
  body('about')
    .optional()
    .trim()
    .isLength({ max: 139 })
    .withMessage('About must be 139 characters or less'),
  handleValidationErrors,
];

// Chat validations
const validateCreateChat = [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('isGroup').optional().isBoolean(),
  body('groupName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 25 })
    .withMessage('Group name must be between 2 and 25 characters'),
  handleValidationErrors,
];

// Message validations
const validateSendMessage = [
  body('chatId').isString().withMessage('Chat ID is required'),
  body('type')
    .isString()
    .isIn(['text', 'image', 'video', 'audio', 'document', 'location', 'contact'])
    .withMessage('Valid message type is required'),
  body('content').isString().withMessage('Message content is required'),
  handleValidationErrors,
];

// Status validations
const validateCreateStatus = [
  body('type')
    .optional()
    .isString()
    .isIn(['image', 'video'])
    .withMessage('Valid status type is required'),
  body('caption')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Caption must be 200 characters or less'),
  handleValidationErrors,
];

// Call validations
const validateInitiateCall = [
  body('receiverId').isString().withMessage('Receiver ID is required'),
  body('type')
    .isString()
    .isIn(['voice', 'video'])
    .withMessage('Valid call type is required'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateChat,
  validateSendMessage,
  validateCreateStatus,
  validateInitiateCall,
};
