import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRandom = () => {
    // Navigate to home and trigger random submission view
    navigate('/?random=true');
  };

  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  const isSubmit = location.pathname === '/submit';

  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isHome ? 'active' : ''}`}>ARCHIVE</Link>
        <Link to="/about" className={`nav-link ${isAbout ? 'active' : ''}`}>ABOUT</Link>
        <button onClick={handleRandom} className="nav-link nav-button">RANDOM</button>
        <Link to="/submit" className={`nav-link ${isSubmit ? 'active' : ''}`}>SUBMIT</Link>
      </div>
      <div className="nav-logo">
        <img src="/PROJECTLOGO.png" alt="The Listening Project" className="logo-image" />
      </div>
    </nav>
  );
}

export default Navigation;
