import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import './AdminLayout.css'; // We will create this CSS file next

const AdminLayout = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Please login to continue', { variant: 'warning' });
      navigate('/login');
    }
  }, [navigate, enqueueSnackbar]);

  // Dummy user data for demonstration, replace with actual user data from context/state
  const user = JSON.parse(localStorage.getItem('user')) || {
    firstName: 'Admin',
    lastName: 'User',
    userId: 'ADMIN_001',
    branch: 'School Administration',
    profilePic: '/vite.svg' // Using local vite.svg for testing
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <Link to="/admin/dashboard">
            <img src="/vite.svg" alt="UMS Logo" className="ums-logo" />
            <div className="logo-text">
              <span className="ums-abbr">UMS</span>
              <span className="ums-full">School Management System</span>
            </div>
          </Link>
        </div>
        <nav className="admin-nav-links">
          <Link to="/admin/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>Dashboard
          </Link>
          <Link to="/admin/teachers" className="nav-item">
            <i className="fas fa-chalkboard-teacher"></i>Teachers
          </Link>
          <Link to="/admin/students" className="nav-item">
            <i className="fas fa-user-graduate"></i>Students
          </Link>
          <Link to="/admin/classes" className="nav-item">
            <i className="fas fa-school"></i>Classes
          </Link>
          <Link to="/admin/attendance" className="nav-item">
            <i className="fas fa-clipboard-check"></i>Attendance
          </Link>
          <Link to="/admin/fees" className="nav-item">
            <i className="fas fa-money-bill-wave"></i>Fees
          </Link>
          <Link to="/admin/timetable" className="nav-item">
            <i className="fas fa-calendar-alt"></i>Timetable
          </Link>
          <Link to="/admin/messages" className="nav-item">
            <i className="fas fa-envelope"></i>Messages
          </Link>
          {/* Add more admin specific links here */}
        </nav>
      </aside>
      <main className="admin-main-content">
        <header className="admin-main-header">
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
        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 