const User = require('../models/User');
const OutgoingFriendship = require('../models/OutgoingFriendship');
const IncomingFriendship = require('../models/IncomingFriendship');

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

exports.sendrequest =  async (req, res) => {
  const { recipientId } = req.body;

  try {
      const outgoingFriendship = new OutgoingFriendship({
          requester: req.user._id,
          recipient: recipientId
      });

      const incomingFriendship = new IncomingFriendship({
          requester: req.user._id,
          recipient: recipientId
      });

      await outgoingFriendship.save();
      await incomingFriendship.save();

      res.status(200).json({ message: 'Friend request sent successfully!' });
  } catch (err) {
      console.error('Error sending friend request:', err);
      res.status(500).json({ error: 'Failed to send friend request' });
  }
}

// Accept a friend request
exports.acceptrequest = async (req, res) => {
  const { requesterId } = req.body;

  try {
      await OutgoingFriendship.findOneAndUpdate(
          { requester: requesterId, recipient: req.user._id, status: 'Pending' },
          { status: 'Accepted' }
      );

      await IncomingFriendship.findOneAndUpdate(
          { requester: requesterId, recipient: req.user._id, status: 'Pending' },
          { status: 'Accepted' }
      );

      res.status(200).json({ message: 'Friend request accepted successfully!' });
  } catch (err) {
      console.error('Error accepting friend request:', err);
      res.status(500).json({ error: 'Failed to accept friend request' });
  }
}

// Reject a friend request
exports.rejectrequest =  async (req, res) => {
  const { requesterId } = req.body;

  try {
      await OutgoingFriendship.findOneAndUpdate(
          { requester: requesterId, recipient: req.user._id, status: 'Pending' },
          { status: 'Rejected' }
      );

      await IncomingFriendship.findOneAndUpdate(
          { requester: requesterId, recipient: req.user._id, status: 'Rejected' }
      );

      res.status(200).json({ message: 'Friend request rejected successfully!' });
  } catch (err) {
      console.error('Error rejecting friend request:', err);
      res.status(500).json({ error: 'Failed to reject friend request' });
  }
}
