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

  const handleSelectTrack = (track) => {
    setSelectedTrack({
      songName: track.name,
      artistName: track.artists.map(a => a.name).join(', '),
      albumName: track.album.name,
      albumCover: track.album.images[0]?.url || '',
      previewUrl: track.preview_url || null,
    });
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
          {/* Song Search */}
          {!selectedTrack && (
            <div className="search-section">
              <h2 className="section-title">1. Find Your Song</h2>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="submit-input"
                  placeholder="Search for a song or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && <span className="searching-indicator">Searching...</span>}
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="result-item"
                      onClick={() => handleSelectTrack(track)}
                    >
                      <img
                        src={track.album.images[2]?.url || track.album.images[0]?.url}
                        alt={track.album.name}
                        className="result-image"
                      />
                      <div className="result-info">
                        <div className="result-name">
                          {track.name}
                          {track.preview_url && <span className="preview-badge">🎵</span>}
                        </div>
                        <div className="result-artist">
                          {track.artists.map(a => a.name).join(', ')}
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
