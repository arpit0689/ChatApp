require('dotenv').config();

const toInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toToken = (value, fallback) => {
  const token = String(value || '').trim().split(/\s+/)[0];
  return token || fallback;
};

module.exports = {
  PORT: toInteger(process.env.PORT, 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '0.0.0.0',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: toToken(process.env.JWT_EXPIRE, '7d'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  SOCKET_IO_CORS_ORIGIN: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
  MAX_MESSAGE_LENGTH: toInteger(process.env.MAX_MESSAGE_LENGTH, 1000),
  MAX_ROOM_NAME_LENGTH: toInteger(process.env.MAX_ROOM_NAME_LENGTH, 50),
  MAX_USERNAME_LENGTH: toInteger(process.env.MAX_USERNAME_LENGTH, 30),
  RATE_LIMIT_WINDOW_MS: toInteger(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX_REQUESTS: toInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  MESSAGES_PER_PAGE: toInteger(process.env.MESSAGES_PER_PAGE, 50),
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production'
};
