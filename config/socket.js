const { Server } = require('socket.io');

module.exports = function (server) {
    const io = new Server(server);

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

    return io;
};
