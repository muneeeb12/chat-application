const path = require('path');
const User = require('../models/User'); // Ensure this path is correct
const bcrypt = require('bcrypt');

// Show home page
exports.showHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/home.html'));
};

// Show login page
exports.showLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
};

// Show register page
exports.showRegisterPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
};

// Registration controller
exports.registerUser = async (req, res) => {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();

        // Redirect to login after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
