import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import './StudentLayout.css';

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const navItems = [
    { path: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: 'profile', icon: 'fas fa-user', label: 'Personal Info' },
    { path: 'timetable', icon: 'fas fa-calendar-alt', label: 'Timetable' },
    { path: 'subjects', icon: 'fas fa-book', label: 'Subjects & Teachers' },
    { path: 'assignments', icon: 'fas fa-tasks', label: 'Assignments' },
    { path: 'exams', icon: 'fas fa-file-alt', label: 'Exams & Results' },
    { path: 'attendance', icon: 'fas fa-check-circle', label: 'Attendance' },
    { path: 'notices', icon: 'fas fa-bullhorn', label: 'Notices' },
    { path: 'documents', icon: 'fas fa-folder', label: 'Documents' },
    { path: 'messages', icon: 'fas fa-envelope', label: 'Messages' },
    { path: 'fees', icon: 'fas fa-money-bill', label: 'Fee Details' }
  ];

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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={`/student/${item.path}`}
              className={`nav-item ${location.pathname === `/student/${item.path}` ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="student-main-content">
        <header className="student-main-header">
          <div className="header-left">
            <div className="current-page">
              {navItems.find(item => location.pathname.includes(item.path))?.label || 'Dashboard'}
            </div>
          </div>
          <div className="header-right">
            <div className="profile-section">
              <div className="profile-details">
                <p className="user-name">{user.firstName} {user.lastName}</p>
                <p className="user-info">VID: {user.userId} | Section: {user.section}</p>
                <p className="user-info">{user.branch}</p>
              </div>
              <img src={user.profilePic} alt="Profile" className="profile-pic" />
              <button onClick={handleLogout} className="sign-out-button">
                <i className="fas fa-sign-out-alt"></i>
                Sign out
              </button>
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