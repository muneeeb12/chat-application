const { Server } = require("socket.io");

module.exports = function (server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle joining rooms for real-time updates
        socket.on('joinRooms', ({ userId }) => {
            // Join the user's room to receive updates related to them
            socket.join(userId);
        });

        // Handle sending messages
        socket.on('message', (message) => {
            // Emit the message to the recipient's room
            io.to(message.recipient).emit('message', {
                sender: message.sender,
                senderName: 'Some User', // Fetch the sender's name from the database
                content: message.content,
                recipient: message.recipient
            });

        });

        // Handle user status updates
        socket.on('updateStatus', ({ userId, status }) => {
            // Broadcast the status update to all friends (rooms the user belongs to)
            io.to(userId).emit('updateStatus', { userId, status });
        });

        // Handle disconnects
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            // Perform any necessary cleanup, like setting the user status to offline
        });
    });

    return io;
};
