import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';
import Teachers from './Teachers';
import Students from './Students';
import Classes from './Classes';
import Timetable from './Timetable';
import Attendance from './Attendance';
import Fees from './Fees';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalAttendance: 0,
    totalFees: 0,
  });
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [msgRecipientType, setMsgRecipientType] = useState('all-teachers');
  const [msgTargetId, setMsgTargetId] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgStatus, setMsgStatus] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [myMessages, setMyMessages] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMyMessages();
  }, []);

  const fetchStats = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/stats', {
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

  const fetchMyMessages = async () => {
    setMsgLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/message/received', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyMessages(res.data);
    } catch (err) {
      setMyMessages([]);
    }
    setMsgLoading(false);
  };

  const statCards = [
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    },
    {
      title: 'Today\'s Attendance',
      value: stats.totalAttendance,
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.totalFees}`,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
    },
  ];

  const handleAdminMessageSend = async (e) => {
    e.preventDefault();
    setMsgStatus('');
    if (!msgContent.trim()) {
      setMsgStatus('Please enter a message.');
      return;
    }
    if ((msgRecipientType === 'teacher' || msgRecipientType === 'student') && !msgTargetId.trim()) {
      setMsgStatus('Please enter the ID or name.');
      return;
    }
    setMsgLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload = { content: msgContent };
      switch (msgRecipientType) {
        case 'all-teachers':
          endpoint = '/api/message/admin-to-all-teachers';
          break;
        case 'all-students':
          endpoint = '/api/message/admin-to-all-students';
          break;
        case 'teacher':
          endpoint = '/api/message/admin-to-teacher';
          payload = { content: msgContent, teacherId: msgTargetId.trim() };
          break;
        case 'student':
          endpoint = '/api/message/admin-to-student';
          payload = { content: msgContent, studentId: msgTargetId.trim() };
          break;
        default:
          setMsgStatus('Invalid recipient type.');
          setMsgLoading(false);
          return;
      }
      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsgStatus('Message sent!');
      setMsgContent('');
      setMsgTargetId('');
    } catch (err) {
      setMsgStatus('Failed to send message.');
    }
    setMsgLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5">Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        {/* Overall Statistics Card */}
        <div className="dashboard-card statistics-card">
          <h2 className="card-title"><i className="fas fa-chart-bar"></i> Overall Statistics</h2>
          <div className="card-body">
            <ul>
              <li>Total Schools: <strong>5</strong></li>
              <li>Total Admins: <strong>15</strong></li>
              <li>Total Teachers: <strong>200</strong></li>
              <li>Total Students: <strong>5000</strong></li>
            </ul>
          </div>
        </div>

        {/* Recent Registrations Card */}
        <div className="dashboard-card registrations-card">
          <h2 className="card-title"><i className="fas fa-user-plus"></i> Recent Registrations</h2>
          <div className="card-body">
            <ul>
              <li>New School: Green Valley High (ID: GVH001) - 2024-07-10</li>
              <li>New Teacher: Ms. Alice Smith (ID: TCH045) - 2024-07-09</li>
              <li>New Student: Bob Johnson (ID: STU5001) - 2024-07-09</li>
            </ul>
            <div className="card-footer">
              <button className="view-more-button">View All Registrations</button>
            </div>
          </div>
        </div>

        {/* School Management Quick Links Card */}
        <div className="dashboard-card quick-links-card">
          <h2 className="card-title"><i className="fas fa-link"></i> School Management</h2>
          <div className="card-body">
            <ul>
              <li><Link to="/admin/schools" className="dashboard-link">Manage Schools</Link></li>
              <li><Link to="/admin/users" className="dashboard-link">Manage Users</Link></li>
              <li><Link to="/admin/classes" className="dashboard-link">Manage Classes</Link></li>
            </ul>
          </div>
        </div>

        {/* System Health / Alerts Card */}
        <div className="dashboard-card alerts-card">
          <h2 className="card-title"><i className="fas fa-exclamation-triangle"></i> System Alerts</h2>
          <div className="card-body">
            <p>No critical alerts at this time.</p>
            <ul>
              <li>Database backup completed successfully.</li>
              <li>Server uptime: 99.9%</li>
            </ul>
            <div className="card-footer">
              <button className="view-more-button">View System Logs</button>
            </div>
          </div>
        </div>

        {/* Reports & Analytics Card */}
        <div className="dashboard-card reports-card">
          <h2 className="card-title"><i className="fas fa-chart-pie"></i> Reports & Analytics</h2>
          <div className="card-body">
            <ul>
              <li><Link to="/admin/reports/enrollment" className="dashboard-link">Enrollment Reports</Link></li>
              <li><Link to="/admin/reports/attendance" className="dashboard-link">Attendance Reports</Link></li>
              <li><Link to="/admin/reports/financial" className="dashboard-link">Financial Reports</Link></li>
            </ul>
            <div className="card-footer">
              <button className="view-more-button">Generate New Report</button>
            </div>
          </div>
        </div>

        {/* Attendance Management Card - NEW */}
        <div className="dashboard-card attendance-management-card">
          <h2 className="card-title"><i className="fas fa-user-check"></i> Attendance Management</h2>
          <div className="card-body">
            <p>Manage and view attendance records for students and teachers.</p>
            <ul>
              <li><Link to="/admin/attendance" className="dashboard-link">View Student Attendance</Link></li>
              <li><Link to="/admin/attendance" className="dashboard-link">View Teacher Attendance</Link></li>
              <li><Link to="/admin/attendance" className="dashboard-link">Generate Attendance Reports</Link></li>
            </ul>
          </div>
          <div className="card-footer">
            <button className="view-more-button">Go to Attendance</button>
          </div>
        </div>

        {/* My Messages Card */}
        <div className="dashboard-card my-messages-card">
          <h2 className="card-title"><i className="fas fa-inbox"></i> My Messages</h2>
          <div className="card-body">
            {msgLoading ? (
              <div>Loading messages...</div>
            ) : myMessages.length === 0 ? (
              <div>No messages received.</div>
            ) : (
              <div className="my-messages-list">
                {myMessages.map((msg) => (
                  <div className="my-message-item" key={msg._id}>
                    <div className="my-message-meta">
                      <span className="my-message-sender">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                      <span className="my-message-date">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="my-message-content">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard; 