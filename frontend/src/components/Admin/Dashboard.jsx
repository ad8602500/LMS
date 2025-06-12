import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Teachers from './Teachers';
import Students from './Students';
import Classes from './Classes';
import Timetable from './Timetable';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalAttendance: 0,
    totalFees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching dashboard statistics', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    // redirect to login
  }
  if (user.role !== 'ADMIN') {
    // redirect to their dashboard
  }

  const statCards = [
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Today\'s Attendance',
      value: stats.totalAttendance,
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.totalFees}`,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">School Admin</div>
        <nav>
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'teachers' ? 'active' : ''} 
            onClick={() => setActiveTab('teachers')}
          >
            👨‍🏫 Teachers
          </button>
          <button 
            className={activeTab === 'students' ? 'active' : ''} 
            onClick={() => setActiveTab('students')}
          >
            👨‍🎓 Students
          </button>
          <button 
            className={activeTab === 'classes' ? 'active' : ''} 
            onClick={() => setActiveTab('classes')}
          >
            📚 Classes
          </button>
          <button 
            className={activeTab === 'timetable' ? 'active' : ''} 
            onClick={() => setActiveTab('timetable')}
          >
            ⏰ Timetable
          </button>
          <button 
            className={activeTab === 'fees' ? 'active' : ''} 
            onClick={() => setActiveTab('fees')}
          >
            💰 Fees
          </button>
          <button 
            className={activeTab === 'attendance' ? 'active' : ''} 
            onClick={() => setActiveTab('attendance')}
          >
            📝 Attendance
          </button>
          <button 
            className={activeTab === 'exams' ? 'active' : ''} 
            onClick={() => setActiveTab('exams')}
          >
            📝 Exams
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-actions">
            <button className="refresh-button" onClick={fetchStats}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                {statCards.map((card) => (
                  <div key={card.title} className="stat-card">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" component="div">
                        {card.title}
                      </Typography>
                      <Box sx={{ color: card.color }}>{card.icon}</Box>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: card.color }}>
                      {card.value}
                    </Typography>
                  </div>
                ))}
              </div>

              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {stats?.recentActivity?.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-time">{activity.time}</span>
                      <span className="activity-text">{activity.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teachers' && <Teachers />}

          {activeTab === 'students' && <Students />}

          {activeTab === 'classes' && <Classes />}

          {activeTab === 'timetable' && <Timetable />}

          {activeTab === 'fees' && (
            <div className="fees-section">
              <div className="section-header">
                <h2>Fee Management</h2>
                <button className="add-button">+ Add Fee Record</button>
              </div>
              <div className="fees-list">
                {/* Fees list will be implemented here */}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="attendance-section">
              <div className="section-header">
                <h2>Attendance</h2>
                <button className="add-button">+ Mark Attendance</button>
              </div>
              <div className="attendance-list">
                {/* Attendance list will be implemented here */}
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="exams-section">
              <div className="section-header">
                <h2>Exams</h2>
                <button className="add-button">+ Schedule Exam</button>
              </div>
              <div className="exams-list">
                {/* Exams list will be implemented here */}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <div className="section-header">
                <h2>Reports</h2>
                <button className="add-button">+ Generate Report</button>
              </div>
              <div className="reports-list">
                {/* Reports list will be implemented here */}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Settings</h2>
              </div>
              <div className="settings-form">
                {/* Settings form will be implemented here */}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 