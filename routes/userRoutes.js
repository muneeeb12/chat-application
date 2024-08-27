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

// Route to accept a friend request
router.post('/acceptrequest', usersController.acceptFriendRequest);

// Route to reject a friend request
router.post('/rejectrequest', usersController.rejectFriendRequest);

// Route to get the friend list
router.get('/friends', usersController.getFriendsList);

module.exports = router;
