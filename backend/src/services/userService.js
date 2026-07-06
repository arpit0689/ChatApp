const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { createError } = require('../utils/helpers');

class UserService {
  async createGuestUser(username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      if (existingUser.isAuthenticated) {
        throw createError(409, 'Username belongs to a registered account');
      }
      return existingUser;
    }

    return this.createUser(username, null, null);
  }

  async createUser(username, email, password) {
    const candidates = [{ username }];
    if (email) candidates.push({ email });
    const existingUser = await User.findOne({ $or: candidates });

    if (existingUser) {
      throw createError(409, 'Username or email already exists');
    }

    const hashedPassword = password ? await hashPassword(password) : null;

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAuthenticated: !!password,
    });

    await user.save();
    return user;
  }

  async loginUser(username, password) {
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw createError(401, 'Invalid credentials');
    }

    if (!user.password) {
      throw createError(401, 'This account uses guest login');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw createError(401, 'Invalid credentials');
    }

    const token = generateToken(user._id, user.username);
    return { user, token };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }
    return user;
  }

  async getUserByUsername(username) {
    const user = await User.findOne({ username });
    if (!user) {
      throw createError(404, 'User not found');
    }
    return user;
  }

  async updateUserStatus(userId, status) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status, lastSeen: new Date() },
      { new: true }
    );
    return user;
  }

  async getOnlineUsers() {
    return User.find({
      status: { $in: ['online', 'away'] },
    }).select('username avatar status');
  }
}

module.exports = new UserService();
