document.addEventListener('DOMContentLoaded', function () {
    // Create and append CSS styles
    const style = document.createElement('style');
    style.textContent = `
        /* Style for the online friends list */
        #onlineFriendsList {
            list-style-type: none;
            padding: 0;
            background-color: #333; /* Dark gray for the container */
            border-radius: 5px; /* Rounded corners */
            padding: 10px; /* Padding around the list */
        }

        .list-group-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #444; /* Dark gray for each friend box */
            border-radius: 5px; /* Rounded corners */
            margin: 5px 0; /* Space between items */
            transition: background-color 0.3s; /* Smooth transition for hover effect */
        }

        /* Status dot styles */
        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-left: 20px; /* Space between name and dot */
        }

        .online {
            background-color: green; /* Green for online */
        }

        .offline {
            background-color: gray; /* Gray for offline */
        }

        /* Hover effect for friend boxes */
        .list-group-item:hover {
            background-color: black; /* Change to black on hover */
        }

        /* Link styles */
        a {
            color: #007bff; /* Default link color */
            text-decoration: none; /* Remove underline */
            display: flex; /* Use flex for alignment */
            align-items: center; /* Center items vertically */
            padding: 10px; /* Padding inside the link */
            width: 100%; /* Full width */
        }

        a:hover {
            color: #0056b3; /* Darker color on link hover */
        }

        /* Emoji picker styles */
        .emoji-button {
            cursor: pointer;
            margin-left: 10px;
            font-size: 20px;
        }

        .emoji-picker {
            display: none;
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 10px;
            z-index: 1000;
            max-width: 300px;
            overflow: auto;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-top: -5px; /* Adjust positioning */
        }

        .emoji {
            cursor: pointer;
            font-size: 24px;
            margin: 5px;
        }
    `;
    document.head.appendChild(style); // Append styles to the head

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

    // Check if friendsList is null
    console.log('friendsList:', friendsList); // Debugging line

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
            const response = await fetch('/users/friends');
            const friends = await response.json();
            friendsList.innerHTML = '';
            if (friends.length > 0) {
                friends.forEach(friend => {
                    const friendItem = document.createElement('li');
                    friendItem.classList.add('list-group-item');

                    // Create link element
                    const friendLink = document.createElement('a');
                    friendLink.href = `/chat/page/${friend._id}`;
                    friendLink.textContent = friend.username;

                    // Create online status indicator
                    const statusIndicator = document.createElement('span');
                    statusIndicator.className = friend.status === 'online' ? 'status-dot online' : 'status-dot offline';

                    // Append status indicator to the link
                    friendLink.appendChild(statusIndicator);

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

    // Initial Load
    loadFriendsList(); // Load friends list when the chat is initialized
});
