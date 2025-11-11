import { useState } from 'react';
import './Card.css';

function Card({ submission, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="card-container" onClick={() => onClick(submission)}>
      <div className="vinyl-sleeve">
        {!imageLoaded && <div className="image-skeleton" />}
        <img
          src={submission.albumCover}
          alt={submission.albumName}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={imageLoaded ? 'loaded' : 'loading'}
        />
      </div>
      <div className="vinyl-record">
        <div className="record-center">
          <div className="record-label">
            <div className="label-content">
              <h3 className="record-song">{submission.songName}</h3>
              {submission.artistName && <p className="record-artist">{submission.artistName}</p>}
              <p className="record-story">{submission.userText}</p>
              {submission.submittedBy && <p className="record-author">— {submission.submittedBy}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
