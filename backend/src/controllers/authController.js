const userService = require('../services/userService');
const config = require('../config/env');

class AuthController {
  async register(req, res, next) {
    try {
      if (!config.ENABLE_AUTH) {
        return res.status(403).json({ message: 'Registration is disabled' });
      }

      const { username, email, password } = req.body;

      const user = await userService.createUser(username, email, password);
      const token = require('../utils/jwt').generateToken(user._id, user.username);

      res.status(201).json({
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      if (!config.ENABLE_AUTH) {
        return res.status(403).json({ message: 'Authentication is disabled' });
      }

      const { username, password } = req.body;

      const { user, token } = await userService.loginUser(username, password);

      res.status(200).json({
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async guestLogin(req, res, next) {
    try {
      const { username } = req.body;

      const user = await userService.createGuestUser(username);

      res.status(201).json({
        statusCode: 201,
        message: 'Guest login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
