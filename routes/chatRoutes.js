const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Route to show the chat page
router.get('/page/:userId', chatController.showChatPage);

module.exports = router;
