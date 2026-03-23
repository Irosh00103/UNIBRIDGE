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
      <div className="navbar-logo">UniBridge</div>
      <div className="navbar-links">
        {!user && <Link className="navbar-link" to="/login">Login</Link>}
        {user && user.role === 'student' && (
          <>
            <Link className="navbar-link" to="/student/home">Home</Link>
            <Link className="navbar-link" to="/student/materials">Materials</Link>
            <Link className="navbar-link" to="/student/materials/upload">Upload</Link>
            <Link className="navbar-link" to="/student/jobs">Jobs</Link>
            <Link className="navbar-link" to="/student/applications">My Applications</Link>
            <Link className="navbar-link" to="/student/kuppi">Kuppi</Link>
            <button className="button" style={{ marginLeft: 16 }} onClick={handleLogout}>Logout</button>
          </>
        )}
        {user && user.role === 'employer' && (
          <>
            <Link className="navbar-link" to="/employer/dashboard">Dashboard</Link>
            <Link className="navbar-link" to="/employer/jobs/create">Post Job</Link>
            <button className="button" style={{ marginLeft: 16 }} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
