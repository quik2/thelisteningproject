import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import SearchBar from '../components/SearchBar';
import { SpotifyTrack } from '../types';
import './Submit.css';

function Submit() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [userText, setUserText] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    try {
      setSearching(true);
      setError(null);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTrack || !userText.trim()) {
      setError('Please select a track and write your story');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submission = {
        songName: selectedTrack.name,
        artistName: selectedTrack.artists.map(a => a.name).join(', '),
        albumName: selectedTrack.album.name,
        albumCover: selectedTrack.album.images[0]?.url || '',
        userText: userText.trim(),
        submittedBy: submittedBy.trim() || 'Anonymous',
      };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      // Success! Navigate to home
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="submit">
        <div className="submit-header">
          <h1>Share Your Story</h1>
          <p>Tell us about a song that means something to you</p>
        </div>

        <div className="submit-content">
          <div className="search-section">
            <h2>1. Find Your Song</h2>
            <SearchBar onSearch={handleSearch} placeholder="Search for a song..." />

            {searching && <div className="loading">Searching...</div>}

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className={`track-result ${selectedTrack?.id === track.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    {track.album.images[2] && (
                      <img src={track.album.images[2].url} alt={track.album.name} />
                    )}
                    <div className="track-info">
                      <div className="track-name">{track.name}</div>
                      <div className="track-artist">
                        {track.artists.map(a => a.name).join(', ')}
                      </div>
                      <div className="track-album">{track.album.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTrack && (
            <form className="story-form" onSubmit={handleSubmit}>
              <h2>2. Share Your Story</h2>

              <div className="selected-track">
                <img src={selectedTrack.album.images[1]?.url} alt={selectedTrack.album.name} />
                <div>
                  <h3>{selectedTrack.name}</h3>
                  <p>{selectedTrack.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="userText">Your Story *</label>
                <textarea
                  id="userText"
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="What does this song mean to you? Share a memory, feeling, or story..."
                  rows={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="submittedBy">Your Name (optional)</label>
                <input
                  type="text"
                  id="submittedBy"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="Anonymous"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={submitting} className="submit-button">
                {submitting ? 'Submitting...' : 'Submit Your Story'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Submit;
