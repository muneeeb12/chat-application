const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, validate } = require('../middleware/validator'); // Adjust import path as needed

// Registration routes
router.get('/register', authController.showRegisterPage);
router.post('/register', registerValidationRules(), validate, authController.registerUser);

// Local login routes
router.get('/login', authController.showLoginPage);
router.post('/login', authController.loginUser);

// Google OAuth routes
router.get('/auth/google', authController.googleLogin);
router.get('/auth/google/callback', authController.googleCallback);

// Logout route
router.get('/logout', authController.logoutUser);

module.exports = router;
