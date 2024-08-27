const User = require('../models/User');
const Request = require('../models/requestModel');

// Search Users Controller
exports.searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q.trim();
    const currentUser = req.user._id;

    const users = await User.find({
      $and: [
        { username: { $regex: `^${searchQuery}`, $options: 'i' } },
        { _id: { $ne: currentUser } }
      ]
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
  
    if (requesterId.equals(recipientId)) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
    }
  
    try {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found.' });
      }
  
      // Check if the request already exists (sent or received)
      const existingRequest = await Request.findOne({
        $or: [
          { requester: requesterId, recipient: recipientId },
          { requester: recipientId, recipient: requesterId }
        ]
      });
  
      if (existingRequest) {
        return res.status(400).json({ error: 'Friend request already exists.' });
      }
  
      // Create the request
      const request = new Request({
        requester: requesterId,
        recipient: recipientId
      });
  
      await request.save();
  
      res.status(200).json({ message: 'Friend request sent.', recipientId, username: recipient.username });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Internal server error.' });
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
  
