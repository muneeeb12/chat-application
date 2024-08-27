const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to show home page
router.get('/', homeController.showHomePage);
router.get('/dashboard', homeController.showDashboardPage);
router.get('/test',authMiddleware ,homeController.test);

module.exports = router;
