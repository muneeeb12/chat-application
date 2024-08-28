const User = require('../models/UserModel');
const Request = require('../models/requestModel');
const Friendship = require('../models/FriendshipModel')

// Search Users Controller
exports.searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q?.trim();
    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required.' });
    }
    const currentUser = req.user._id;

    // Get friends of the current user
    const friends = await Friendship.find({
      $or: [{ user1: currentUser }, { user2: currentUser }]
    }).lean();
    const friendIds = friends.map(friend => (friend.user1.equals(currentUser) ? friend.user2 : friend.user1));

    const users = await User.find({
      username: { $regex: `^${searchQuery}`, $options: 'i' },
      _id: { $ne: currentUser, $nin: friendIds }
    })
    .select('username _id')
    .limit(5);

    const outgoingRequests = await Request.find({ requester: currentUser })
      .select('recipient')
      .lean();

    const usersWithRequestStatus = users.map(user => {
      const hasSentRequest = outgoingRequests.some(req => req.recipient.equals(user._id));
      return { ...user._doc, hasSentRequest };
    });

    res.json(usersWithRequestStatus);
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send Friend Request Controller
exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  const requesterId = req.user._id;

  if (!recipientId) {
    return res.status(400).json({ error: 'Recipient ID is required.' });
  }

  if (requesterId.equals(recipientId)) {
    return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
  }

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    const existingRequest = await Request.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists.' });
    }

    const request = new Request({ requester: requesterId, recipient: recipientId });
    await request.save();

    res.status(200).json({ message: 'Friend request sent.', recipientId, username: recipient.username });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch Outgoing Requests Controller
exports.getOutgoingRequests = async (req, res) => {
  try {
    const outgoingRequests = await Request.find({ requester: req.user._id })
      .populate('recipient', 'username _id')
      .lean();

    res.json(outgoingRequests);
  } catch (error) {
    console.error('Error fetching outgoing requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch Incoming Requests Controller
exports.getIncomingRequests = async (req, res) => {
  try {
    const incomingRequests = await Request.find({ recipient: req.user._id })
      .populate('requester', 'username _id')
      .lean();

    res.json(incomingRequests);
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required.' });
  }

  try {
    // Find the request to update
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    // Update the request status to 'Accepted'
    await Request.findByIdAndUpdate(requestId, { status: 'Accepted' }, { new: true });

    // Create friendships for both users
    await Friendship.create([
      { user1: request.requester, user2: request.recipient }
    ]);

    // Remove the request from the request collection
    await Request.deleteOne({ _id: requestId });

    res.status(200).json({ message: 'Friend request accepted successfully.' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request.' });
  }
};

// Reject a friend request
exports.rejectFriendRequest = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required.' });
  }

  try {
    // Find the request to update
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    // Update the request status to 'Rejected'
    await Request.findByIdAndUpdate(requestId, { status: 'Rejected' }, { new: true });

    // Remove the request from the request collection
    await Request.deleteOne({ _id: requestId });

    res.status(200).json({ message: 'Friend request rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Failed to reject friend request.' });
  }
};

// Fetch the friend list for the logged-in user
exports.getFriendsList = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find friendships where the user is either user1 or user2
    const friendships = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).populate('user1 user2', 'username _id status');

    // Map friendships to extract the friend's information along with status
    const friends = friendships.map(friendship => {
      if (friendship.user1._id.equals(userId)) {
        return {
          _id: friendship.user2._id,
          username: friendship.user2.username,
          status: friendship.user2.status
        };
      } else {
        return {
          _id: friendship.user1._id,
          username: friendship.user1.username,
          status: friendship.user1.status
        };
      }
    });

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
