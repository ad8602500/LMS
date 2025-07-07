import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Students = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classLoading, setClassLoading] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/classes/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForClass = async (classId) => {
    try {
      setClassLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students for this class');
    } finally {
      setClassLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      textAlign: 'center'
    },
    title: {
      color: '#2c3e50',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '1.1rem'
    },
    classSelector: {
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap'
    },
    label: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#34495e'
    },
    select: {
      padding: '10px 15px',
      fontSize: '1rem',
      border: '2px solid #3498db',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#2c3e50',
      minWidth: '200px',
      cursor: 'pointer'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e1e8ed',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#3498db',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '1rem',
      color: '#7f8c8d',
      fontWeight: '500'
    },
    studentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    },
    studentCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e1e8ed',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    studentCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
    },
    studentHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
      gap: '15px'
    },
    studentAvatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#3498db',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: 'bold'
    },
    studentInfo: {
      flex: '1'
    },
    studentName: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '5px'
    },
    studentId: {
      fontSize: '0.9rem',
      color: '#7f8c8d'
    },
    studentDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '15px'
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column'
    },
    detailLabel: {
      fontSize: '0.8rem',
      color: '#95a5a6',
      fontWeight: '500',
      marginBottom: '2px'
    },
    detailValue: {
      fontSize: '0.9rem',
      color: '#2c3e50',
      fontWeight: '500'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '1.1rem',
      color: '#3498db'
    },
    error: {
      textAlign: 'center',
      padding: '20px',
      color: '#e74c3c',
      backgroundColor: '#fdf2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      margin: '20px 0'
    },
    noData: {
      textAlign: 'center',
      padding: '40px',
      color: '#7f8c8d',
      fontSize: '1.1rem'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '500'
    },
    statusActive: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusInactive: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading your classes...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Students</h1>
        <p style={styles.subtitle}>View and manage students in your assigned classes</p>
      </div>

      {classes.length === 0 ? (
        <div style={styles.noData}>
          <h3>No Classes Assigned</h3>
          <p>You don't have any classes assigned to you yet.</p>
        </div>
      ) : (
        <>
          <div style={styles.classSelector}>
            <label style={styles.label}>Select Class:</label>
            <select
              style={styles.select}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <>
              <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{students.length}</div>
                  <div style={styles.statLabel}>Total Students</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>
                    {students.filter(s => s.isActive).length}
                  </div>
                  <div style={styles.statLabel}>Active Students</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>
                    {students.filter(s => !s.isActive).length}
                  </div>
                  <div style={styles.statLabel}>Inactive Students</div>
                </div>
              </div>

              {classLoading ? (
                <div style={styles.loading}>Loading students...</div>
              ) : students.length === 0 ? (
                <div style={styles.noData}>
                  <h3>No Students Found</h3>
                  <p>There are no students enrolled in this class.</p>
                </div>
              ) : (
                <div style={styles.studentsGrid}>
                  {students.map((student) => (
                    <div key={student._id} style={styles.studentCard}>
                      <div style={styles.studentHeader}>
                        <div style={styles.studentAvatar}>
                          {student.firstName?.charAt(0)?.toUpperCase()}
                          {student.lastName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={styles.studentInfo}>
                          <div style={styles.studentName}>
                            {student.firstName} {student.lastName}
                          </div>
                          <div style={styles.studentId}>ID: {student.userId}</div>
                        </div>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(student.isActive ? styles.statusActive : styles.statusInactive)
                          }}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={styles.studentDetails}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Roll No</span>
                          <span style={styles.detailValue}>{student.rollNo || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Admission No</span>
                          <span style={styles.detailValue}>{student.admissionNo || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Email</span>
                          <span style={styles.detailValue}>{student.email}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Parent Name</span>
                          <span style={styles.detailValue}>{student.parentName || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Parent Phone</span>
                          <span style={styles.detailValue}>{student.parentPhone || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Section</span>
                          <span style={styles.detailValue}>{student.section || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Students; 