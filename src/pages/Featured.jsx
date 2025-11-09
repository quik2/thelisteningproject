import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Modal from '../components/Modal';
import './Featured.css';

function Featured() {
  const [featuredSubmission, setFeaturedSubmission] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedSubmission();
  }, []);

  const fetchFeaturedSubmission = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();

      // Get the most liked submission
      if (data.length > 0) {
        const mostLiked = data.reduce((prev, current) =>
          (current.likes || 0) > (prev.likes || 0) ? current : prev
        );
        setFeaturedSubmission(mostLiked);
      }
    } catch (error) {
      console.error('Error fetching featured submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleLikeUpdate = (submissionId, newLikes) => {
    if (featuredSubmission?.id === submissionId) {
      setFeaturedSubmission(prev => prev ? { ...prev, likes: newLikes } : null);
    }
    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission(prev => prev ? { ...prev, likes: newLikes } : null);
    }
  };

  return (
    <div className="featured-page">
      <Header />

      <div className="featured-content">
        <h2 className="featured-title">Record of the Week</h2>
        <p className="featured-description">
          The most beloved record from our community
        </p>

        {loading ? (
          <div className="featured-card-wrapper">
            {/* Show nothing while loading */}
          </div>
        ) : featuredSubmission ? (
          <div className="featured-card-wrapper">
            <Card
              submission={featuredSubmission}
              onClick={handleCardClick}
            />
          </div>
        ) : (
          <div className="featured-empty">No records yet</div>
        )}
      </div>

      {selectedSubmission && (
        <Modal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onLikeUpdate={handleLikeUpdate}
        />
      )}
    </div>
  );
}

export default Featured;
