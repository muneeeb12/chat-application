const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, validate } = require('../middleware/validator');

// Registration routes
router.get('/register', authController.showRegisterPage);
router.post('/register', registerValidationRules(), validate, authController.registerUser);

// Local login routes
router.get('/login', authController.showLoginPage);
router.post('/login', authController.loginUser);

// Google OAuth routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// Password setup routes
router.get('/set-password/:id', authController.showSetPasswordPage);
router.post('/set-password/:id', authController.setPassword);

// Logout route
router.get('/logout', authController.logoutUser);

module.exports = router;
