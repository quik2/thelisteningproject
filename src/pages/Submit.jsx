import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Submit.css';

function Submit() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [userText, setUserText] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await response.json();
        console.log('Spotify API Response:', data);
        console.log('First track full object:', data[0]);
        console.log('First track preview_url:', data[0]?.preview_url);
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching tracks:', error);
      } finally {
        setSearching(false);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectTrack = (item) => {
    if (item.type === 'album') {
      // Handle album selection
      setSelectedTrack({
        songName: item.name,
        artistName: item.artists.map(a => a.name).join(', '),
        albumName: item.name,
        albumCover: item.images[0]?.url || '',
        previewUrl: null, // Albums don't have preview URLs
        isAlbum: true
      });
    } else {
      // Handle track selection
      setSelectedTrack({
        songName: item.name,
        artistName: item.artists.map(a => a.name).join(', '),
        albumName: item.album.name,
        albumCover: item.album.images[0]?.url || '',
        previewUrl: item.preview_url || null,
        isAlbum: false
      });
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrack || !userText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedTrack,
          userText: userText.trim(),
          submittedBy: 'Anonymous',
        }),
      });

      if (response.ok) {
        // Navigate back to home page
        navigate('/');
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRandom = () => {
    // No random functionality on submit page
  };

  return (
    <div className="submit-page">
      <Header onRandom={handleRandom} />
      <div className="submit-container">
        <div className="submit-form">
          {/* Song/Album Search */}
          {!selectedTrack && (
            <div className="search-section">
              <h2 className="section-title">1. Find Your Song or Album</h2>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="submit-input"
                  placeholder="Search for a song, album, or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && <span className="searching-indicator">Searching...</span>}
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="result-item"
                      onClick={() => handleSelectTrack(item)}
                    >
                      <img
                        src={item.type === 'album'
                          ? (item.images[2]?.url || item.images[0]?.url)
                          : (item.album.images[2]?.url || item.album.images[0]?.url)
                        }
                        alt={item.type === 'album' ? item.name : item.album.name}
                        className="result-image"
                      />
                      <div className="result-info">
                        <div className="result-name">
                          {item.type === 'album' && <span className="type-badge">ALBUM</span>}
                          {item.name}
                          {item.type === 'track' && item.preview_url && <span className="preview-badge">🎵</span>}
                        </div>
                        <div className="result-artist">
                          {item.artists.map(a => a.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Track & Story Input */}
          {selectedTrack && (
            <>
              <div className="selected-track">
                <h2 className="section-title">Selected Song</h2>
                <div className="selected-display">
                  <img src={selectedTrack.albumCover} alt={selectedTrack.albumName} />
                  <div>
                    <div className="selected-name">{selectedTrack.songName}</div>
                    <div className="selected-artist">{selectedTrack.artistName}</div>
                    <button
                      className="change-btn"
                      onClick={() => setSelectedTrack(null)}
                    >
                      Change Song
                    </button>
                  </div>
                </div>
              </div>

              <div className="story-section">
                <h2 className="section-title">2. Share Your Story</h2>
                <textarea
                  className="story-input"
                  placeholder="Tell us about a memory, moment, or feeling connected to this song..."
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  rows="6"
                />
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!userText.trim() || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit to The Listening Project'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Submit;
