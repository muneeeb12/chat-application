const User = require("../models/UserModel");
const DirectMessage = require("../models/DirectMessageModel");

exports.showChatPage = async (req, res) => {
  try {
    const userId = req.params.userId; 
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

// Send a message
exports.sendMessage = async (req, res) => {
  try {
      const { recipient, content } = req.body;
      const sender = req.user._id; // Get the sender ID from the logged-in user

      // Create a new message
      const newMessage = new Message({ recipient, content, sender });
      await newMessage.save();

      res.status(201).json(newMessage);
  } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Server error' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
      const recipientId = req.params.recipientId;
      const senderId = req.user._id; // Get the sender ID from the logged-in user

      const messages = await Message.find({
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