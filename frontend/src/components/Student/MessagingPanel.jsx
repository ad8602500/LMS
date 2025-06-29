// MessagingPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './MessagingPanel.css';

const MessagingPanel = ({ user }) => {
  // Common state
  const [status, setStatus] = useState('');

  // Student-to-teacher state
  const [studentMessage, setStudentMessage] = useState('');

  // Teacher-to-student state
  const [teacherMessage, setTeacherMessage] = useState('');
  const [studentId, setStudentId] = useState('');

  // Teacher-to-class broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const token = localStorage.getItem('token');

  // Handle student ➝ teacher
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/message/student-to-teacher',
        { content: studentMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus('Message sent to teacher.');
      setStudentMessage('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to send message.');
    }
  };

  // Handle teacher ➝ student
  const handleTeacherToStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/message/teacher-to-student',
        {
          content: teacherMessage,
          studentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus('Message sent to student.');
      setTeacherMessage('');
      setStudentId('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to send message to student.');
    }
  };

  // Handle teacher ➝ class
  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/message/teacher-to-class',
        { content: broadcastMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus('Broadcast message sent to class.');
      setBroadcastMessage('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to broadcast message.');
    }
  };

  return (
    <div className="messaging-panel-container">
      <h2 className="messaging-panel-title">Messaging Panel</h2>
      {status && (
        <p className={`messaging-status${status.toLowerCase().includes('sent') ? ' success' : ''}`}>
          {status}
        </p>
      )}

      {/* STUDENT to TEACHER */}
      {user.role === 'STUDENT' && (
        <form onSubmit={handleStudentSubmit} className="messaging-form">
          <h3>Message Your Class Teacher</h3>
          <textarea
            rows="4"
            value={studentMessage}
            onChange={(e) => setStudentMessage(e.target.value)}
            placeholder="Type your message..."
            required
          />
          <br />
          <button type="submit">Send to Teacher</button>
        </form>
      )}

      {/* TEACHER: Send to one student */}
      {user.role === 'TEACHER' && (
        <>
          <form onSubmit={handleTeacherToStudent} className="messaging-form" style={{ marginTop: '2rem' }}>
            <h3>Send Message to Specific Student</h3>
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
            <br />
            <textarea
              rows="4"
              value={teacherMessage}
              onChange={(e) => setTeacherMessage(e.target.value)}
              placeholder="Message to student..."
              required
            />
            <br />
            <button type="submit">Send to Student</button>
          </form>

          {/* TEACHER: Broadcast to class */}
          <form onSubmit={handleBroadcast} className="messaging-form" style={{ marginTop: '2rem' }}>
            <h3>Broadcast to Class</h3>
            <textarea
              rows="4"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Message to whole class..."
              required
            />
            <br />
            <button type="submit">Broadcast</button>
          </form>
        </>
      )}
    </div>
  );
};

export default MessagingPanel;
