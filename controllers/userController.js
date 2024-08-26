const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q; // Get the search query from the request
    const users = await User.find({
      username: { $regex: `^${searchQuery}`, $options: 'i' } // Match usernames starting with searchQuery, case-insensitive
    })
    .select('username') // Only return the username field
    .limit(5); // Limit results to top 5

    res.json(users);
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
