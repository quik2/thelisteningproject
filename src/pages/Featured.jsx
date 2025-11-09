import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Modal from '../components/Modal';
import './Featured.css';

function Featured() {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [featuredSubmission, setFeaturedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedSubmission();
  }, []);

  const fetchFeaturedSubmission = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();

      // Get the most liked submission
      if (data && data.length > 0) {
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

  const handleLikeUpdate = (submissionId, newLikes) => {
    if (featuredSubmission?.id === submissionId) {
      setFeaturedSubmission(prev => ({ ...prev, likes: newLikes }));
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => ({ ...prev, likes: newLikes }));
      }
    }
  };

  const handleRandom = () => {
    if (featuredSubmission) {
      setSelectedSubmission(featuredSubmission);
      setIsRandomMode(true);
    }
  };

  const handleNextRandom = () => {
    if (featuredSubmission) {
      setSelectedSubmission(featuredSubmission);
      setIsRandomMode(true);
    }
  };

  const handleCardClick = (submission) => {
    setSelectedSubmission(submission);
    setIsRandomMode(false);
  };

  return (
    <div className="featured-page">
      <Header onRandom={handleRandom} />
      <div className="featured-container">
        <h2 className="featured-title">Record of the Week</h2>
        <p className="featured-description">
          The most beloved record from our community
        </p>

        {loading ? (
          <div className="featured-loading">Loading...</div>
        ) : featuredSubmission ? (
          <div className="featured-example">
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
          onNext={isRandomMode ? handleNextRandom : null}
        />
      )}
    </div>
  );
}

export default Featured;
