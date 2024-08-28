const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const path = require('path');
const passport = require('./config/passport'); // Adjust path if necessary
const session = require('express-session');
require('dotenv').config();

const connectDb = require('./config/dbConnection');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

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
    cookie: { secure: false }
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

// Handle socket connection
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
  
    // Listen for chat messages
    socket.on('chatMessage', (msg) => {
      io.emit('message', msg); // Broadcast message to all clients
    });
  
  });
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

