import { useEffect, useState } from 'react';
import './Modal.css';

function Modal({ submission, onClose, onLikeUpdate, onNext }) {
  const [likes, setLikes] = useState(submission.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    // Update likes when submission changes
    setLikes(submission.likes || 0);
  }, [submission.likes]);

  useEffect(() => {
    // Check if user has already liked this submission
    const likedSubmissions = JSON.parse(localStorage.getItem('likedSubmissions') || '[]');
    setHasLiked(likedSubmissions.includes(submission.id));
  }, [submission.id]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleLike = async () => {
    try {
      const endpoint = hasLiked ? 'unlike' : 'like';
      const response = await fetch(`/api/submissions/${submission.id}/${endpoint}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setHasLiked(!hasLiked);

        // Update localStorage
        const likedSubmissions = JSON.parse(localStorage.getItem('likedSubmissions') || '[]');
        if (hasLiked) {
          // Remove from liked submissions
          const index = likedSubmissions.indexOf(submission.id);
          if (index > -1) {
            likedSubmissions.splice(index, 1);
          }
        } else {
          // Add to liked submissions
          likedSubmissions.push(submission.id);
        }
        localStorage.setItem('likedSubmissions', JSON.stringify(likedSubmissions));

        // Notify parent component if callback provided
        if (onLikeUpdate) {
          onLikeUpdate(submission.id, data.likes);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-overlay-inner">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <div className="modal-layout">
            <div className="modal-album">
              <img src={submission.albumCover} alt={submission.albumName} />
            </div>
            <div className="modal-text">
              <div className="modal-header">
                <h2 className="modal-song">{submission.songName}</h2>
                <p className="modal-artist">{submission.artistName}</p>
                <div className="modal-like-section">
                  <button
                    className={`like-button ${hasLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                  >
                    <span className="like-icon">{hasLiked ? '♥' : '♡'}</span>
                    <span className="like-count">{likes}</span>
                  </button>
                </div>
              </div>
              <div className="modal-story">
                <p>{submission.userText}</p>
              </div>
            </div>
          </div>
        </div>
        {onNext && (
          <button
            className="modal-next-below"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            NEXT
          </button>
        )}
      </div>
    </div>
  );
}

export default Modal;
