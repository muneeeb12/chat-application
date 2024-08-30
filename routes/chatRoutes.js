const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Route to show the chat page
router.get('/page/:userId', chatController.showChatPage);

// Route to send a message
router.post('/send', chatController.sendMessage);

// Route to get messages
router.get('/:recipientId', chatController.getMessages);

module.exports = router;
