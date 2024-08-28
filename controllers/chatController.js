const User = require("../models/UserModel");

exports.showChatPage = async (req, res) => {
  try {
    const userId = req.params.userId; // Corrected variable name
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
