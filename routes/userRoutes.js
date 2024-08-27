const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

// Search users
router.get('/search', usersController.searchUsers);

// Send friend request
router.post('/sendrequest', usersController.sendFriendRequest);

// Get outgoing friend requests
router.get('/outgoingrequests', usersController.getOutgoingRequests);

// Get incoming friend requests
router.get('/incomingrequests', usersController.getIncomingRequests);


module.exports = router;
