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
        <img src="/recordroomlogo.png" alt="The Record Room Logo" className="header-logo" />
      </div>
      <div className="header-section">
        <div className="header-nav-container">
          <div className="header-nav-links">
            <Link to="/" className={`header-nav-link ${isHome ? 'active' : ''}`}>RECORDS</Link>
            <Link to="/about" className={`header-nav-link ${isAbout ? 'active' : ''}`}>ABOUT</Link>
          </div>
          <Link to="/submit" className="header-submit-button">ADD</Link>
        </div>
        <h1 className="header-title">THE RECORD ROOM</h1>
        {children}
      </div>
    </>
  );
}

export default Header;
