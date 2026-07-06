const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId, username) => {
  return jwt.sign({ userId, username }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
