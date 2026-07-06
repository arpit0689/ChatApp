const express = require('express');
const authController = require('../controllers/authController');
const { validateUser, validateGuest, validateLogin } = require('../validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, validateUser, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/guest', validateGuest, authController.guestLogin);

module.exports = router;
