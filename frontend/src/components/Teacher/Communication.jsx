import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Communication.css';

const Communication = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [recipientType, setRecipientType] = useState('admin');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch teacher's classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/class/teacher/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(res.data);
      } catch (err) {
        setClasses([]);
      }
    };
    if (user.role === 'TEACHER') {
      fetchClasses();
    }
  }, [user.role]);

  // Fetch students when classId changes and recipientType is student
  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) {
        setStudents([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/class/${classId}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
      } catch (err) {
        setStudents([]);
      }
    };
    if (recipientType === 'student' && classId) {
      fetchStudents();
    }
  }, [recipientType, classId]);

  // Fetch received messages
  useEffect(() => {
    if (user.role === 'TEACHER') {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/message/teacher/received', {
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
    if (recipientType === 'class' && !classId) {
      setStatus('Please select a class.');
      return;
    }
    if (recipientType === 'student' && (!classId || !studentId)) {
      setStatus('Please select a class and student.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload = { content: messageContent };
      switch (recipientType) {
        case 'class':
          endpoint = '/api/message/teacher-to-class';
          payload = { content: messageContent, classId };
          break;
        case 'admin':
          endpoint = '/api/message/teacher-to-admin';
          break;
        case 'student':
          endpoint = '/api/message/teacher-to-student';
          payload = { content: messageContent, studentId };
          break;
        default:
          setStatus('Invalid recipient type.');
          setLoading(false);
          return;
      }
      await axios.post(`http://localhost:5000${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Message sent!');
      setMessageContent('');
      setClassId('');
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
              onChange={e => {
                setRecipientType(e.target.value);
                setClassId('');
                setStudentId('');
              }}
            >
              <option value="admin">Admin</option>
              <option value="class">Class (All Students in Class)</option>
              <option value="student">Student (Select One)</option>
            </select>
          </div>
          {recipientType === 'class' && (
            <div className="comm-form-group">
              <label htmlFor="classId">Select Class</label>
              <select
                id="classId"
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} {cls.section ? `(${cls.section})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {recipientType === 'student' && (
            <>
              <div className="comm-form-group">
                <label htmlFor="classId">Select Class</label>
                <select
                  id="classId"
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} {cls.section ? `(${cls.section})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="comm-form-group">
                <label htmlFor="studentId">Select Student</label>
                <select
                  id="studentId"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} ({student.userId})
                    </option>
                  ))}
                </select>
              </div>
            </>
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