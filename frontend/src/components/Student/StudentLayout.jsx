import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import './StudentLayout.css';

const StudentLayout = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Dummy user data for demonstration, replace with actual user data from context/state
  const user = JSON.parse(localStorage.getItem('user')) || {
    firstName: 'Aditya',
    lastName: 'Dangi',
    userId: '12106635',
    section: 'K21DY',
    branch: 'B.Tech. (Computer Science and Engineering)',
    profilePic: '/vite.svg' // Using local vite.svg for testing
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/login');
  };

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="sidebar-logo">
          <Link to="/student/dashboard">
            <img src="/vite.svg" alt="UMS Logo" className="ums-logo" />
            <div className="logo-text">
              <span className="ums-abbr">UMS</span>
              <span className="ums-full">School Management System</span>
            </div>
          </Link>
        </div>
        <nav className="student-nav-links">
          <Link to="/student/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>Dashboard
          </Link>
          <Link to="/student/ums-home" className="nav-item">
            <i className="fas fa-home"></i>UMS Home
          </Link>
          <Link to="/student/lpu-touch" className="nav-item">
            <i className="fas fa-mobile-alt"></i>LPU Touch
          </Link>
          <Link to="/student/my-class" className="nav-item">
            <i className="fas fa-chalkboard"></i>My Class
          </Link>
          <Link to="/student/your-dost" className="nav-item">
            <i className="fas fa-users"></i>YourDost
          </Link>
        </nav>
      </aside>
      <main className="student-main-content">
        <header className="student-main-header">
          <div className="header-left">
            {/* Expand/Collapse sidebar button if needed */}
          </div>
          <div className="header-right">
            <div className="profile-section">
              <div className="profile-details">
                <p className="user-name">{user.firstName} {user.lastName}</p>
                <p className="user-info">VID: {user.userId} | Section: {user.section}</p>
                <p className="user-info">{user.branch}</p>
              </div>
              <img src={user.profilePic} alt="Profile" className="profile-pic" />
              <button onClick={handleLogout} className="sign-out-button">Sign out</button>
            </div>
          </div>
        </header>
        <div className="student-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout; 