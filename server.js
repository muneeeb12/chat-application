const express = require('express');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const connectDb = require('./config/dbConnection'); // Ensure this path is correct

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "static" directory
app.use(express.static(path.join(__dirname, 'static')));

// Use routes
app.use('/', require('./routes/homeRoutes'));

// Serve the chat page
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

connectDb(); // Connect to the database

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

const io = new Server(server);
const chatNamespace = io.of('/chat');

chatNamespace.on('connection', (socket) => {
    console.log('A user connected to the chat namespace');
  
    socket.on('message', (message) => {
        chatNamespace.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected from the chat namespace');
    });
});
