document.addEventListener('DOMContentLoaded', function () {
    const socket = io(); // Initialize Socket.io

    const chatMessages = document.querySelector('#chatMessages');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#messageInput');
    const friendsList = document.querySelector('#onlineFriendsList'); // Reference to the friends list
    const emojiButton = document.createElement('span'); // Emoji button
    const emojiPicker = document.createElement('div'); // Emoji picker

    // Create emoji button
    emojiButton.innerHTML = '😀'; // Emoji icon
    emojiButton.className = 'emoji-button';
    messageForm.appendChild(emojiButton);

    // Create emoji picker
    const emojis = ['😀', '😂', '😍', '😢', '😡', '👍', '👎', '🎉', '❤️', '🙌'];
    emojiPicker.className = 'emoji-picker';
    emojis.forEach(emoji => {
        const emojiElement = document.createElement('span');
        emojiElement.className = 'emoji';
        emojiElement.textContent = emoji;
        emojiElement.addEventListener('click', () => {
            messageInput.value += emoji; // Add emoji to input
            emojiPicker.style.display = 'none'; // Hide the picker after selection
        });
        emojiPicker.appendChild(emojiElement);
    });
    document.body.appendChild(emojiPicker); // Append emoji picker to the body

    // Show/hide emoji picker on button click
    emojiButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event from bubbling up
        emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';

        // Position the emoji picker above the button
        const rect = emojiButton.getBoundingClientRect();
        emojiPicker.style.left = `${rect.left}px`;
        emojiPicker.style.top = `${rect.top - emojiPicker.offsetHeight}px`; // Position above the button
    });

    // Hide emoji picker when clicking outside
    document.addEventListener('click', () => {
        emojiPicker.style.display = 'none';
    });

    // Listen for incoming messages
    socket.on('message', (message) => {
        displayMessage(message);
    });

    // Handle form submission to send a message
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

        const message = messageInput.value.trim();
        if (message.length > 0) {
            socket.emit('chatMessage', { text: message }); // Send message to server
            messageInput.value = ''; // Clear input
            messageInput.focus(); // Focus back on input
        }
    });

    // Function to display a message in the chat
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `<strong>${message.user || 'Unknown'}</strong>: ${message.text}`;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    // Load Friends List
    async function loadFriendsList() {
        try {
            const response = await fetch('/users/friends'); // Fetch friends list from server
            const friends = await response.json();
            friendsList.innerHTML = '';
            if (friends.length > 0) {
                friends.forEach(friend => {
                    const friendItem = document.createElement('li');
                    friendItem.classList.add('list-group-item');

                    // Create link element
                    const friendLink = document.createElement('a');
                    friendLink.href = '#'; // Prevent default link behavior
                    friendLink.textContent = friend.username;

                    // Create online status indicator
                    const statusIndicator = document.createElement('span');
                    statusIndicator.className = friend.status === 'Online' ? 'status-dot online' : 'status-dot offline';

                    // Append status indicator to the link
                    friendLink.appendChild(statusIndicator);

                    // Append click event to update chat header
                    friendLink.addEventListener('click', () => {
                        updateChatHeader(friend.username); // Update chat header with friend's name
                    });

                    // Append link to list item
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

    // Function to update the chat header
    function updateChatHeader(friendName) {
        const chatHeader = document.querySelector('#chatHeader'); // Assuming you have a header element
        chatHeader.textContent = `${friendName}`; // Update header text
    }

    // Initial Load
    loadFriendsList(); // Load friends list when the chat is initialized
});
