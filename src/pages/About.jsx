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
    songName: "Here Comes The Sun",
    artistName: "The Beatles",
    albumName: "Abbey Road",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
    userText: "This song reminds me of my grandmother's garden. Every summer morning, she'd hum this while watering her roses. Now whenever I hear it, I'm transported back to those peaceful moments, the smell of earth and flowers, and her gentle smile.",
    submittedBy: "Sarah",
    timestamp: "2024-01-15T10:30:00.000Z",
    likes: 42
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
          The Record Room is a collection of memories told through music. Each record holds a story—a song that marked a moment, an album that held someone together, a lyric that said what words couldn't. Together, these memories remind us that while our experiences are personal, the feelings they carry are shared. Add your record. Share your story.
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
