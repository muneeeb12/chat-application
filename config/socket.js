const socketIO = require('socket.io');
const DirectMessage = require('../models/DirectMessageModel'); // Assuming this is your message model

module.exports = function (server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Listen for 'message' events from clients
        socket.on('message', async (msg) => {
            try {
                // Save the message to the database
                const newMessage = new DirectMessage(msg);
                await newMessage.save();

                // Broadcast the message to the recipient
                io.to(msg.recipient).emit('message', {
                    _id: newMessage._id,
                    sender: newMessage.sender,
                    recipient: newMessage.recipient,
                    content: newMessage.content,
                    sentAt: newMessage.sentAt,
                    senderName: msg.senderName // Assuming senderName is passed with the message
                });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    return io;
};
