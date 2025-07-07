// MessagingPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MessagingPanel.css';

const MessagingPanel = ({ user }) => {
  // Common state
  const [status, setStatus] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);

  // Student-to-teacher/admin state
  const [studentMessage, setStudentMessage] = useState('');
  const [recipient, setRecipient] = useState('TEACHER'); // 'TEACHER' or 'ADMIN'

  const token = localStorage.getItem('token');

  // Fetch received messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/message/student/received', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReceivedMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setReceivedMessages([]);
      }
    };

    if (user.role === 'STUDENT') {
      fetchMessages();
    }
  }, [user.role, token]);

  // Handle student ➝ teacher or admin
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!studentMessage.trim()) {
      setStatus('Please enter a message.');
      return;
    }
    try {
      const endpoint =
        recipient === 'TEACHER'
          ? 'http://localhost:5000/api/message/student-to-teacher'
          : 'http://localhost:5000/api/message/student-to-admin';
      await axios.post(
        endpoint,
        { content: studentMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus(
        recipient === 'TEACHER'
          ? 'Message sent to teacher.'
          : 'Message sent to admin.'
      );
      setStudentMessage('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to send message.');
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

      {/* STUDENT to TEACHER or ADMIN */}
      {user.role === 'STUDENT' && (
        <form onSubmit={handleStudentSubmit} className="messaging-form">
          <h3>Send Message</h3>
          <label>
            Send to:
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="TEACHER">Class Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <br />
          <textarea
            rows="4"
            value={studentMessage}
            onChange={(e) => setStudentMessage(e.target.value)}
            placeholder="Type your message..."
            required
          />
          <br />
          <button type="submit">
            {recipient === 'TEACHER' ? 'Send to Teacher' : 'Send to Admin'}
          </button>
        </form>
      )}

      {/* Display received messages for students */}
      {user.role === 'STUDENT' && (
        <div className="received-messages">
          <h3>Received Messages</h3>
          {receivedMessages.length === 0 ? (
            <p>No messages received.</p>
          ) : (
            receivedMessages.map((message) => (
              <div key={message._id} className="received-message">
                <div className="message-meta">
                  <strong>{message.sender?.firstName} {message.sender?.lastName}</strong>
                  <span className="message-date">{new Date(message.timestamp).toLocaleString()}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MessagingPanel;
