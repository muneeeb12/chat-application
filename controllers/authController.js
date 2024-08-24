const path = require('path');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Show login page
exports.showLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
};

// Show register page
exports.showRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
};

// Handle user registration
exports.registerUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Handle local login
exports.loginUser = passport.authenticate('local', {
    successRedirect: '/chat',
    failureRedirect: '/auth/login',
    failureFlash: true
});

// Handle Google login
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Handle Google OAuth callback
exports.googleCallback = passport.authenticate('google', {
    successRedirect: '/chat',
    failureRedirect: '/auth/login'
});

// Handle logout
exports.logoutUser = (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};
