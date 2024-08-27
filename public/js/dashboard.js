document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('#user-search-input');
  const searchButton = document.querySelector('#search-button');
  const searchResults = document.querySelector('.search-results');
  const outgoingRequestsList = document.querySelector('#outgoing-requests');
  const incomingRequestsList = document.querySelector('#incoming-requests'); // New

  // Fetch outgoing friend requests on page load
  async function loadOutgoingRequests() {
    try {
      const response = await fetch('/users/outgoingrequests');
      const outgoingRequests = await response.json();

      outgoingRequestsList.innerHTML = ''; // Clear existing items

      outgoingRequests.forEach(request => {
        const outgoingRequestItem = document.createElement('li');
        outgoingRequestItem.classList.add('list-group-item');
        outgoingRequestItem.textContent = request.recipient.username;
        outgoingRequestsList.appendChild(outgoingRequestItem);
      });
    } catch (error) {
      console.log('Error loading outgoing requests:', error);
    }
  }

  // Fetch incoming friend requests on page load
  async function loadIncomingRequests() {
    try {
      const response = await fetch('/users/incomingrequests');
      const incomingRequests = await response.json();

      incomingRequestsList.innerHTML = ''; // Clear existing items

      incomingRequests.forEach(request => {
        const incomingRequestItem = document.createElement('li');
        incomingRequestItem.classList.add('list-group-item');
        incomingRequestItem.textContent = request.requester.username;
        // You can also add a button to accept or reject the request
        incomingRequestsList.appendChild(incomingRequestItem);
      });
    } catch (error) {
      console.log('Error loading incoming requests:', error);
    }
  }

  // Function to perform the search
  async function performSearch() {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      try {
        const response = await fetch(`/users/search?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        searchResults.innerHTML = '';

        if (users.length > 0) {
          users.forEach(user => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.innerHTML = 
              `${user.username}
              <button class="btn btn-sm ${user.hasSentRequest ? 'btn-danger' : 'btn-primary'} send-request-button" data-id="${user._id}">
                <i class="fas ${user.hasSentRequest ? 'fa-user-times' : 'fa-user-plus'}"></i>
              </button>`;
            searchResults.appendChild(resultItem);
          });
        } else {
          searchResults.innerHTML = '<p>No users found.</p>';
        }
      } catch (error) {
        console.log('Error fetching search results:', error);
      }
    } else {
      searchResults.innerHTML = ''; // Clear results if input is empty
    }
  }

  // Trigger search when user types
  searchInput.addEventListener('input', performSearch);

  // Trigger search when user clicks the search button
  searchButton.addEventListener('click', performSearch);

  // Handle sending friend requests
  searchResults.addEventListener('click', function(event) {
    if (event.target.closest('.send-request-button')) {
      const button = event.target.closest('.send-request-button');
      const recipientId = button.getAttribute('data-id');
      sendFriendRequest(recipientId, button);
    }
  });

  async function sendFriendRequest(recipientId, button) {
    try {
      const response = await fetch('/users/sendrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipientId })
      });
      const result = await response.json();

      if (response.ok) {
        button.innerHTML = '<i class="fas fa-user-times"></i>'; // Change icon to represent "Cancel Request"
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');

        // Add to outgoing requests list
        const outgoingRequestItem = document.createElement('li');
        outgoingRequestItem.classList.add('list-group-item');
        outgoingRequestItem.textContent = result.username; // Username of recipient
        outgoingRequestsList.appendChild(outgoingRequestItem);
      } else {
        console.log('Error sending friend request:', result.error);
      }
    } catch (error) {
      console.log('Error sending friend request:', error);
    }
  }

  // Load outgoing and incoming requests on page load
  loadOutgoingRequests();
  loadIncomingRequests(); // New
});
