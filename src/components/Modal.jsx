import { useEffect, useState, useRef } from 'react';
import './Modal.css';

function Modal({ submission, onClose, onLikeUpdate, onNext, onPrevious, isPreview = false, isEditable = false, onTextChange }) {
  const [likes, setLikes] = useState(submission.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

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
      const scrollY = window.scrollY;
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Lock scroll without using position: fixed
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.touchAction = 'none';
      document.body.dataset.scrollY = String(scrollY);

      // Prevent iOS rubber band scrolling
      const preventOverscroll = (e) => {
        // Only prevent if touching outside modal content
        if (!e.target.closest('.modal-layout')) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventOverscroll, { passive: false });

      return () => {
        const savedScrollY = parseInt(document.body.dataset.scrollY || '0', 10);
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.touchAction = '';
        delete document.body.dataset.scrollY;
        document.removeEventListener('touchmove', preventOverscroll);
        window.scrollTo(0, savedScrollY);
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

  useEffect(() => {
    // Focus trap and focus management
    if (!isPreview && modalRef.current) {
      const modal = modalRef.current;
      const previouslyFocused = document.activeElement;

      // Get all focusable elements
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Focus first element
      firstElement?.focus();

      // Handle Tab key for focus trap
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      modal.addEventListener('keydown', handleTab);

      return () => {
        modal.removeEventListener('keydown', handleTab);
        // Restore focus to previously focused element
        if (previouslyFocused && previouslyFocused instanceof HTMLElement) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isPreview]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditable && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [submission.userText, isEditable]);

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
            <h2 id="modal-title" className="modal-song">{submission.songName}</h2>
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
            {isEditable ? (
              <textarea
                ref={textareaRef}
                className="modal-story-textarea"
                placeholder="Type your memory here..."
                value={submission.userText}
                onChange={(e) => onTextChange && onTextChange(e.target.value)}
                autoFocus
              />
            ) : (
              <p>{submission.userText}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (isPreview) {
    return <div className="modal-content modal-preview">{content}</div>;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-overlay-inner">
        <div
          ref={modalRef}
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
