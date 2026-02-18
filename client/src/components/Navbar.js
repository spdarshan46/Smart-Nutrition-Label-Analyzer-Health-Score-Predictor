import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-robot"></i> Nutrition Analyzer
        </Link>
        
        {user ? (
          <>
            <div className="nav-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/analysis">New Analysis</Link>
              <Link to="/history">History</Link>
              <span className="user-name">
                <i className="fas fa-user"></i> {user.name}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </>
        ) : (
          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;