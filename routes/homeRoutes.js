const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { registerValidationRules, validate } = require('../middleware/validator'); // Adjust import path as needed

// Routes
router.get('/', homeController.showHomePage);
router.get('/login', homeController.showLoginPage);
router.get('/register', homeController.showRegisterPage);
router.post('/register', registerValidationRules(), validate, homeController.registerUser);

module.exports = router;
