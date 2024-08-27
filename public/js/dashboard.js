document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.querySelector('#searchInput');
  const searchButton = document.querySelector('#search-button');
  const searchResults = document.querySelector('#searchResults');
  const incomingRequestsList = document.querySelector('#incomingRequests');
  const friendsList = document.querySelector('#friendsList');

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
    try {
      const response = await fetch('/users/friends');
      console.log(response);
      const friends = await response.json();
      friendsList.innerHTML = '';
      if (friends.length > 0) {
        friends.forEach(friend => {
          const friendItem = document.createElement('li');
          friendItem.classList.add('list-group-item');
          friendItem.textContent = friend.username;
          friendsList.appendChild(friendItem);
        });
      } else {
        friendsList.innerHTML = '<li class="list-group-item">No friends yet.</li>';
      }
    } catch (error) {
      console.error('Error loading friends list:', error);
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
      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      listItem.remove(); // Remove the item from the list

      if (action === 'accept') {
        // Reload the friends list to reflect the new friend
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
