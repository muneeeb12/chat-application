const app = require("../importFiles/importFiles");
const router = app.express.Router();

// Route to show the chat page
router.get('/:userId', app.authMiddleware, app.chatController.showChatPage);

// Route to get messages
router.get('/history/:currentRecipientId', app.chatController.getMessages);

module.exports = router;
