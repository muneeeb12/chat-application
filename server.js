const http = require('http');
const express = require('express');
const path = require('path');
const passport = require('./config/passport');
const session = require('express-session');
const socketIO = require('./config/socket');
require('dotenv').config();

const connectDb = require('./config/dbConnection');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up express-session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Adjust according to your environment (secure: true for HTTPS)
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/', require('./routes/homeRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/chat', require('./routes/chatRoutes'));

connectDb(); // Connect to the database

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
