const express = require('express');
const messageController = require('../controllers/messageController');
const {
  validateMessage,
  validateMessageUpdate,
  validateMessageId,
  validateRoomId,
  validatePagination,
} = require('../validators');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, validateMessage, messageController.createMessage);
router.get('/:roomId/search', validateRoomId, messageController.searchMessages);
router.get('/:roomId', validateRoomId, validatePagination, messageController.getMessagesByRoom);
router.put('/:messageId', optionalAuth, validateMessageUpdate, messageController.editMessage);
router.delete('/:messageId', optionalAuth, validateMessageId, messageController.deleteMessage);

module.exports = router;
