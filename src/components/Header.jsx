import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ children, onRandom }) {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  const isSubmit = location.pathname === '/submit';

  return (
    <>
      <div className="header-logo-container">
        <img src="/PROJECTLOGO.png" alt="Project Logo" className="header-logo" />
      </div>
      <div className="header-section">
        <div className="header-nav-links">
          <Link to="/" className={`header-nav-link ${isHome ? 'active' : ''}`}>ARCHIVE</Link>
          <Link to="/about" className={`header-nav-link ${isAbout ? 'active' : ''}`}>ABOUT</Link>
          <button onClick={onRandom} className="header-nav-link header-nav-button">RANDOM</button>
          <Link to="/submit" className={`header-nav-link ${isSubmit ? 'active' : ''}`}>SUBMIT</Link>
        </div>
        <h1 className="header-title">THE RECORD ROOM</h1>
        {children}
      </div>
    </>
  );
}

export default Header;
