const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeMessage = (content) => {
  return content.trim().slice(0, 1000);
};

const getPageAndLimit = (page = 1, limit = 50) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};

module.exports = {
  createError,
  validateEmail,
  sanitizeMessage,
  getPageAndLimit,
};
