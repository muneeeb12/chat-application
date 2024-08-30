const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/UserModel');

// Render the login page
exports.showLoginPage = (req, res) => {
    res.render('login');
};

// Render the registration page
exports.showRegisterPage = (req, res) => {
    res.render('register');
};

// Render the set password page
exports.showSetPasswordPage = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.redirect('/auth/login');
        }

        const user = await User.findById(userId);
        if (!user || !user.isPending) {
            return res.redirect('/auth/login');
        }

        res.render('set-password', { userId });
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Server error retrieving user' });
    }
};

// Handle user registration
exports.registerUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isPending: false,
        });

        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Handle user login
exports.loginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/auth/login');

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                await User.findByIdAndUpdate(user._id, { status: 'Online' });
                res.redirect('/dashboard');
            } catch (error) {
                console.error('Error updating user status:', error);
                return next(error);
            }
        });
    })(req, res, next);
};

// Handle Google OAuth login
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Handle Google OAuth callback
exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) return next(err);

        if (info?.message?.startsWith('/auth/set-password/')) {
            return res.redirect(info.message);
        }

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                await User.findByIdAndUpdate(user._id, { status: 'Online' });
                res.redirect('/dashboard');
            } catch (error) {
                console.error('Error updating user status:', error);
                return next(error);
            }
        });
    })(req, res, next);
};

// Handle password setup
exports.setPassword = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.redirect('/auth/login');
        }

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findById(userId);

        if (!user || !user.isPending) {
            return res.redirect('/auth/login');
        }

        user.password = await bcrypt.hash(password, 10);
        user.isPending = false;

        await user.save();
        await User.findByIdAndUpdate(user._id, { status: 'Online' });

        req.login(user, err => {
            if (err) {
                console.error('Error during login:', err);
                return res.redirect('/auth/login');
            }
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error('Error during password setup:', error);
        res.status(500).json({ message: 'Server error during password setup' });
    }
};

// Handle user logout
exports.logoutUser = async (req, res, next) => {
    if (!req.user || !req.user._id) {
        console.error('User is not authenticated or user ID is missing');
        return res.redirect('/');
    }

    try {
        await User.findByIdAndUpdate(req.user._id, { status: 'Offline' });

        req.logout(err => {
            if (err) {
                console.error('Error during logout:', err);
                return next(err);
            }

            res.redirect('/');
        });
    } catch (error) {
        console.error('Error updating user status on logout:', error);
        return next(error);
    }
};
