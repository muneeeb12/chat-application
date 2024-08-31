document.addEventListener('DOMContentLoaded', function () {
    const socket = io(); // Initialize Socket.IO

    const chatMessages = document.querySelector('#chatMessages');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#messageInput');
    const friendsList = document.querySelector('#onlineFriendsList');
    let currentRecipientId = null;

    // Get the logged-in user's ID from the template
    const loggedInUserId = document.querySelector('script[data-user-id]').dataset.userId;

    // Listen for incoming messages
    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    socket.on('message', (message) => {
        if (message.recipient === currentRecipientId || message.sender === loggedInUserId) {
            displayMessage(message);
        }
    });

    messageForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission
        const messageContent = messageInput.value.trim();
        if (messageContent && currentRecipientId) {
            const message = {
                sender: loggedInUserId,
                recipient: currentRecipientId,
                content: messageContent
            };

            // Send the message via Socket.IO
            socket.emit('message', message);
            displayMessage({ ...message, senderName: 'You' }); // Display the sent message
            messageInput.value = ''; // Clear the input field
        }
    });

    // Initialize friends list
    async function initFriendsList() {
        try {
            const response = await fetch('/users/friends');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const friends = await response.json();
            friendsList.innerHTML = ''; // Clear the list before adding new items
            friends.forEach(friend => {
                const friendItem = document.createElement('li');
                friendItem.className = 'list-group-item';
                friendItem.dataset.userId = friend._id;
                friendItem.innerHTML = `${friend.username} <span class="status-dot ${friend.status.toLowerCase()}"></span>`;
                friendsList.appendChild(friendItem);
            });
        } catch (error) {
            console.error('Error initializing friends list:', error);
        }
    }

    initFriendsList();

    // Function to display a message in the chat UI
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `<strong>${message.sender === loggedInUserId ? 'You' : message.senderName}</strong>: ${message.content}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    friendsList.addEventListener('click', (event) => {
        const friendItem = event.target.closest('li');
        if (friendItem) {
            currentRecipientId = friendItem.dataset.userId;

            // Join the room for this recipient
            socket.emit('joinRoom', { roomId: currentRecipientId });

            messageForm.style.display = 'block'; // Show the input form
            loadMessages(); // Load previous messages when a conversation is selected
        }
    });

    async function loadMessages() {
        if (currentRecipientId) {
            chatMessages.innerHTML = ''; // Clear the chat box before loading new messages
            try {
                const response = await fetch(`/chat/history/${currentRecipientId}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                }
                
                const messages = await response.json();
                messages.forEach(message => {
                    displayMessage({
                        sender: message.sender._id,
                        senderName: message.sender._id === loggedInUserId ? 'You' : message.sender.username,
                        content: message.content,
                        recipient: message.recipient._id
                    });
                });
    
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }
    }
});
