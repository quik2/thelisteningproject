import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          The Listening Project
        </Link>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/submit"
            className={`nav-link ${location.pathname === '/submit' ? 'active' : ''}`}
          >
            Submit
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
