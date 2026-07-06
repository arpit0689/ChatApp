const express = require('express');
const roomController = require('../controllers/roomController');
const { validateRoom, validateRoomId, validatePagination } = require('../validators');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, validateRoom, roomController.createRoom);
router.get('/', validatePagination, roomController.getAllRooms);
router.get('/:roomId', validateRoomId, roomController.getRoomById);
router.put('/:roomId', optionalAuth, validateRoomId, validateRoom, roomController.updateRoom);
router.delete('/:roomId', optionalAuth, validateRoomId, roomController.deleteRoom);

module.exports = router;
