import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPractitioner = user?.userType === 'practitioner';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top" role="navigation" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span aria-label="Mindmingle">🧘 Mindmingle</span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!isPractitioner && (
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
            )}
            {isAuthenticated ? (
              <>
                {/* Show different menu items based on user type */}
                {!isPractitioner ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/professional-help">Patient Chats</Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profile</Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-light ms-2" 
                    onClick={onLogout}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light ms-2" to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;