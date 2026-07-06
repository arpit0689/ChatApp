const Room = require('../models/Room');
const { createError } = require('../utils/helpers');

class RoomService {
  async createRoom(name, description, creator) {
    const existingRoom = await Room.findOne({ name: name.trim() });

    if (existingRoom) {
      throw createError(409, 'Room name already exists');
    }

    const room = new Room({
      name: name.trim(),
      description: description || '',
      creator: creator || null,
    });

    await room.save();
    return room;
  }

  async getRoomById(roomId) {
    const room = await Room.findById(roomId).populate('creator', 'username avatar');
    if (!room) {
      throw createError(404, 'Room not found');
    }
    return room;
  }

  async getAllRooms(limit = 50, skip = 0) {
    const rooms = await Room.find()
      .populate('creator', 'username avatar')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments();

    return { rooms, total };
  }

  async updateRoom(roomId, updates) {
    const room = await Room.findByIdAndUpdate(roomId, updates, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      throw createError(404, 'Room not found');
    }

    return room;
  }

  async deleteRoom(roomId) {
    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      throw createError(404, 'Room not found');
    }

    return room;
  }

  async addMemberToRoom(roomId, userId) {
    const room = await Room.findById(roomId);

    if (!room) {
      throw createError(404, 'Room not found');
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    return room;
  }

  async removeMemberFromRoom(roomId, userId) {
    const room = await Room.findById(roomId);

    if (!room) {
      throw createError(404, 'Room not found');
    }

    room.members = room.members.filter(id => !id.equals(userId));
    await room.save();

    return room;
  }
}

module.exports = new RoomService();
