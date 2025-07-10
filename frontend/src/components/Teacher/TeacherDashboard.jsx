import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';
import axios from 'axios';

const POLL_INTERVAL = 30000; // 30 seconds

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // Mock data for cards without backend endpoints
  const mockAssignments = [
    { title: 'Math Homework - Class 10A', due: '2024-07-15' },
    { title: 'Physics Lab Report - Class 11B', due: '2024-07-18' },
  ];
  const mockAttendance = {
    summary: "Today's attendance marked for 3/5 classes.",
    upcoming: 'Upcoming attendance to be marked for Class 9C.'
  };
  const mockAnnouncements = [
    'Parent-Teacher Meeting scheduled for Aug 5th.',
    'Professional development workshop on July 25th.'
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      // Fetch dashboard stats
      const statsRes = await axios.get('http://localhost:5000/api/teacherDashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);
      // Fetch classes
      const classesRes = await axios.get('http://localhost:5000/api/teacherDashboard/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(classesRes.data);
      // Fetch recent messages
      const messagesRes = await axios.get('http://localhost:5000/api/message/teacher/received', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messagesRes.data.slice(0, 5)); // Show only 5 recent messages
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="teacher-dashboard"><div className="dashboard-content"><p>Loading dashboard...</p></div></div>;
  }
  if (error) {
    return <div className="teacher-dashboard"><div className="dashboard-content"><p>{error}</p></div></div>;
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-content">
        {/* Dashboard Overview Card */}
        <div className="dashboard-card overview-card">
          <h2 className="card-title"><i className="fas fa-info-circle"></i> Dashboard Overview</h2>
          <div className="card-body">
            <p>Welcome, Teacher! Here's a summary of your activities.</p>
            <ul>
              <li>Total Classes: <strong>{stats?.totalClasses ?? '-'}</strong></li>
              <li>Total Students: <strong>{stats?.totalStudents ?? '-'}</strong></li>
              <li>Pending Assignments to Review: <strong>{mockAssignments.length}</strong></li>
              <li>Upcoming Classes Today: <strong>{stats?.upcomingClasses?.length ?? 0}</strong></li>
            </ul>
          </div>
        </div>

        {/* My Classes Card */}
        <div className="dashboard-card classes-card">
          <h2 className="card-title"><i className="fas fa-chalkboard"></i> My Classes</h2>
          <div className="card-body">
            <ul>
              {classes.length > 0 ? (
                classes.map(cls => (
                  <li key={cls._id}>{cls.name} - {cls.subject}</li>
                ))
              ) : (
                <li>No classes assigned.</li>
              )}
            </ul>
            <div className="card-footer">
              <button className="view-more-button">View All Classes</button>
            </div>
          </div>
        </div>

        {/* Pending Assignments Card (Mock) */}
        <div className="dashboard-card assignments-card">
          <h2 className="card-title"><i className="fas fa-tasks"></i> Pending Assignments</h2>
          <div className="card-body">
            <p>Assignments needing your attention:</p>
            <ul>
              {mockAssignments.map((a, idx) => (
                <li key={idx}>{a.title} (Due: {a.due})</li>
              ))}
            </ul>
            <div className="card-footer">
              <button className="view-more-button">Review Assignments</button>
            </div>
          </div>
        </div>

        {/* Recent Messages Card */}
        <div className="dashboard-card messages-card">
          <h2 className="card-title"><i className="fas fa-envelope"></i> Recent Messages</h2>
          <div className="card-body">
            <ul>
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <li key={msg._id || idx}>
                    {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}: {msg.content}
                  </li>
                ))
              ) : (
                <li>No recent messages.</li>
              )}
            </ul>
            <div className="card-footer">
              <button className="all-messages-button">View All Messages</button>
            </div>
          </div>
        </div>

        {/* Attendance Summary Card (Mock) */}
        <div className="dashboard-card attendance-card">
          <h2 className="card-title"><i className="fas fa-clipboard-check"></i> Attendance Summary</h2>
          <div className="card-body">
            <p>{mockAttendance.summary}</p>
            <p>{mockAttendance.upcoming}</p>
            <div className="card-footer">
              <button className="view-more-button">Mark Attendance</button>
            </div>
          </div>
        </div>

        {/* School Announcements Card (Mock) */}
        <div className="dashboard-card announcements-card">
          <h2 className="card-title"><i className="fas fa-bullhorn"></i> School Announcements</h2>
          <div className="card-body">
            <ul>
              {mockAnnouncements.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
            <div className="card-footer">
              <button className="view-more-button">View All Announcements</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard; 