import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import './Home.css';

function Home() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [sortBy, setSortBy] = useState('most-recent');
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const lastRandomParam = useRef(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Handle random submission view
    const randomParam = searchParams.get('random');
    if (randomParam && randomParam !== lastRandomParam.current && submissions.length > 0) {
      lastRandomParam.current = randomParam;
      const randomIndex = Math.floor(Math.random() * submissions.length);
      setSelectedSubmission(submissions[randomIndex]);
    }
  }, [searchParams, submissions]);

  useEffect(() => {
    // Sort submissions whenever sortBy changes
    sortSubmissions(filteredSubmissions);
  }, [sortBy]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();
      setSubmissions(data);
      sortSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortSubmissions = (subs) => {
    const sorted = [...subs].sort((a, b) => {
      switch (sortBy) {
        case 'most-liked':
          return (b.likes || 0) - (a.likes || 0);
        case 'most-recent':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'most-old':
          return new Date(a.timestamp) - new Date(b.timestamp);
        default:
          return 0;
      }
    });
    setFilteredSubmissions(sorted);
  };

  const handleRandom = () => {
    if (submissions.length > 0) {
      const randomIndex = Math.floor(Math.random() * submissions.length);
      setSelectedSubmission(submissions[randomIndex]);
      setIsRandomMode(true);
    }
  };

  const handleNextRandom = () => {
    if (submissions.length > 0) {
      const randomIndex = Math.floor(Math.random() * submissions.length);
      setSelectedSubmission(submissions[randomIndex]);
      setIsRandomMode(true);
    }
  };

  const handleCardClick = (submission) => {
    setSelectedSubmission(submission);
    setIsRandomMode(false);
  };

  const handleNextSubmission = () => {
    if (filteredSubmissions.length === 0) return;

    const currentIndex = filteredSubmissions.findIndex(
      sub => sub.id === selectedSubmission?.id
    );

    // Get next submission (wrap around to start if at end)
    const nextIndex = (currentIndex + 1) % filteredSubmissions.length;
    setSelectedSubmission(filteredSubmissions[nextIndex]);
  };

  const handlePreviousSubmission = () => {
    if (filteredSubmissions.length === 0) return;

    const currentIndex = filteredSubmissions.findIndex(
      sub => sub.id === selectedSubmission?.id
    );

    // Get previous submission (wrap around to end if at start)
    const prevIndex = currentIndex <= 0
      ? filteredSubmissions.length - 1
      : currentIndex - 1;
    setSelectedSubmission(filteredSubmissions[prevIndex]);
  };

  const handleLikeUpdate = (submissionId, newLikes) => {
    // Update the submissions in state
    const updateSubmissions = (subs) =>
      subs.map(sub =>
        sub.id === submissionId ? { ...sub, likes: newLikes } : sub
      );

    setSubmissions(prev => updateSubmissions(prev));
    setFilteredSubmissions(prev => updateSubmissions(prev));
    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission(prev => ({ ...prev, likes: newLikes }));
    }
  };

  const handleSearch = useCallback((query, forceRefresh = false) => {
    // Always refetch if forced (e.g., pressing Enter)
    if (forceRefresh) {
      fetchSubmissions();
    }

    let filtered;

    // If there's an active filter, filter by specific field first
    if (activeFilter) {
      const filterField = activeFilter.type === 'song' ? 'songName' :
                          activeFilter.type === 'artist' ? 'artistName' :
                          'albumName';

      // Filter by the selected song/artist/album
      filtered = submissions.filter(submission =>
        submission[filterField] === activeFilter.value
      );

      // Then, if there's a search query, further filter within those results
      if (query && query.trim()) {
        const searchQuery = query.toLowerCase();
        filtered = filtered.filter(submission =>
          submission.userText.toLowerCase().includes(searchQuery) ||
          submission.submittedBy.toLowerCase().includes(searchQuery)
        );
      }
    }
    // Otherwise, use normal search across all fields
    else if (!query || !query.trim()) {
      filtered = submissions;
    } else {
      const searchQuery = query.toLowerCase();
      filtered = submissions.filter(submission =>
        submission.songName.toLowerCase().includes(searchQuery) ||
        submission.artistName.toLowerCase().includes(searchQuery) ||
        submission.albumName.toLowerCase().includes(searchQuery) ||
        submission.userText.toLowerCase().includes(searchQuery) ||
        submission.submittedBy.toLowerCase().includes(searchQuery)
      );
    }
    sortSubmissions(filtered);
  }, [submissions, sortBy, activeFilter]);

  const handleFilterSelect = (type, value, displayName) => {
    setActiveFilter({ type, value, displayName });
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
  };

  // Re-run search when activeFilter changes
  useEffect(() => {
    handleSearch('');
  }, [activeFilter]);

  return (
    <div className="home">
      <Header onRandom={handleRandom}>
        <div className="search-sort-container">
          <SearchBar
            onSearch={handleSearch}
            onFilterSelect={handleFilterSelect}
            onClearFilter={handleClearFilter}
            activeFilter={activeFilter}
            submissions={submissions}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="most-recent">Most Recent</option>
            <option value="most-old">Oldest</option>
            <option value="most-liked">Most Liked</option>
          </select>
        </div>
        {filteredSubmissions.length > 0 && (
          <div className="results-count">
            {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'record' : 'records'} found
          </div>
        )}
      </Header>

      <div className="home-content">
        {loading ? (
          <div className="card-grid">
            {/* Show nothing while loading */}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="no-results">No records found</div>
        ) : (
          <div className="card-grid">
            {filteredSubmissions.map((submission, index) => (
              <Card
                key={submission.id}
                submission={submission}
                onClick={handleCardClick}
                style={{ animationDelay: `${index * 0.03}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <Modal
          submission={selectedSubmission}
          onClose={() => {
            setSelectedSubmission(null);
            setIsRandomMode(false);
          }}
          onLikeUpdate={handleLikeUpdate}
          onNext={isRandomMode ? handleNextRandom : handleNextSubmission}
          onPrevious={isRandomMode ? null : handlePreviousSubmission}
        />
      )}
    </div>
  );
}

export default Home;
