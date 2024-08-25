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

// Show set password page
exports.showSetPasswordPage = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.isPending) {
            return res.redirect('/auth/login');
        }
        res.sendFile(path.join(__dirname, '../views/set-password.html'));
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

// Handle local login
exports.loginUser = passport.authenticate('local', {
    successRedirect: '/chat',
    failureRedirect: '/auth/login',
    failureFlash: true
});

// Handle Google login
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Handle Google OAuth callback
// Handle Google OAuth callback
exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/auth/login');
        
        // Check if the user is pending registration
        if (user.isPending) {
            return res.redirect(`/auth/set-password/${user._id}`); // Redirect to password setup page
        }
        
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/chat'); // Redirect to chat if user is logged in
        });
    })(req, res, next);
};

// Handle password setup
exports.setPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user || !user.isPending) {
            return res.redirect('/auth/login');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isPending = false; // Mark registration as complete
        await user.save();
        
        // Log in the user and redirect to chat
        req.login(user, err => {
            if (err) {
                return res.redirect('/auth/login');
            }
            res.redirect('/chat');
        });
    } catch (error) {
        console.error('Error during password setup:', error);
        res.status(500).json({ message: 'Server error during password setup' });
    }
};

// Handle logout
exports.logoutUser = (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};
