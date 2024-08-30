const express = require('express');

// Validation!
const { registerValidationRules, validate } = require('../middleware/validator');

// Controllers!!
const authController = require('../controllers/authController');
const chatController = require('../controllers/chatController');
const homeController = require('../controllers/homeController');
const usersController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


module.exports = {
    express,
    registerValidationRules,
    validate,
    authController,
    chatController,
    homeController,
    usersController,
    authMiddleware,
};