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
    socket.on('message', (message) => {
        if (message.recipient === currentRecipientId || message.sender === loggedInUserId) {
            displayMessage(message);
        }
    });

    // Listen for online status updates
    socket.on('statusUpdate', (userStatus) => {
        updateFriendStatus(userStatus);
    });

    // Handle form submission to send a message
    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const message = messageInput.value.trim();
        if (message.length > 0 && currentRecipientId) {
            const messageData = {
                recipient: currentRecipientId,
                content: message,
                sender: loggedInUserId
            };

            // Display message immediately for the sender
            displayMessage({ ...messageData, senderName: 'You' });

            try {
                // Send message via API
                await fetch('/chat/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messageData)
                });

                // Emit message via Socket.IO
                socket.emit('chatMessage', {
                    recipient: currentRecipientId,
                    sender: loggedInUserId,
                    text: message
                });

                messageInput.value = '';
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    });

    // Function to display a message in the chat UI
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `<strong>${message.sender === loggedInUserId ? 'You' : message.senderName}</strong>: ${message.content}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to update a friend's status
    function updateFriendStatus(userStatus) {
        const friendItems = friendsList.querySelectorAll('.list-group-item');
        friendItems.forEach(item => {
            if (item.dataset.userId === userStatus._id) {
                const statusDot = item.querySelector('.status-dot');
                if (statusDot) {
                    statusDot.className = `status-dot ${userStatus.status.toLowerCase()}`;
                }
            }
        });
    }

    // Function to load chat messages
    async function loadMessages() {
        if (currentRecipientId) {
            chatMessages.innerHTML = ''; // Clear the chat box before loading new messages
            try {
                const response = await fetch(`/chat/${currentRecipientId}`);
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

    friendsList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            currentRecipientId = event.target.dataset.userId;
            
            // Ensure chatHeader exists
            const chatHeader = document.querySelector('#chatHeader');
            if (chatHeader) {
                chatHeader.textContent = event.target.textContent;
            } else {
                console.error('Chat header not found');
            }
    
            loadMessages(); // Load messages when a conversation is selected
        }
    });

    // Initialize friends list
    async function initFriendsList() {
        try {
            const response = await fetch('/users/friends'); // Adjust endpoint as needed
            const friends = await response.json();
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
});
