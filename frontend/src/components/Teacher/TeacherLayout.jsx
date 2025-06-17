import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import './TeacherLayout.css';

const TeacherLayout = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Dummy user data for demonstration, replace with actual user data from context/state
  const user = JSON.parse(localStorage.getItem('user')) || {
    firstName: 'John',
    lastName: 'Doe',
    userId: 'TEACHER_001',
    section: 'N/A',
    branch: 'Mathematics Dept.',
    profilePic: '/vite.svg' // Using local vite.svg for testing
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/login');
  };

  return (
    <div className="teacher-layout">
      <aside className="teacher-sidebar">
        <div className="sidebar-logo">
          <Link to="/teacher/dashboard">
            <img src="/vite.svg" alt="UMS Logo" className="ums-logo" />
            <div className="logo-text">
              <span className="ums-abbr">UMS</span>
              <span className="ums-full">School Management System</span>
            </div>
          </Link>
        </div>
        <nav className="teacher-nav-links">
          <Link to="/teacher/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>Dashboard
          </Link>
          <Link to="/teacher/courses" className="nav-item">
            <i className="fas fa-book"></i>Courses
          </Link>
          <Link to="/teacher/assignments" className="nav-item">
            <i className="fas fa-tasks"></i>Assignments
          </Link>
          <Link to="/teacher/schedule" className="nav-item">
            <i className="fas fa-calendar-alt"></i>Schedule
          </Link>
          <Link to="/teacher/students" className="nav-item">
            <i className="fas fa-user-graduate"></i>Students
          </Link>
          <Link to="/teacher/attendance" className="nav-item">
            <i className="fas fa-clipboard-check"></i>Attendance
          </Link>
          <Link to="/teacher/communication" className="nav-item">
            <i className="fas fa-comments"></i>Communication
          </Link>
          <Link to="/teacher/reports" className="nav-item">
            <i className="fas fa-chart-line"></i>Reports
          </Link>
          <Link to="/teacher/profile" className="nav-item">
            <i className="fas fa-user-circle"></i>Profile
          </Link>
        </nav>
      </aside>
      <main className="teacher-main-content">
        <header className="teacher-main-header">
          <div className="header-left">
            {/* Expand/Collapse sidebar button if needed */}
          </div>
          <div className="header-right">
            <div className="profile-section">
              <div className="profile-details">
                <p className="user-name">{user.firstName} {user.lastName}</p>
                <p className="user-info">ID: {user.userId}</p>
                <p className="user-info">{user.branch}</p>
              </div>
              <img src={user.profilePic} alt="Profile" className="profile-pic" />
              <button onClick={handleLogout} className="sign-out-button">Sign out</button>
            </div>
          </div>
        </header>
        <div className="teacher-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout; 