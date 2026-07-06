const messageService = require('../services/messageService');
const mongoose = require('mongoose');
const config = require('../config/env');

const connectedUsers = new Map();
const roomUsers = new Map();

const handleSocketConnection = (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a room
  socket.on('joinRoom', async (data) => {
    try {
      const { roomId, userId, username } = data;

      if (
        !mongoose.isValidObjectId(roomId) ||
        !mongoose.isValidObjectId(userId) ||
        typeof username !== 'string' ||
        !username.trim()
      ) {
        return socket.emit('error', { message: 'A valid room, user, and username are required' });
      }

      // Store user in connected users map
      connectedUsers.set(socket.id, { userId, username, roomId });

      // Remove user from previous room
      const previousRoom = Array.from(roomUsers.entries()).find(
        ([, users]) => users.some(u => u.socketId === socket.id)
      );

      if (previousRoom) {
        const previousUsers = previousRoom[1].filter(u => u.socketId !== socket.id);
        roomUsers.set(previousRoom[0], previousUsers);
        socket.leave(previousRoom[0]);
        io.to(previousRoom[0]).emit('userLeft', {
          username,
          onlineUsers: previousUsers.map(u => ({ userId: u.userId, username: u.username })),
        });
      }

      // Add user to new room
      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, []);
      }

      const roomUserList = roomUsers.get(roomId);
      roomUserList.push({ socketId: socket.id, userId, username });
      roomUsers.set(roomId, roomUserList);

      // Emit user joined event
      io.to(roomId).emit('userJoined', {
        username,
        onlineUsers: roomUserList.map(u => ({ userId: u.userId, username: u.username })),
      });

      // Send chat history to the joining user
      try {
        const { messages } = await messageService.getMessagesByRoomId(roomId, 1, 50);
        socket.emit('chatHistory', {
          messages,
        });
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }

      console.log(`User ${username} joined room ${roomId}`);
    } catch (error) {
      console.error('Error in joinRoom:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // User sends a message
  socket.on('chatMessage', async (data) => {
    try {
      const { roomId, content, userId, username } = data;

      if (
        !mongoose.isValidObjectId(roomId) ||
        !mongoose.isValidObjectId(userId) ||
        typeof content !== 'string' ||
        !content.trim() ||
        content.length > config.MAX_MESSAGE_LENGTH
      ) {
        return socket.emit('error', { message: 'Invalid message' });
      }

      // Create message in database
      const message = await messageService.createMessage(userId, roomId, content);

      // Emit message to all users in the room
      io.to(roomId).emit('newMessage', {
        _id: message._id,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
          avatar: message.sender.avatar,
        },
        content: message.content,
        room: roomId,
        createdAt: message.createdAt,
        messageType: message.messageType,
      });

      console.log(`Message sent in room ${roomId} by ${username}`);
    } catch (error) {
      console.error('Error in chatMessage:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // User is typing
  socket.on('typing', (data) => {
    try {
      const { roomId, username } = data;

      socket.to(roomId).emit('userTyping', {
        username,
      });
    } catch (error) {
      console.error('Error in typing:', error);
    }
  });

  // User stopped typing
  socket.on('stopTyping', (data) => {
    try {
      const { roomId, username } = data;

      socket.to(roomId).emit('userStoppedTyping', {
        username,
      });
    } catch (error) {
      console.error('Error in stopTyping:', error);
    }
  });

  // Get online users in a room
  socket.on('getOnlineUsers', (data) => {
    try {
      const { roomId } = data;

      const onlineUsers = roomUsers.get(roomId) || [];
      socket.emit('onlineUsers', {
        users: onlineUsers.map(u => ({ userId: u.userId, username: u.username })),
      });
    } catch (error) {
      console.error('Error in getOnlineUsers:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const user = connectedUsers.get(socket.id);

      if (user) {
        const { roomId, username } = user;

        // Remove user from room
        if (roomUsers.has(roomId)) {
          let roomUserList = roomUsers.get(roomId);
          roomUserList = roomUserList.filter(u => u.socketId !== socket.id);
          roomUsers.set(roomId, roomUserList);

          // Notify other users in the room
          io.to(roomId).emit('userLeft', {
            username,
            onlineUsers: roomUserList.map(u => ({ userId: u.userId, username: u.username })),
          });
        }

        connectedUsers.delete(socket.id);
        console.log(`User ${username} disconnected`);
      }
    } catch (error) {
      console.error('Error in disconnect:', error);
    }
  });

  // Handle load more messages
  socket.on('loadMoreMessages', async (data) => {
    try {
      const { roomId, page } = data;

      const { messages } = await messageService.getMessagesByRoomId(roomId, page, 50);
      socket.emit('moreChatHistory', {
        messages,
        page,
      });
    } catch (error) {
      console.error('Error in loadMoreMessages:', error);
      socket.emit('error', { message: 'Failed to load messages' });
    }
  });

  // Handle message edit
  socket.on('editMessage', async (data) => {
    try {
      const { messageId, content, userId, roomId } = data;

      const editedMessage = await messageService.editMessage(messageId, userId, content);

      io.to(roomId).emit('messageEdited', {
        _id: editedMessage._id,
        content: editedMessage.content,
        edited: true,
        editedAt: editedMessage.editedAt,
      });
    } catch (error) {
      console.error('Error in editMessage:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Handle message delete
  socket.on('deleteMessage', async (data) => {
    try {
      const { messageId, userId, roomId } = data;

      await messageService.deleteMessage(messageId, userId);

      io.to(roomId).emit('messageDeleted', {
        _id: messageId,
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });
};

module.exports = { handleSocketConnection, connectedUsers, roomUsers };
