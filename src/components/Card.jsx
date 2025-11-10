import './Card.css';

function Card({ submission, onClick }) {
  return (
    <div className="card-container" onClick={() => onClick(submission)}>
      <div className="vinyl-sleeve">
        <img
          src={submission.albumCover}
          alt={submission.albumName}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="vinyl-record">
        <div className="record-center">
          <div className="record-label">
            <div className="label-content">
              <h3 className="record-song">{submission.songName}</h3>
              <p className="record-artist">{submission.artistName}</p>
              <p className="record-story">{submission.userText}</p>
              <p className="record-author">— {submission.submittedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
