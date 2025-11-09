import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Modal from '../components/Modal';
import Card from '../components/Card';
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

  // Create preview submission object
  const previewSubmission = selectedTrack && userText.trim() ? {
    id: 'preview',
    songName: selectedTrack.songName,
    artistName: selectedTrack.artistName,
    albumName: selectedTrack.albumName,
    albumCover: selectedTrack.albumCover,
    previewUrl: selectedTrack.previewUrl,
    userText: userText,
    submittedBy: 'Anonymous',
    timestamp: new Date().toISOString(),
    likes: 0
  } : null;

  return (
    <div className="submit-page">
      <Header onRandom={handleRandom} />
      <div className="submit-container">
        <div className="submit-header">
          <h1 className="submit-title">Add to the archive</h1>
        </div>

        <div className="submit-layout">
          <div className="submit-form-section">
            <h2 className="section-label">Find your song or album</h2>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="submit-search-input"
                placeholder="Search Spotify..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

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
                        <div className="result-name">{item.name}</div>
                        <div className="result-artist">
                          {item.artists.map(a => a.name).join(', ')}
                        </div>
                      </div>
                      {item.type === 'album' && (
                        <span className="result-type-badge">album</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTrack && (
              <>
                <div className="selected-track-banner">
                  <img src={selectedTrack.albumCover} alt={selectedTrack.albumName} className="banner-cover" />
                  <div className="banner-info">
                    <div className="banner-name">{selectedTrack.songName}</div>
                    <div className="banner-artist">{selectedTrack.artistName}</div>
                  </div>
                  <button
                    className="banner-change-btn"
                    onClick={() => setSelectedTrack(null)}
                  >
                    Change
                  </button>
                </div>

                <div className="story-section">
                  <label className="section-label">Your memory</label>
                  <textarea
                    className="story-textarea"
                    placeholder="Write about the moment, the feeling, or the memory this brings back..."
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    rows="8"
                    autoFocus
                  />
                </div>

                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!userText.trim() || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit to archive'}
                </button>
              </>
            )}
          </div>

          {previewSubmission && (
            <div className="preview-section">
              <h3 className="preview-title">Preview</h3>
              <div className="preview-modal">
                <Modal
                  submission={previewSubmission}
                  onClose={() => {}}
                  onLikeUpdate={() => {}}
                  isPreview={true}
                />
              </div>
              <div className="preview-card">
                <Card
                  submission={previewSubmission}
                  onClick={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Submit;
