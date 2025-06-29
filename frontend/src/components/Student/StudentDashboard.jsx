import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch messages sent to the student by teachers/admins
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/message/received', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
      </div>
      <div className="dashboard-content">
        {/* Main Dashboard Content - Cards */}

        {/* Happening Card */}
        <div className="dashboard-card happening-card">
          <h2 className="card-title"><i className="fas fa-bell"></i> Happening</h2>
          <div className="card-body">
            <ul>
              <li><strong>LPU Hosted Career Skills</strong><br/>Conference to Bridge Education and Industry for Future-Ready Professionals</li>
              <li><strong>Broadridge India signs MOU with Lovely Professional University</strong><br/>for Industry-Academia Collaboration</li>
              <li>LPU's campus came alive with...</li>
            </ul>
            <div className="card-footer">
              <span className="event-note">* Happening Events in LPU</span>
              <button className="view-more-button">View More</button>
            </div>
          </div>
        </div>

        {/* My Messages Card */}
        <div className="dashboard-card messages-card">
          <h2 className="card-title"><i className="fas fa-envelope"></i> My Messages</h2>
          <div className="card-body">
            {messages.length === 0 ? (
              <div className="no-messages">No messages from teachers or admin.</div>
            ) : (
              <ul className="messages-list">
                {messages.map((msg) => (
                  <li key={msg._id} className="message-item">
                    <div className="message-header">
                      <span className="sender-name">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                      <span className="sender-role">({msg.sender?.role})</span>
                      <span className="message-date">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="card-footer">
              <span className="event-note">* Messages Sent by Teachers/Admin</span>
              <button className="all-messages-button" onClick={() => navigate('/student/messages')}>All Messages</button>
            </div>
          </div>
        </div>

        {/* My Courses Card */}
        <div className="dashboard-card courses-card">
          <h2 className="card-title"><i className="fas fa-book"></i> My Courses</h2>
          <div className="card-body">
            <p>CSE441: INDUSTRY</p>
            <p>HIP PROJECT</p>
            {/* Add more courses as needed */}
          </div>
        </div>

        {/* Fee Card */}
        <div className="dashboard-card fee-card">
          <h2 className="card-title"><i className="fas fa-money-bill-wave"></i> Fee</h2>
          <div className="card-body">
            <p>Your fee details and payment status.</p>
            {/* Add fee details here */}
          </div>
        </div>

        {/* Pending Assignments Card */}
        <div className="dashboard-card assignments-card">
          <h2 className="card-title"><i className="fas fa-tasks"></i> Pending Assignments</h2>
          <div className="card-body">
            <p>No Assignments Available</p>
            {/* List assignments here */}
          </div>
        </div>

        {/* Events Card */}
        <div className="dashboard-card events-card">
          <h2 className="card-title"><i className="fas fa-calendar-alt"></i> Events</h2>
          <div className="card-body">
            <p>Upcoming events will be listed here.</p>
            {/* List events here */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard; 