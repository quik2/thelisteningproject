import { useState, useEffect } from 'react';
// @ts-ignore
import Header from '../components/Header';
// @ts-ignore
import Card from '../components/Card';
// @ts-ignore
import Modal from '../components/Modal';
import { Submission } from '../types';
import './Featured.css';

function Featured() {
  const [featuredSubmission, setFeaturedSubmission] = useState<Submission | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
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
        const mostLiked = data.reduce((prev: Submission, current: Submission) =>
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

  const handleCardClick = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleLikeUpdate = (submissionId: string, newLikes: number) => {
    if (featuredSubmission?.id === submissionId) {
      setFeaturedSubmission(prev => prev ? { ...prev, likes: newLikes } : null);
    }
    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission(prev => prev ? { ...prev, likes: newLikes } : null);
    }
  };

  return (
    <div className="featured-page">
      <Header>
        <div className="featured-container">
          <h2 className="featured-title">Record of the Week</h2>
          <p className="featured-description">
            The most beloved memory from our community
          </p>
          {loading ? (
            <div className="featured-loading">Loading...</div>
          ) : featuredSubmission ? (
            <div className="featured-card-wrapper">
              <Card
                submission={featuredSubmission}
                // @ts-expect-error - Card onClick type mismatch
                onClick={handleCardClick}
              />
            </div>
          ) : (
            <div className="featured-empty">No submissions yet</div>
          )}
        </div>
      </Header>

      {selectedSubmission && (
        <Modal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          // @ts-expect-error - Modal prop type mismatch
          onLikeUpdate={handleLikeUpdate}
        />
      )}
    </div>
  );
}

export default Featured;
