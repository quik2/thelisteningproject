import { useEffect } from 'react';
import { Submission } from '../types';
import './Modal.css';

interface ModalProps {
  submission: Submission | null;
  onClose: () => void;
}

function Modal({ submission, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (submission) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [submission, onClose]);

  if (!submission) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-body">
          <div className="modal-image">
            <img src={submission.albumCover} alt={submission.albumName} />
          </div>
          <div className="modal-info">
            <h2>{submission.songName}</h2>
            <h3>{submission.artistName}</h3>
            <p className="modal-album">{submission.albumName}</p>
            <div className="modal-text">
              <p>{submission.userText}</p>
            </div>
            <div className="modal-meta">
              <p>Submitted by: <strong>{submission.submittedBy}</strong></p>
              <p>Date: {new Date(submission.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
