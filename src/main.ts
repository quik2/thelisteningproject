import { spotifyService, type SpotifyTrack } from './services/spotify';

console.log('Listening Project loaded!');

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  // Create search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search for a song...';
  searchInput.className = 'search-input';

  // Create search button
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Search';
  searchButton.className = 'search-button';

  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  // Add search functionality
  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
      searchButton.disabled = true;
      searchButton.textContent = 'Searching...';

      const tracks = await spotifyService.searchTracks(query, 5);
      displayResults(tracks, resultsContainer);
    } catch (error) {
      resultsContainer.innerHTML = `<p class="error">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = 'Search';
    }
  });

  // Allow Enter key to search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchButton.click();
    }
  });

  // Append elements
  app.appendChild(searchInput);
  app.appendChild(searchButton);
  app.appendChild(resultsContainer);
}

function displayResults(tracks: SpotifyTrack[], container: HTMLElement) {
  if (tracks.length === 0) {
    container.innerHTML = '<p>No results found</p>';
    return;
  }

  container.innerHTML = '';

  tracks.forEach(track => {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-item';

    const albumArt = spotifyService.getBestAlbumArt(track);
    const artists = spotifyService.formatArtists(track);

    trackDiv.innerHTML = `
      ${albumArt ? `<img src="${albumArt}" alt="${track.album.name}" class="album-art">` : ''}
      <div class="track-info">
        <div class="track-name">${track.name}</div>
        <div class="track-artist">${artists}</div>
        <div class="track-album">${track.album.name}</div>
      </div>
    `;

    container.appendChild(trackDiv);
  });
}
