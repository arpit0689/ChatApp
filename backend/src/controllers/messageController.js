const messageService = require('../services/messageService');
const config = require('../config/env');

class MessageController {
  async createMessage(req, res, next) {
    try {
      const { content, roomId } = req.body;
      const senderId = req.user?.userId || (!config.ENABLE_AUTH ? req.body.senderId : null);

      if (!senderId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const message = await messageService.createMessage(senderId, roomId, content);

      res.status(201).json({
        statusCode: 201,
        message: 'Message created successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessagesByRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = config.MESSAGES_PER_PAGE } = req.query;

      const result = await messageService.getMessagesByRoomId(roomId, page, limit);

      res.status(200).json({
        statusCode: 200,
        message: 'Messages fetched successfully',
        data: {
          messages: result.messages,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.pages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const message = await messageService.editMessage(messageId, userId, content);

      res.status(200).json({
        statusCode: 200,
        message: 'Message updated successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await messageService.deleteMessage(messageId, userId);

      res.status(200).json({
        statusCode: 200,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async searchMessages(req, res, next) {
    try {
      const { roomId } = req.params;
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const messages = await messageService.searchMessages(roomId, query);

      res.status(200).json({
        statusCode: 200,
        message: 'Messages found',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
