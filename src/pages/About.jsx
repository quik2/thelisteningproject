import { useState } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Modal from '../components/Modal';
import './About.css';

function About() {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [exampleSubmission, setExampleSubmission] = useState({
    id: "example",
    songName: "",
    artistName: "",
    albumName: "",
    albumCover: "/logotest.png",
    userText: "Music is a vehicle for shared human experience.",
    submittedBy: "",
    timestamp: "2024-01-15T10:30:00.000Z",
    likes: 0
  });

  const handleLikeUpdate = (submissionId, newLikes) => {
    if (submissionId === "example") {
      setExampleSubmission(prev => ({ ...prev, likes: newLikes }));
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => ({ ...prev, likes: newLikes }));
      }
    }
  };

  const handleRandom = () => {
    setSelectedSubmission(exampleSubmission);
    setIsRandomMode(true);
  };

  const handleNextRandom = () => {
    setSelectedSubmission(exampleSubmission);
    setIsRandomMode(true);
  };

  const handleCardClick = (submission) => {
    setSelectedSubmission(submission);
    setIsRandomMode(false);
  };

  return (
    <div className="about-page">
      <Header onRandom={handleRandom} />
      <div className="about-container">
        <p className="about-text">
          The Record Room is a collection of memories told through music. Each record holds a story—a song that marked a moment, an album that held someone together, a lyric that said what words couldn't. Together, these memories remind us that while our experiences are personal, the feelings they carry are shared. <em>Add your record. Share your story.</em>
        </p>
        <div className="about-example">
          <Card
            submission={exampleSubmission}
            onClick={handleCardClick}
          />
        </div>
      </div>

      {selectedSubmission && (
        <Modal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onLikeUpdate={handleLikeUpdate}
          onNext={isRandomMode ? handleNextRandom : null}
        />
      )}
    </div>
  );
}

export default About;
