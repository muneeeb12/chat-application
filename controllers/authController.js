const path = require('path');
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');

// Show login page
exports.showLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
};

// Show register page
exports.showRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
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
        res.render('set-password', { userId }); // Adjusted to use the view name directly
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

exports.loginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/auth/login'); // Redirect if authentication fails

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                // Update user status to "Online"
                await User.findByIdAndUpdate(user._id, { status: 'Online' });

                // Redirect to the chat page on successful login
                return res.redirect('/dashboard');
            } catch (error) {
                // Handle any errors during the update
                console.error('Error updating user status:', error);
                return next(error);
            }
        });
    })(req, res, next);
};
// Handle local login

// exports.loginUser = passport.authenticate('local', {
    
//     successRedirect: '/dashboard',
//     failureRedirect: '/auth/login',
//     failureFlash: true
// });


// Handle Google login
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Handle Google OAuth callback
exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) return next(err);

        if (info && info.message && info.message.startsWith('/auth/set-password/')) {
            return res.redirect(info.message); // Redirect to password setup page
        }

        if (!user) return res.redirect('/auth/login');

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/dashboard'); // Redirect to dashboard if user is logged in
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
        await User.findByIdAndUpdate(user._id, { status: 'Online' });// Mark registration as complete
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
exports.logoutUser = (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, { status: 'Offline' }, (err) => {
        if (err) {
            console.error('Error updating user status on logout:', err);
        }
        req.logout(err => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });
};
