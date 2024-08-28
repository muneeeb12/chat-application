const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to show home page
router.get('/', homeController.showHomePage);

// Route to show dashboard page
router.get('/dashboard', authMiddleware, homeController.showDashboardPage);

// Test route for auth middleware
router.get('/test', authMiddleware, homeController.test);

module.exports = router;
