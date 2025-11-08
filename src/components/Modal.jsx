import { useEffect, useState } from 'react';
import './Modal.css';

function Modal({ submission, onClose, onLikeUpdate, onNext, onPrevious }) {
  const [likes, setLikes] = useState(submission.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: null, y: null });
  const [touchEnd, setTouchEnd] = useState({ x: null, y: null });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 80;

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

  const onTouchStart = (e) => {
    setTouchEnd({ x: null, y: null });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e) => {
    if (!touchStart.x || !touchStart.y) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;

    setTouchEnd({ x: currentX, y: currentY });

    // Update drag offset for visual feedback
    const offsetX = currentX - touchStart.x;
    const offsetY = currentY - touchStart.y;
    setDragOffset({ x: offsetX * 0.5, y: offsetY * 0.5 }); // Reduce movement for better feel
  };

  const onTouchEnd = () => {
    if (!touchStart.x || !touchStart.y || !touchEnd.x || !touchEnd.y) {
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;

    // Determine if swipe is primarily horizontal or vertical
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    let shouldNavigate = false;
    let direction = null;

    if (isHorizontalSwipe) {
      // Horizontal swipe
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      if (isLeftSwipe && onNext) {
        direction = 'left';
        shouldNavigate = true;
      } else if (isRightSwipe && onPrevious) {
        direction = 'right';
        shouldNavigate = true;
      }
    } else {
      // Vertical swipe
      const isUpSwipe = distanceY > minSwipeDistance;
      const isDownSwipe = distanceY < -minSwipeDistance;

      if (isUpSwipe && onNext) {
        direction = 'up';
        shouldNavigate = true;
      } else if (isDownSwipe && onPrevious) {
        direction = 'down';
        shouldNavigate = true;
      }
    }

    if (shouldNavigate) {
      setIsTransitioning(true);
      // Add exit animation
      setDragOffset({
        x: direction === 'left' ? -window.innerWidth : direction === 'right' ? window.innerWidth : 0,
        y: direction === 'up' ? -window.innerHeight : direction === 'down' ? window.innerHeight : 0
      });

      setTimeout(() => {
        if (direction === 'left' || direction === 'up') {
          onNext();
        } else {
          onPrevious();
        }
        setDragOffset({ x: 0, y: 0 });
        setIsTransitioning(false);
      }, 300);
    } else {
      // Reset position with animation
      setIsTransitioning(true);
      setDragOffset({ x: 0, y: 0 });
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleLike = async () => {
    // Prevent multiple simultaneous requests
    if (isLiking) return;

    setIsLiking(true);
    try {
      const endpoint = hasLiked ? 'unlike' : 'like';
      const url = `/api/submissions/${endpoint}?id=${submission.id}`;
      console.log('Attempting to like/unlike:', { url, submissionId: submission.id, endpoint });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Like API error:', response.status, errorText);
        alert(`Failed to ${endpoint} submission. Check console for details.`);
        return;
      }

      const data = await response.json();
      console.log('Like response data:', data);

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
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-overlay-inner">
        <div
          className={`modal-content ${isTransitioning ? 'transitioning' : ''}`}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            opacity: 1 - Math.min(Math.abs(dragOffset.x) / 300, Math.abs(dragOffset.y) / 300, 0.3)
          }}
        >
          <button className="modal-close" onClick={onClose}>×</button>

          {/* Swipe indicators */}
          <div className="swipe-indicators">
            <div className="swipe-indicator swipe-up">Swipe up for next ↑</div>
            <div className="swipe-indicator swipe-down">Swipe down for previous ↓</div>
          </div>

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
