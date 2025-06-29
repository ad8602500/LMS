import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Communication.css';

const Communication = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [recipientType, setRecipientType] = useState('admin');
  const [studentId, setStudentId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'TEACHER') {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/message/received', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setReceivedMessages(res.data);
        } catch (err) {
          setReceivedMessages([]);
        }
      };
      fetchMessages();
    }
  }, [user.role]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!messageContent.trim()) {
      setStatus('Please enter a message.');
      return;
    }
    if (recipientType === 'student' && !studentId.trim()) {
      setStatus('Please enter student ID or name.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload = { content: messageContent };
      switch (recipientType) {
        case 'all-students':
          endpoint = '/api/message/teacher-to-all-students';
          break;
        case 'admin':
          endpoint = '/api/message/teacher-to-admin';
          break;
        case 'student':
          endpoint = '/api/message/teacher-to-student';
          payload = { content: messageContent, studentId: studentId.trim() };
          break;
        default:
          setStatus('Invalid recipient type.');
          setLoading(false);
          return;
      }
      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Message sent!');
      setMessageContent('');
      setStudentId('');
    } catch (err) {
      setStatus('Failed to send message.');
    }
    setLoading(false);
  };

  return (
    <div className="comm-container">
      <h2 className="comm-title">Teacher Communication</h2>
      <div className="comm-card">
        <form className="comm-form" onSubmit={handleMessageSubmit}>
          <div className="comm-form-group">
            <label htmlFor="recipientType">Send to</label>
            <select
              id="recipientType"
              value={recipientType}
              onChange={e => setRecipientType(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="all-students">All Students</option>
              <option value="student">Student</option>
            </select>
          </div>
          {recipientType === 'student' && (
            <div className="comm-form-group">
              <label htmlFor="studentId">Student ID or Name</label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="Enter student ID or name..."
                required
              />
            </div>
          )}
          <div className="comm-form-group">
            <label htmlFor="messageContent">Message</label>
            <textarea
              id="messageContent"
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              placeholder="Type your message..."
              required
            />
          </div>
          <button className="comm-send-btn" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
          {status && <div className={`comm-status${status.includes('sent') ? ' success' : ' error'}`}>{status}</div>}
        </form>
      </div>
      <div className="comm-messages-section">
        <h3 className="comm-messages-title">Received Messages</h3>
        {receivedMessages.length === 0 ? (
          <div className="comm-no-messages">No messages received.</div>
        ) : (
          <div className="comm-messages-list">
            {receivedMessages.map((msg) => (
              <div className="comm-message-card" key={msg._id}>
                <div className="comm-message-meta">
                  <span className="comm-sender">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                  <span className="comm-date">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <div className="comm-message-content">{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication; 