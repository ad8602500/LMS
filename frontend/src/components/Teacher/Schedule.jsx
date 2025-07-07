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

// Enhanced styles for the timetable
const styles = {
  scheduleContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#7f8c8d',
    marginBottom: '30px'
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '25px'
  },
  daySection: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1e8ed',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  daySectionHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
  },
  dayTitle: {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderBottom: '3px solid #3498db',
    paddingBottom: '10px',
    textAlign: 'center'
  },
  classesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  classEntry: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    border: '2px solid #e9ecef',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  classEntryHover: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
    transform: 'scale(1.02)'
  },
  periodInfo: {
    color: '#3498db',
    marginBottom: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  classDetails: {
    marginBottom: '10px'
  },
  subject: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '1.1rem',
    marginBottom: '5px'
  },
  className: {
    color: '#7f8c8d',
    fontSize: '1rem',
    fontWeight: '500'
  },
  timeInfo: {
    fontSize: '0.9rem',
    color: '#95a5a6',
    fontStyle: 'italic',
    backgroundColor: '#ecf0f1',
    padding: '8px 12px',
    borderRadius: '6px',
    display: 'inline-block',
    marginTop: '8px'
  },
  noClasses: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '30px',
    fontSize: '1.1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '2px dashed #bdc3c7'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#3498db',
    fontSize: '1.2rem',
    fontWeight: '500'
  },
  error: {
    textAlign: 'center',
    padding: '30px',
    color: '#e74c3c',
    backgroundColor: '#fdf2f2',
    border: '2px solid #fecaca',
    borderRadius: '10px',
    margin: '20px 0',
    fontSize: '1.1rem'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    border: '1px solid #e1e8ed'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    fontWeight: '500'
  }
};

const Schedule = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredClass, setHoveredClass] = useState(null);

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

  // Calculate statistics
  const totalClasses = Object.values(timetable).reduce((total, dayClasses) => total + dayClasses.length, 0);
  const totalDays = Object.keys(timetable).filter(day => timetable[day].length > 0).length;

  if (loading) return <div style={styles.loading}>Loading your timetable...</div>;

  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.scheduleContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Timetable</h1>
        <p style={styles.subtitle}>View your class schedule for the week</p>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalClasses}</div>
          <div style={styles.statLabel}>Total Classes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalDays}</div>
          <div style={styles.statLabel}>Active Days</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{daysOfWeek.length}</div>
          <div style={styles.statLabel}>Week Days</div>
        </div>
      </div>

      <div style={styles.daysGrid}>
        {daysOfWeek.map(day => (
          <div 
            key={day} 
            style={{
              ...styles.daySection,
              ...(hoveredDay === day && styles.daySectionHover)
            }}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <h3 style={styles.dayTitle}>{day}</h3>
            <div style={styles.classesList}>
              {(timetable[day] || []).length === 0 ? (
                <div style={styles.noClasses}>
                  <p>No classes scheduled for {day}</p>
                </div>
              ) : (
                timetable[day].map(entry => (
                  <div 
                    key={entry._id} 
                    style={{
                      ...styles.classEntry,
                      ...(hoveredClass === entry._id && styles.classEntryHover)
                    }}
                    onMouseEnter={() => setHoveredClass(entry._id)}
                    onMouseLeave={() => setHoveredClass(null)}
                  >
                    <div style={styles.periodInfo}>
                      Period {entry.period}
                    </div>
                    <div style={styles.classDetails}>
                      <div style={styles.subject}>{entry.subject}</div>
                      {entry.classId && (
                        <div style={styles.className}>
                          Class {entry.classId.name} - Section {entry.classId.section}
                        </div>
                      )}
                    </div>
                    {entry.startTime && entry.endTime && (
                      <div style={styles.timeInfo}>
                        ⏰ {entry.startTime} - {entry.endTime}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;