const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to show the chat page
router.get('/:userId', authMiddleware, chatController.showChatPage);

module.exports = router;
