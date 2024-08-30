document.addEventListener('DOMContentLoaded', function () {
  // Cache DOM elements
  const searchInput = document.querySelector('#searchInput');
  const searchButton = document.querySelector('#search-button');
  const searchResults = document.querySelector('#searchResults');
  const incomingRequestsList = document.querySelector('#incomingRequests');
  const friendsList = document.querySelector('#friendsList');
  // const loggedInUserId = '<%= user._id %>'; // Ensure this is rendered correctly from EJS

  // Function to load incoming friend requests
  async function loadIncomingRequests() {
    try {
      const response = await fetch('/users/incomingrequests');
      const incomingRequests = await response.json();
      incomingRequestsList.innerHTML = '';

      if (incomingRequests.length > 0) {
        incomingRequests.forEach(request => {
          const item = createIncomingRequestItem(request);
          incomingRequestsList.appendChild(item);
        });
      } else {
        incomingRequestsList.innerHTML = '<li class="list-group-item">No incoming requests.</li>';
      }
    } catch (error) {
      console.error('Error loading incoming requests:', error);
    }
  }

  // Function to create a list item for incoming requests
  function createIncomingRequestItem(request) {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    item.innerHTML = `
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
    return item;
  }

  // Function to load friends list
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
          const item = createFriendItem(friend);
          fragment.appendChild(item);
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

  // Function to create a list item for friends
  function createFriendItem(friend) {
    const item = document.createElement('li');
    item.classList.add('list-group-item');

    const link = document.createElement('a');
    link.href = `/chat/${loggedInUserId}`; // Use logged-in user ID for the link
    link.textContent = friend.username;
    link.style.cssText = 'color: #007bff; text-decoration: none; display: block; padding: 10px;';
    
    item.style.cssText = 'position: relative; cursor: pointer;';
    item.addEventListener('mouseover', () => {
      item.style.backgroundColor = '#f0f0f0';
    });
    item.addEventListener('mouseout', () => {
      item.style.backgroundColor = '';
    });

    item.appendChild(link);
    return item;
  }

  // Function to perform user search
  async function performSearch() {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      try {
        const response = await fetch(`/users/search?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        searchResults.innerHTML = '';

        if (users.length > 0) {
          users.forEach(user => {
            const item = createSearchResultItem(user);
            searchResults.appendChild(item);
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

  // Function to create a list item for search results
  function createSearchResultItem(user) {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    item.innerHTML = `
      ${user.username}
      <button class="btn btn-sm ${user.hasSentRequest ? 'btn-warning' : 'btn-primary'} send-request-button" data-id="${user._id}">
        ${user.hasSentRequest ? 'Request Sent' : 'Add Friend'}
      </button>
    `;
    return item;
  }

  // Function to handle friend request (accept/reject)
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

  // Function to send a friend request
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

  // Event listeners
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
