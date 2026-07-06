const Message = require('../models/Message');
const Room = require('../models/Room');
const { createError, getPageAndLimit } = require('../utils/helpers');
const config = require('../config/env');

class MessageService {
  async createMessage(senderId, roomId, content) {
    const roomExists = await Room.exists({ _id: roomId });
    if (!roomExists) {
      throw createError(404, 'Room not found');
    }

    const message = new Message({
      sender: senderId,
      room: roomId,
      content: content.trim(),
      messageType: 'text',
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update room's last message time and message count
    await Room.findByIdAndUpdate(
      roomId,
      {
        lastMessageAt: new Date(),
        $inc: { messageCount: 1 },
      },
      { new: true }
    );

    return message;
  }

  async getMessagesByRoomId(roomId, page = 1, limit = config.MESSAGES_PER_PAGE) {
    const { skip, limitNum, pageNum } = getPageAndLimit(page, limit);

    const messages = await Message.find({
      room: roomId,
      isDeleted: false,
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Message.countDocuments({
      room: roomId,
      isDeleted: false,
    });

    return {
      messages,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  async getMessageById(messageId) {
    const message = await Message.findById(messageId).populate('sender', 'username avatar');

    if (!message) {
      throw createError(404, 'Message not found');
    }

    return message;
  }

  async editMessage(messageId, userId, newContent) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw createError(404, 'Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw createError(403, 'You can only edit your own messages');
    }

    message.content = newContent.trim();
    message.edited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('sender', 'username avatar');

    return message;
  }

  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw createError(404, 'Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw createError(403, 'You can only delete your own messages');
    }

    message.isDeleted = true;
    await message.save();

    return message;
  }

  async searchMessages(roomId, query) {
    const messages = await Message.find({
      room: roomId,
      isDeleted: false,
      content: { $regex: query, $options: 'i' },
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    return messages;
  }
}

module.exports = new MessageService();
