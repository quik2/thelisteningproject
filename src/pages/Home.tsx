import { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Submission } from '../types';
import './Home.css';

function Home() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = submissions.filter(submission =>
      submission.songName.toLowerCase().includes(searchQuery) ||
      submission.artistName.toLowerCase().includes(searchQuery) ||
      submission.albumName.toLowerCase().includes(searchQuery) ||
      submission.userText.toLowerCase().includes(searchQuery) ||
      submission.submittedBy.toLowerCase().includes(searchQuery)
    );

    setFilteredSubmissions(filtered);
  }, [submissions]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="home">
          <div className="loading">Loading submissions...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="home">
          <div className="error">Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="home">
        <div className="home-header">
          <h1>The Listening Project</h1>
          <p>A collective space where people share the songs that mean something to them</p>
        </div>

        <SearchBar onSearch={handleSearch} placeholder="search for anything" />

        <div className="card-grid">
          {filteredSubmissions.length === 0 ? (
            <p className="no-results">No submissions found</p>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card
                key={submission.id}
                submission={submission}
                onClick={() => setSelectedSubmission(submission)}
              />
            ))
          )}
        </div>

        <Modal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      </div>
    </>
  );
}

export default Home;
