const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes.',
});

const messageLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: 'Sending messages too fast, slow down!',
  skip: (req) => req.method !== 'POST' || !req.path.includes('message'),
});

module.exports = { limiter, authLimiter, messageLimiter };
