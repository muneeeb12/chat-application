const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Route to show home page
router.get('/', homeController.showHomePage);

module.exports = router;
