document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.querySelector('#searchInput');
  const searchButton = document.querySelector('#search-button');
  const searchResults = document.querySelector('#searchResults');
  const incomingRequestsList = document.querySelector('#incomingRequests');
  const friendsList = document.querySelector('#friendsList');
  //const loggedInUserId = '<%= user._id %>'; // Ensure this is rendered correctly from EJS

  // Load Incoming Friend Requests
  async function loadIncomingRequests() {
    try {
      const response = await fetch('/users/incomingrequests');
      const incomingRequests = await response.json();
      incomingRequestsList.innerHTML = '';
      if (incomingRequests.length > 0) {
        incomingRequests.forEach(request => {
          const incomingRequestItem = document.createElement('li');
          incomingRequestItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
          incomingRequestItem.innerHTML = `
            ${request.requester.username}
            <div class="btn-group">
              <button class="btn btn-sm btn-success accept-request-button" data-id="${request._id}">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn btn-sm btn-danger reject-request-button" data-id="${request._id}">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `;
          incomingRequestsList.appendChild(incomingRequestItem);
        });
      } else {
        incomingRequestsList.innerHTML = '<li class="list-group-item">No incoming requests.</li>';
      }
    } catch (error) {
      console.error('Error loading incoming requests:', error);
    }
  }

  // Load Friends List
  async function loadFriendsList() {
    friendsList.innerHTML = '<li class="list-group-item">Loading friends...</li>';
    
    try {
      const response = await fetch('/users/friends');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const friends = await response.json();
      friendsList.innerHTML = '';

      if (friends.length > 0) {
        const fragment = document.createDocumentFragment();

        friends.forEach(friend => {
          const friendItem = document.createElement('li');
          friendItem.classList.add('list-group-item');

          // Create link element
          const friendLink = document.createElement('a');
          friendLink.href = `/chat/page/${loggedInUserId}`; // Use logged-in user ID for the link
          friendLink.textContent = friend.username;

          // Apply link styles
          Object.assign(friendLink.style, {
            color: '#007bff',
            textDecoration: 'none',
            display: 'block',
            padding: '10px'
          });

          // Add hover effect on the list item
          friendItem.style.position = 'relative';
          friendItem.style.cursor = 'pointer';
          friendItem.addEventListener('mouseover', () => {
            friendItem.style.backgroundColor = '#f0f0f0';
          });
          friendItem.addEventListener('mouseout', () => {
            friendItem.style.backgroundColor = '';
          });

          // Append link to list item and to the fragment
          friendItem.appendChild(friendLink);
          fragment.appendChild(friendItem);
        });

        friendsList.appendChild(fragment);
      } else {
        friendsList.innerHTML = '<li class="list-group-item">No friends yet.</li>';
      }
    } catch (error) {
      console.error('Error loading friends list:', error);
      friendsList.innerHTML = '<li class="list-group-item">Error loading friends list.</li>';
    }
  }

  // Perform User Search
  async function performSearch() {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      try {
        const response = await fetch(`/users/search?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        searchResults.innerHTML = '';
        if (users.length > 0) {
          users.forEach(user => {
            const resultItem = document.createElement('li');
            resultItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            resultItem.innerHTML = `
              ${user.username}
              <button class="btn btn-sm ${user.hasSentRequest ? 'btn-warning' : 'btn-primary'} send-request-button" data-id="${user._id}">
                ${user.hasSentRequest ? 'Request Sent' : 'Add Friend'}
              </button>
            `;
            searchResults.appendChild(resultItem);
          });
        } else {
          searchResults.innerHTML = '<li class="list-group-item">No users found.</li>';
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      searchResults.innerHTML = '';
    }
  }

  // Handle Friend Request (Accept/Reject)
  async function handleFriendRequest(requestId, action, listItem) {
    try {
      const response = await fetch(`/users/${action.toLowerCase()}request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      listItem.remove();

      if (action === 'accept') {
        loadFriendsList();
      }
    } catch (error) {
      console.error(`Error handling friend request (${action}):`, error);
    }
  }

  // Send Friend Request
  async function sendFriendRequest(recipientId, button) {
    try {
      const response = await fetch('/users/sendrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId })
      });

      if (response.ok) {
        button.textContent = 'Request Sent';
        button.classList.remove('btn-primary');
        button.classList.add('btn-warning');
      } else {
        const result = await response.json();
        console.error('Error sending friend request:', result.error);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  }

  // Event Listeners
  searchInput.addEventListener('input', performSearch);
  searchResults.addEventListener('click', function (event) {
    if (event.target.closest('.send-request-button')) {
      const button = event.target.closest('.send-request-button');
      const recipientId = button.getAttribute('data-id');
      sendFriendRequest(recipientId, button);
    }
  });

  incomingRequestsList.addEventListener('click', function (event) {
    if (event.target.closest('.accept-request-button')) {
      const button = event.target.closest('.accept-request-button');
      const requestId = button.getAttribute('data-id');
      handleFriendRequest(requestId, 'accept', button.closest('li'));
    } else if (event.target.closest('.reject-request-button')) {
      const button = event.target.closest('.reject-request-button');
      const requestId = button.getAttribute('data-id');
      handleFriendRequest(requestId, 'reject', button.closest('li'));
    }
  });

  // Initial Load
  loadIncomingRequests();
  loadFriendsList();
});
