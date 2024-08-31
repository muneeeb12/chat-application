const User = require("../models/UserModel");
const DirectMessage = require("../models/DirectMessageModel");

// showChatPage: Show the chat page for the user
exports.showChatPage = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Logged-in User ID:", userId);

    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('chat', { user });
  } catch (error) {
    console.error('Error retrieving chat page:', error);
    res.status(500).send('Server error');
  }
};

// getMessages: Retrieve messages between the logged-in user and a recipient
exports.getMessages = async (req, res) => {
  try {
    const recipientId = req.params.currentRecipientId;
    const senderId = req.user ? req.user._id : null;

    if (!recipientId || !senderId) {
      return res.status(400).json({ error: 'Recipient and sender IDs are required' });
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).populate('sender recipient');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
