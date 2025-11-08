import { Submission } from '../types';
import './Card.css';

interface CardProps {
  submission: Submission;
  onClick: () => void;
}

function Card({ submission, onClick }: CardProps) {
  return (
    <div className="card-container" onClick={onClick}>
      <div className="card-album">
        <img src={submission.albumCover} alt={submission.albumName} />
      </div>
      <div className="card-text">
        <div className="card-header">
          <h3 className="card-song">{submission.songName}</h3>
          <p className="card-artist">{submission.artistName}</p>
        </div>
        <p className="card-story">{submission.userText}</p>
        <p className="card-author">— {submission.submittedBy}</p>
      </div>
    </div>
  );
}

export default Card;
