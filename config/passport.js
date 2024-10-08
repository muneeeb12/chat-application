const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Local strategy: Authenticate users using email and password
passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google strategy: Authenticate users using Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            if (user.isPending) {
                // User has not set a password yet, redirect to set password page
                return done(null, user, { message: `/auth/set-password/${user._id}` });
            }
            // User is fully registered, redirect to dashboard
            return done(null, user, { message: '/dashboard' });
        } 

        // New user, create account and mark as pending registration
        user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            isPending: true, // Mark user as pending until they set a password
        });
        await user.save();
        return done(null, user, { message: `/auth/set-password/${user._id}` });
        
    } catch (err) {
        return done(err);
    }
}));

module.exports = passport;
