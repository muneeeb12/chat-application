const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

// Search users
router.get('/search', usersController.searchUsers);

// Send a friend request
router.post('/friends/request', usersController.sendFriendRequest);

// Accept a friend request
router.post('/friends/accept', usersController.acceptFriendRequest);

// Reject a friend request
router.post('/friends/reject', usersController.rejectFriendRequest);

// Get friend requests
router.get('/friends/requests', usersController.getFriendRequests);

module.exports = router;
