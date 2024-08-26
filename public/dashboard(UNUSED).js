document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('#user-search-input');
  const searchButton = document.querySelector('.input-group-append button');
  const searchResults = document.querySelector('.search-results');

  // Function to perform the search
  async function performSearch() {
    const query = searchInput.value.trim();
    console.log('Search query:', query);

    if (query.length > 0) {
      try {
        const response = await fetch(`/users/search?q=${encodeURIComponent(query)}`);
        console.log('Response status:', response.status);
        const users = await response.json();
        console.log('Users found:', users);
        
        // Clear previous results
        searchResults.innerHTML = '';

        if (users.length > 0) {
          users.forEach(user => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.textContent = user.username;
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
  searchButton.addEventListener('click', function() {
    console.log('Search button clicked');
    performSearch();
  });
});
