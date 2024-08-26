// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to search for users
router.get('/search', userController.searchUsers);

router.post('/friends/request',userController.sendrequest)
router.post('/friends/accept',userController.acceptrequest)
router.post('/friends/reject',userController.rejectrequest);


module.exports = router;
