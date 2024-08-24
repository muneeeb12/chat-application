document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const socket = io('/chat');

    // Listen for messages from the server
    socket.on('message', (message) => {
        console.log('Message received:', message);
        const chatMessagesContainer = document.querySelector('#chat-messages');
        chatMessagesContainer.innerHTML += `<p>${message}</p>`;
    });

    // Send a message to the server
    const sendMessageButton = document.querySelector('#send-message');
    sendMessageButton.addEventListener('click', () => {
        console.log('Send button clicked');
        const messageInput = document.querySelector('#message');
        const message = messageInput.value.trim();

        if (message) {
            console.log('Sending message:', message);
            socket.emit('message', message);
            messageInput.value = ''; // Clear the input after sending
        }
    });
});
