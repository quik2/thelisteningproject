// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');

// Search for tracks
async function searchTracks(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const tracks = await response.json();
    return tracks;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

// Display results
function displayResults(tracks) {
  resultsContainer.innerHTML = '';

  if (tracks.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">No results found. Try a different search.</div>';
    return;
  }

  tracks.forEach(track => {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-item';

    const albumArt = track.album.images[0]?.url || '';
    const artists = track.artists.map(artist => artist.name).join(', ');

    trackDiv.innerHTML = `
      ${albumArt ? `<img src="${albumArt}" alt="${track.album.name}" class="album-art">` : '<div class="album-art" style="background: #ddd;"></div>'}
      <div class="track-info">
        <div class="track-name">${track.name}</div>
        <div class="track-artist">${artists}</div>
        <div class="track-album">${track.album.name}</div>
      </div>
    `;

    // Add click handler (for future: add story functionality)
    trackDiv.addEventListener('click', () => {
      console.log('Selected track:', track);
      // TODO: Open modal to add story
    });

    resultsContainer.appendChild(trackDiv);
  });
}

// Handle search
async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    return;
  }

  try {
    // Disable button and show loading
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
    resultsContainer.innerHTML = '<div class="loading">Searching for songs...</div>';

    const tracks = await searchTracks(query);
    displayResults(tracks);
  } catch (error) {
    resultsContainer.innerHTML = `<div class="error">Error searching for songs. Please try again.</div>`;
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = 'Search';
  }
}

// Event listeners
searchButton.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

// Focus search input on load
searchInput.focus();
