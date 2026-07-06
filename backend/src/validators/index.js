const { body, param, query, validationResult } = require('express-validator');
const config = require('../config/env');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Validation Error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const validateMessage = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: config.MAX_MESSAGE_LENGTH })
    .withMessage(`Message must not exceed ${config.MAX_MESSAGE_LENGTH} characters`),
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid Room ID'),
  body('senderId')
    .optional()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid Sender ID'),
  handleValidationErrors,
];

const validateMessageUpdate = [
  param('messageId')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid Message ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: config.MAX_MESSAGE_LENGTH })
    .withMessage(`Message must not exceed ${config.MAX_MESSAGE_LENGTH} characters`),
  handleValidationErrors,
];

const validateMessageId = [
  param('messageId')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid Message ID'),
  handleValidationErrors,
];

const validateRoom = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Room name is required')
    .isLength({ max: config.MAX_ROOM_NAME_LENGTH })
    .withMessage(`Room name must not exceed ${config.MAX_ROOM_NAME_LENGTH} characters`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors,
];

const usernameValidation = () => body('username')
  .trim()
  .notEmpty()
  .withMessage('Username is required')
  .isLength({ min: 2, max: config.MAX_USERNAME_LENGTH })
  .withMessage(`Username must be between 2 and ${config.MAX_USERNAME_LENGTH} characters`)
  .matches(/^[a-zA-Z0-9_-]+$/)
  .withMessage('Username can only contain letters, numbers, underscores, and hyphens');

const validateUser = [
  usernameValidation(),
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateGuest = [
  usernameValidation(),
  handleValidationErrors,
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

const validateRoomId = [
  param('roomId')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid Room ID'),
  handleValidationErrors,
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

module.exports = {
  validateMessage,
  validateMessageUpdate,
  validateMessageId,
  validateRoom,
  validateUser,
  validateGuest,
  validateLogin,
  validateRoomId,
  validatePagination,
  handleValidationErrors,
};
