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

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  const requesterId = req.user._id; // Assuming you have user info in req.user

  try {
    // Check if the request already exists
    const existingRequest = await IncomingFriendship.findOne({ requester: requesterId, recipient: recipientId }).exec();
    if (existingRequest) {
      return res.json({ message: 'Friend request already sent' });
    }

    // Create a new incoming friend request
    const newRequest = new IncomingFriendship({ requester: requesterId, recipient: recipientId });
    await newRequest.save();

    // Create a new outgoing friend request
    const newOutgoingRequest = new OutgoingFriendship({ requester: requesterId, recipient: recipientId });
    await newOutgoingRequest.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  const { requesterId } = req.body;
  const recipientId = req.user._id; // Assuming you have user info in req.user

  try {
    // Update the status of the incoming friend request
    await IncomingFriendship.findOneAndUpdate(
      { requester: requesterId, recipient: recipientId },
      { status: 'Accepted' },
      { new: true }
    ).exec();

    // Update the status of the outgoing friend request
    await OutgoingFriendship.findOneAndUpdate(
      { requester: requesterId, recipient: recipientId },
      { status: 'Accepted' },
      { new: true }
    ).exec();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reject a friend request
exports.rejectFriendRequest = async (req, res) => {
  const { requesterId } = req.body;
  const recipientId = req.user._id; // Assuming you have user info in req.user

  try {
    // Update the status of the incoming friend request
    await IncomingFriendship.findOneAndUpdate(
      { requester: requesterId, recipient: recipientId },
      { status: 'Rejected' },
      { new: true }
    ).exec();

    // Remove the outgoing friend request
    await OutgoingFriendship.findOneAndDelete({ requester: requesterId, recipient: recipientId }).exec();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get friend requests for the current user
exports.getFriendRequests = async (req, res) => {
  const recipientId = req.user._id; // Assuming you have user info in req.user

  try {
    const requests = await IncomingFriendship.find({ recipient: recipientId, status: 'Pending' })
      .populate('requester', 'username')
      .exec();

    res.json(requests.map(request => ({
      requesterId: request.requester._id,
      requesterUsername: request.requester.username
    })));
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};