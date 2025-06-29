import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Teacher/Communication.css';

const AdminMessages = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [recipientType, setRecipientType] = useState('all-teachers');
  const [targetId, setTargetId] = useState('');
  const [classId, setClassId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // Fetch teachers, students, classes
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [teachersRes, studentsRes, classesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/teachers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/classes', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTeachers(teachersRes.data);
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        setTeachers([]);
        setStudents([]);
        setClasses([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user.role === 'ADMIN') {
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
    if ((recipientType === 'teacher' || recipientType === 'student') && !targetId.trim()) {
      setStatus('Please select a recipient.');
      return;
    }
    if (recipientType === 'class' && !classId.trim()) {
      setStatus('Please select a class.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload = { content: messageContent };
      switch (recipientType) {
        case 'all-teachers':
          endpoint = '/api/message/admin-to-all-teachers';
          break;
        case 'teacher':
          endpoint = '/api/message/admin-to-teacher';
          payload = { content: messageContent, teacherId: targetId };
          break;
        case 'all-students':
          endpoint = '/api/message/admin-to-all-students';
          break;
        case 'class':
          endpoint = '/api/message/admin-to-class';
          payload = { content: messageContent, classId };
          break;
        case 'student':
          endpoint = '/api/message/admin-to-student';
          payload = { content: messageContent, studentId: targetId };
          break;
        default:
          setStatus('Invalid recipient type.');
          setLoading(false);
          return;
      }
      await axios.post('http://localhost:5000/api/message/admin-to-teacher', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Message sent!');
      setMessageContent('');
      setTargetId('');
      setClassId('');
    } catch (err) {
      setStatus('Failed to send message.');
    }
    setLoading(false);
  };

  return (
    <div className="comm-container">
      <h2 className="comm-title">Admin Messages</h2>
      <div className="comm-card">
        <form className="comm-form" onSubmit={handleMessageSubmit}>
          <div className="comm-form-group">
            <label htmlFor="recipientType">Send to</label>
            <select
              id="recipientType"
              value={recipientType}
              onChange={e => {
                setRecipientType(e.target.value);
                setTargetId('');
                setClassId('');
              }}
            >
              <option value="all-teachers">All Teachers</option>
              <option value="teacher">Teacher (Select One)</option>
              <option value="all-students">All Students</option>
              <option value="class">Class (All Students in Class)</option>
              <option value="student">Student (Select One)</option>
            </select>
          </div>
          {recipientType === 'teacher' && (
            <div className="comm-form-group">
              <label htmlFor="teacherId">Select Teacher</label>
              <select
                id="teacherId"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                required
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.userId})
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <div className="comm-form-group">
              <label htmlFor="studentId">Select Student</label>
              <select
                id="studentId"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
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

export default AdminMessages; 