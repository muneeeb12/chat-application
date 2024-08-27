const path = require('path');
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/UserModel');

// Show login page
exports.showLoginPage = (req, res) => {
    res.render('login'); // Render login.ejs
};

// Show register page
exports.showRegisterPage = (req, res) => {
    res.render('register'); // Render register.ejs
};

// Show set password page
exports.showSetPasswordPage = async (req, res) => {
    try {
        const userId = req.params.id;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.redirect('/auth/login');
        }

        const user = await User.findById(userId);
        if (!user || !user.isPending) {
            return res.redirect('/auth/login');
        }
        res.render('set-password', { userId }); // Render set-password.ejs with userId
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
            isPending: false // Registration complete
        });
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Handle login
exports.loginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/auth/login'); // Redirect if authentication fails

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                // Update user status to "Online"
                await User.findByIdAndUpdate(user._id, { status: 'Online' });

                // Redirect to the dashboard on successful login
                return res.redirect('/dashboard');
            } catch (error) {
                // Handle any errors during the update
                console.error('Error updating user status:', error);
                return next(error);
            }
        });
    })(req, res, next);
};

// Handle Google login
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Handle Google OAuth callback
exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) return next(err);

        if (info && info.message && info.message.startsWith('/auth/set-password/')) {
            return res.redirect(info.message); // Redirect to password setup page
        }

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                // Update user status to "Online"
                await User.findByIdAndUpdate(user._id, { status: 'Online' });

                // Redirect to the dashboard on successful login
                return res.redirect('/dashboard');
            } catch (error) {
                // Handle any errors during the update
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
        // Validate ObjectId
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

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isPending = false; 
        await User.findByIdAndUpdate(user._id, { status: 'Online' }); // Mark registration as complete
        await user.save();

        // Log in the user and redirect to dashboard
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

// Handle logout
exports.logoutUser = async (req, res, next) => {
    if (!req.user || !req.user._id) {
        console.error('User is not authenticated or user ID is missing');
        return res.redirect('/'); // Redirect to home if user is not authenticated
    }

    try {
        // Update user status to 'Offline'
        await User.findByIdAndUpdate(req.user._id, { status: 'Offline' });

        // Log out the user
        req.logout(err => {
            if (err) {
                console.error('Error during logout:', err);
                return next(err); // Pass the error to the next middleware
            }

            res.redirect('/'); // Redirect to home page after successful logout
        });
    } catch (error) {
        console.error('Error updating user status on logout:', error);
        return next(error); // Pass the error to the next middleware
    }
};
