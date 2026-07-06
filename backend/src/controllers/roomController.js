const roomService = require('../services/roomService');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const { name, description } = req.body;
      const creator = req.user?.userId || null;

      const room = await roomService.createRoom(name, description, creator);

      res.status(201).json({
        statusCode: 201,
        message: 'Room created successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRooms(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;

      const skip = (page - 1) * limit;
      const { rooms, total } = await roomService.getAllRooms(parseInt(limit), skip);

      res.status(200).json({
        statusCode: 200,
        message: 'Rooms fetched successfully',
        data: {
          rooms,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req, res, next) {
    try {
      const { roomId } = req.params;

      const room = await roomService.getRoomById(roomId);

      res.status(200).json({
        statusCode: 200,
        message: 'Room fetched successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const updates = req.body;

      const room = await roomService.updateRoom(roomId, updates);

      res.status(200).json({
        statusCode: 200,
        message: 'Room updated successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req, res, next) {
    try {
      const { roomId } = req.params;

      await roomService.deleteRoom(roomId);

      res.status(200).json({
        statusCode: 200,
        message: 'Room deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
