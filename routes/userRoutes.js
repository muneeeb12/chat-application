// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to search for users
router.get('/search', userController.searchUsers);

module.exports = router;
