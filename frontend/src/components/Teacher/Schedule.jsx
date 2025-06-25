import axios from 'axios';
import React, { useEffect, useState } from 'react';

// Create axios instance for backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Basic styles for the timetable
const styles = {
  scheduleContainer: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  daySection: {
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px'
  },
  dayTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    borderBottom: '2px solid #007bff',
    paddingBottom: '5px'
  },
  classesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  classEntry: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    border: '1px solid #e9ecef'
  },
  periodInfo: {
    color: '#007bff',
    marginBottom: '5px'
  },
  classDetails: {
    marginBottom: '5px'
  },
  subject: {
    fontWeight: 'bold',
    color: '#495057'
  },
  className: {
    color: '#6c757d'
  },
  timeInfo: {
    fontSize: '0.9em',
    color: '#6c757d',
    fontStyle: 'italic'
  },
  noClasses: {
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#007bff'
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '5px'
  }
};

const Schedule = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/timetable/timetable', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API response:', response.data);
        setTimetable(response.data.timetable || {});
      } catch (err) {
        console.error('Error fetching timetable:', err);
        setError(err.response?.data?.message || 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) return <div style={styles.loading}>Loading timetable...</div>;

  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.scheduleContainer}>
      <h2>My Timetable</h2>
      {daysOfWeek.map(day => (
        <div key={day} style={styles.daySection}>
          <h3 style={styles.dayTitle}>{day}</h3>
          <div style={styles.classesList}>
            {(timetable[day] || []).length === 0 ? (
              <p style={styles.noClasses}>No classes scheduled</p>
            ) : (
              timetable[day].map(entry => (
                <div key={entry._id} style={styles.classEntry}>
                  <div style={styles.periodInfo}>
                    <strong>Period {entry.period}</strong>
                  </div>
                  <div style={styles.classDetails}>
                    <span style={styles.subject}>{entry.subject}</span>
                    {entry.classId && (
                      <span style={styles.className}>
                        - {entry.classId.name} {entry.classId.section}
                      </span>
                    )}
                  </div>
                  {entry.startTime && entry.endTime && (
                    <div style={styles.timeInfo}>
                      {entry.startTime} - {entry.endTime}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Schedule;