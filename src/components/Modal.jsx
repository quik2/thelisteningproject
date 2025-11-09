import { useEffect, useState } from 'react';
import './Modal.css';

function Modal({ submission, onClose, onLikeUpdate, onNext, onPrevious, isPreview = false }) {
  const [likes, setLikes] = useState(submission.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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
    // Prevent body scroll when modal is open (but not in preview mode)
    if (!isPreview) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [onClose, isPreview]);

  const handleLike = async () => {
    // Prevent multiple simultaneous requests
    if (isLiking) return;

    // Optimistic update - update UI immediately for instant feedback
    const wasLiked = hasLiked;
    const previousLikes = likes;
    const newLikes = wasLiked ? likes - 1 : likes + 1;

    setIsLiking(true);
    setHasLiked(!wasLiked);
    setLikes(newLikes);

    // Update localStorage immediately
    const likedSubmissions = JSON.parse(localStorage.getItem('likedSubmissions') || '[]');
    if (wasLiked) {
      const index = likedSubmissions.indexOf(submission.id);
      if (index > -1) {
        likedSubmissions.splice(index, 1);
      }
    } else {
      likedSubmissions.push(submission.id);
    }
    localStorage.setItem('likedSubmissions', JSON.stringify(likedSubmissions));

    // Notify parent component immediately
    if (onLikeUpdate) {
      onLikeUpdate(submission.id, newLikes);
    }

    // Then sync with server in the background
    try {
      const endpoint = wasLiked ? 'unlike' : 'like';
      const url = `/api/submissions/${endpoint}?id=${submission.id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setHasLiked(wasLiked);
        setLikes(previousLikes);

        // Revert localStorage
        const revertedSubmissions = JSON.parse(localStorage.getItem('likedSubmissions') || '[]');
        if (wasLiked) {
          revertedSubmissions.push(submission.id);
        } else {
          const index = revertedSubmissions.indexOf(submission.id);
          if (index > -1) {
            revertedSubmissions.splice(index, 1);
          }
        }
        localStorage.setItem('likedSubmissions', JSON.stringify(revertedSubmissions));

        // Revert parent state
        if (onLikeUpdate) {
          onLikeUpdate(submission.id, previousLikes);
        }

        const errorText = await response.text();
        console.error('Like API error:', response.status, errorText);
        return;
      }

      const data = await response.json();

      // Update with server's actual count (in case it differs)
      if (data.likes !== newLikes) {
        setLikes(data.likes);
        if (onLikeUpdate) {
          onLikeUpdate(submission.id, data.likes);
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(wasLiked);
      setLikes(previousLikes);

      // Revert localStorage
      const revertedSubmissions = JSON.parse(localStorage.getItem('likedSubmissions') || '[]');
      if (wasLiked) {
        revertedSubmissions.push(submission.id);
      } else {
        const index = revertedSubmissions.indexOf(submission.id);
        if (index > -1) {
          revertedSubmissions.splice(index, 1);
        }
      }
      localStorage.setItem('likedSubmissions', JSON.stringify(revertedSubmissions));

      // Revert parent state
      if (onLikeUpdate) {
        onLikeUpdate(submission.id, previousLikes);
      }

      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const content = (
    <>
      {!isPreview && <button className="modal-close" onClick={onClose}>×</button>}
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
                className={`like-button ${hasLiked ? 'liked' : ''} ${isLiking ? 'liking' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
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
    </>
  );

  if (isPreview) {
    return <div className="modal-content modal-preview">{content}</div>;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-overlay-inner">
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

export default Modal;
