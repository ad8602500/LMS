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
    padding: '8px', // reduced from 16px
    maxWidth: '1000px', // reduced from 1200px
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: 'unset'
  },
  header: {
    textAlign: 'center',
    marginBottom: '10px' // reduced from 20px
  },
  title: {
    fontSize: '1.5rem', // reduced from 2rem
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '2px' // reduced from 4px
  },
  subtitle: {
    fontSize: '0.95rem', // slightly reduced
    color: '#7f8c8d',
    marginBottom: '6px' // reduced from 12px
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '12px' // reduced from 25px
  },
  daySection: {
    backgroundColor: 'white',
    borderRadius: '10px', // reduced from 15px
    padding: '12px', // reduced from 25px
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)', // lighter shadow
    border: '1px solid #e1e8ed',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  daySectionHover: {
    transform: 'translateY(-1px)', // less movement
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)'
  },
  dayTitle: {
    margin: '0 0 10px 0', // reduced from 20px
    color: '#2c3e50',
    fontSize: '1.1rem', // reduced from 1.5rem
    fontWeight: 'bold',
    borderBottom: '2px solid #3498db', // thinner border
    paddingBottom: '5px', // reduced from 10px
    textAlign: 'center'
  },
  classesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns per row
    gap: '20px', // increased spacing between cards
    paddingBottom: '0',
  },
  classEntry: {
    backgroundColor: '#e3f0fa', // pleasant light blue
    borderRadius: '10px', // slightly more rounded
    padding: '20px', // more padding for content
    border: '1.5px solid #b3c6e0', // subtle border
    boxShadow: '0 2px 8px rgba(44, 62, 80, 0.07)', // subtle shadow
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  classEntryHover: {
    backgroundColor: '#d0e6fa', // slightly darker on hover
    borderColor: '#3498db',
    transform: 'scale(1.03)', // more pronounced scale
    boxShadow: '0 4px 16px rgba(44, 62, 80, 0.12)', // stronger shadow
  },
  periodInfo: {
    color: '#3498db',
    marginBottom: '5px', // reduced from 10px
    fontSize: '1rem', // reduced from 1.1rem
    fontWeight: 'bold'
  },
  classDetails: {
    marginBottom: '5px' // reduced from 10px
  },
  subject: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '1rem', // reduced from 1.1rem
    marginBottom: '2px' // reduced from 5px
  },
  className: {
    color: '#7f8c8d',
    fontSize: '0.95rem', // reduced from 1rem
    fontWeight: '500'
  },
  timeInfo: {
    fontSize: '0.85rem', // reduced from 0.9rem
    color: '#95a5a6',
    fontStyle: 'italic',
    backgroundColor: '#ecf0f1',
    padding: '5px 8px', // reduced from 8px 12px
    borderRadius: '4px', // reduced from 6px
    display: 'inline-block',
    marginTop: '4px' // reduced from 8px
  },
  noClasses: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '15px', // reduced from 30px
    fontSize: '1rem', // reduced from 1.1rem
    backgroundColor: '#f8f9fa',
    borderRadius: '6px', // reduced from 10px
    border: '1px dashed #bdc3c7' // thinner border
  },
  loading: {
    textAlign: 'center',
    padding: '30px 10px', // reduced from 60px 20px
    color: '#3498db',
    fontSize: '1rem', // reduced from 1.2rem
    fontWeight: '500'
  },
  error: {
    textAlign: 'center',
    padding: '15px', // reduced from 30px
    color: '#e74c3c',
    backgroundColor: '#fdf2f2',
    border: '1px solid #fecaca', // thinner border
    borderRadius: '6px', // reduced from 10px
    margin: '10px 0', // reduced from 20px 0
    fontSize: '1rem' // reduced from 1.1rem
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', // smaller min width
    gap: '10px', // reduced from 20px
    marginBottom: '20px' // reduced from 40px
  },
  statCard: {
    backgroundColor: 'white',
    padding: '10px', // reduced from 20px
    borderRadius: '8px', // reduced from 12px
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)', // lighter shadow
    textAlign: 'center',
    border: '1px solid #e1e8ed'
  },
  statNumber: {
    fontSize: '1.3rem', // reduced from 2rem
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: '2px' // reduced from 5px
  },
  statLabel: {
    fontSize: '0.8rem', // reduced from 0.9rem
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
  const [selectedDay, setSelectedDay] = useState('Monday');

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

      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <label style={{ fontWeight: 600, marginRight: 10 }}>Select Day:</label>
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          style={{ padding: '10px 15px', fontSize: '1rem', borderRadius: 8 }}
        >
          {daysOfWeek.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
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
        <div style={styles.daySection}>
          <h3 style={styles.dayTitle}>{selectedDay}</h3>
          <div style={styles.classesList}>
            {(timetable[selectedDay] || []).length === 0 ? (
              <div style={styles.noClasses}>
                <p>No classes scheduled for {selectedDay}</p>
              </div>
            ) : (
              timetable[selectedDay].map(entry => (
                <div key={entry._id} style={styles.classEntry}>
                  <div style={styles.periodInfo}>Period {entry.period}</div>
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
      </div>
    </div>
  );
};

export default Schedule;