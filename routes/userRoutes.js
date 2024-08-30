const app = require("../importFiles/importFiles");
const router = app.express.Router();

// Search users
router.get('/search', app.usersController.searchUsers);

// Send friend request
router.post('/sendrequest', app.usersController.sendFriendRequest);

// Get outgoing friend requests
router.get('/outgoingrequests', app.usersController.getOutgoingRequests);

// Get incoming friend requests
router.get('/incomingrequests', app.usersController.getIncomingRequests);

// Route to accept a friend request
router.post('/acceptrequest', app.usersController.acceptFriendRequest);

// Route to reject a friend request
router.post('/rejectrequest', app.usersController.rejectFriendRequest);

// Route to get the friend list
router.get('/friends', app.usersController.getFriendsList);

module.exports = router;
