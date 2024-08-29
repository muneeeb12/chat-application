document.addEventListener('DOMContentLoaded', function () {
    const socket = io(); // Initialize Socket.io

    const chatMessages = document.querySelector('#chatMessages');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#messageInput');
    const friendsList = document.querySelector('#onlineFriendsList'); // Reference to the friends list

    // Listen for incoming messages
    socket.on('message', displayMessage);

    // Handle form submission to send a message
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chatMessage', { text: message });
            messageInput.value = '';
            messageInput.focus();
        }
    });

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `<strong>${message.user || 'Unknown'}</strong>: ${message.text}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load Friends List
    async function loadFriendsList() {
        try {
            const response = await fetch('/users/friends');
            const friends = await response.json();
            friendsList.innerHTML = '';
            if (friends.length > 0) {
                friends.forEach(friend => {
                    const friendItem = document.createElement('li');
                    friendItem.classList.add('list-group-item');

                    const friendLink = document.createElement('a');
                    friendLink.href = '#';
                    friendLink.textContent = friend.username;

                    const statusIndicator = document.createElement('span');
                    statusIndicator.className = friend.status === 'Online' ? 'status-dot online' : 'status-dot offline';

                    friendLink.appendChild(statusIndicator);
                    friendLink.addEventListener('click', () => updateChatHeader(friend.username));
                    friendItem.appendChild(friendLink);
                    friendsList.appendChild(friendItem);
                });
            } else {
                friendsList.innerHTML = '<li class="list-group-item">No friends yet.</li>';
            }
        } catch (error) {
            console.error('Error loading friends list:', error);
        }
    }

    function updateChatHeader(friendName) {
        document.querySelector('#chatHeader').textContent = friendName;
    }

    loadFriendsList(); // Initial Load
});
