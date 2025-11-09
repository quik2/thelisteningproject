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
        <div className="album-info">
          <h3 className="album-song">{submission.songName}</h3>
          <p className="album-artist">{submission.artistName}</p>
        </div>
      </div>
      <div className="vinyl-record">
        <div className="record-center">
          <div className="record-label">
            <div className="label-content">
              <p className="record-story">{submission.userText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
