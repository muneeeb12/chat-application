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

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle status updates
    socket.on('statusUpdate', (statusData) => {
        // Emit status update to all connected clients
        io.emit('statusUpdate', statusData);
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
        // Broadcast message to the recipient
        io.to(message.recipient).emit('message', message);
        io.to(message.sender).emit('message', message); // Ensure sender also gets their own message
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
