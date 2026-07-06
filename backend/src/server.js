const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/env');
const { handleSocketConnection } = require('./sockets/socketHandlers');

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: config.SOCKET_IO_CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  handleSocketConnection(io, socket);
});

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    server.listen(config.PORT, config.HOST, () => {
      console.log(`\n🚀 Server running at http://${config.HOST}:${config.PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log(`Authentication: ${config.ENABLE_AUTH ? 'Enabled' : 'Disabled (Guest mode)'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down`);
  io.close();
  server.close(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = { server, startServer };
