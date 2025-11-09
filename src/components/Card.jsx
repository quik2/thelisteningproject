import './Card.css';

function Card({ submission, onClick }) {
  return (
    <div className="card-container" onClick={() => onClick(submission)}>
      <div className="card-left">
        <div className="vinyl-sleeve">
          <img
            src={submission.albumCover}
            alt={submission.albumName}
            loading="lazy"
            decoding="async"
          />
          <div className="album-info">
            <h3 className="album-song">{submission.songName}</h3>
            <p className="album-artist">{submission.artistName}</p>
          </div>
        </div>
        <div className="vinyl-record"></div>
      </div>
      <div className="card-text">
        <p className="card-story">{submission.userText}</p>
        <p className="card-author">— {submission.submittedBy}</p>
      </div>
    </div>
  );
}

export default Card;
