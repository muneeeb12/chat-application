const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to show chat page
router.get('/page/:userId', authMiddleware,chatController.showChatPage);

module.exports = router;
