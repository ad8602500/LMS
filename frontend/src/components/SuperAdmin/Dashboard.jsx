import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SchoolForm from './SchoolForm';
import './Dashboard.css';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const activityData = [
  { time: '27 min', text: 'New order placed! Order #2912 has been successfully placed.' },
  { time: '2 hrs', text: 'Your weekly report has been generated and is ready to view.' },
  { time: '2 hrs', text: 'New user Valerie Luna has registered.' },
  { time: '1 day', text: 'Server activity monitor alert.' },
  { time: '1 day', text: 'Order #2911 has been successfully placed.' },
  { time: '2 days', text: 'Details for Marketing and Planning Meeting have been updated.' },
];

const progressData = [
  { label: 'Server Migration', value: 20, color: 'blue' },
  { label: 'Sales Tracking', value: 40, color: 'orange' },
  { label: 'Customer Database', value: 60, color: 'blue' },
  { label: 'Payout Details', value: 80, color: 'cyan' },
  { label: 'Account Setup', value: 100, color: 'green' },
];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalAdmins: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
  });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'schools'
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchStats();
    fetchSchools();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/super-admin/stats');
      setStats(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching dashboard statistics', { variant: 'error' });
    }
  };

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/super-admin/schools', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSchools(data);
      } else {
        setError(data.message || 'Failed to fetch schools');
      }
    } catch (error) {
      setError('Failed to fetch schools. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/super-admin/schools/${schoolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSchools(schools.filter(school => school._id !== schoolId));
        setStats(prev => ({
          ...prev,
          totalSchools: prev.totalSchools - 1
        }));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete school');
      }
    } catch (error) {
      setError('Failed to delete school. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    fetchStats();
    fetchSchools();
  };

  const handleCreateSchool = async (form) => {
    setFormLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/register-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create school');
      }

      // Add the new school to the schools list immediately
      setSchools(prevSchools => [...prevSchools, data.school]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalSchools: (prev?.totalSchools || 0) + 1
      }));

      // Close the form
      setShowSchoolForm(false);
      
      // Show success message (you can add a toast notification here if you have one)
      alert('School created successfully!');
      
    } catch (error) {
      setError(error.message || 'Failed to create school');
      throw error; // Re-throw to let the form component handle the error
    } finally {
      setFormLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Schools',
      value: stats.totalSchools,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
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
    <div className="super-admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">LMS Admin</div>
        <nav>
          <a href="#" className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>🏠 Dashboard</a>
          <a href="#" className={view === 'schools' ? 'active' : ''} onClick={() => setView('schools')}>🏫 Schools</a>
          <a href="#">👤 Users</a>
          <a href="#">⚙️ Settings</a>
        </nav>
        <div className="sidebar-footer">Logged in as: <b>Super Admin</b></div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="title">{view === 'dashboard' ? 'Dashboard' : 'Schools'}</div>
          <div className="date-picker">October 13, 2020 - November 11, 2020</div>
        </div>

        {view === 'dashboard' && (
          <div className="dashboard-content">
            {/* Left Panel */}
            <div className="left-panel">
              {/* Welcome Card */}
              <div className="welcome-card">
                <div className="welcome-text">
                  <h2>Welcome to LMS Admin Pro!</h2>
                  <p>Browse our fully designed UI toolkit! Browse our prebuilt app pages, components, and utilities, and be sure to look at our full documentation!</p>
                </div>
                <div className="welcome-illustration"></div>
              </div>

              {/* Stats Row */}
              <div className="stats-row">
                <Grid container spacing={3}>
                  {statCards.map((card) => (
                    <Grid item xs={12} sm={6} md={4} key={card.title}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        <CardContent>
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
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </div>

              {/* Chart Placeholders */}
              <div className="chart-placeholder" style={{marginTop: '2rem'}}>
                <b>Earnings Breakdown (Chart Placeholder)</b>
                <div style={{height: '120px'}}></div>
              </div>
              <div className="chart-placeholder">
                <b>Monthly Revenue (Chart Placeholder)</b>
                <div style={{height: '120px'}}></div>
              </div>
            </div>
            {/* Right Panel */}
            <div className="right-panel">
              {/* Activity Feed */}
              <div className="widget-card">
                <h3 style={{color: '#2962ff', marginBottom: '1rem'}}>Recent Activity</h3>
                <div className="activity-feed">
                  {activityData.map((item, idx) => (
                    <div className="activity-item" key={idx}>
                      <span className="activity-time">{item.time}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Progress Tracker */}
              <div className="widget-card">
                <h3 style={{color: '#2962ff', marginBottom: '1rem'}}>Progress Tracker</h3>
                <div className="progress-tracker">
                  {progressData.map((item, idx) => (
                    <div className="progress-row" key={idx}>
                      <span className="progress-label">{item.label}</span>
                      <div className="progress-bar-bg">
                        <div className={`progress-bar ${item.color}`} style={{width: `${item.value}%`}}></div>
                      </div>
                      <span style={{minWidth: 40, textAlign: 'right'}}>{item.value === 100 ? 'Complete!' : `${item.value}%`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'schools' && (
          <div className="widget-card schools-section">
            <div className="schools-header-row">
              <h3>Schools</h3>
              <button className="add-school-button" onClick={() => setShowSchoolForm(true)}>
                + Create New School
              </button>
            </div>
            <div className="schools-list">
              {schools.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d', fontSize: '1.1rem' }}>
                  No schools found. Click "Create New School" to add one.
                </div>
              ) : (
                schools.map(school => (
                  <div key={school._id} className="school-card">
                    <h3>{school.name}</h3>
                    <p><b>ID:</b> {school.schoolId}</p>
                    <p><b>Email:</b> {school.contactEmail}</p>
                    <p><b>Phone:</b> {school.contactPhone}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        <SchoolForm
          open={showSchoolForm}
          onClose={() => setShowSchoolForm(false)}
          onSubmit={handleCreateSchool}
          loading={formLoading}
        />
      </main>
    </div>
  );
};

export default SuperAdminDashboard; 