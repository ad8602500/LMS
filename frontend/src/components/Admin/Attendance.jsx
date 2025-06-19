import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { useSnackbar } from 'notistack';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setClasses(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching classes', { variant: 'error' });
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/classes/${selectedClass}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStudents(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching students', { variant: 'error' });
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/attendance/class/${selectedClass}?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAttendance(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching attendance', { variant: 'error' });
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = {
        classId: selectedClass,
        date: selectedDate,
        attendanceData: [{
          studentId: studentId,
          status: status,
          remarks: ''
        }]
      };

      await axios.post('/api/attendance/mark', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      enqueueSnackbar('Attendance marked successfully', { variant: 'success' });
      fetchAttendance(); // Refresh attendance data
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error marking attendance', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.studentId._id === studentId);
    return record?.status || null;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Class & Section
              </Typography>
              <Select
                fullWidth
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                sx={{ mb: 2 }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Choose a class
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section}
                  </MenuItem>
                ))}
              </Select>

              <Typography variant="h6" gutterBottom>
                Select Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {selectedClass && students.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Current Status</TableCell>
                    <TableCell>Mark Attendance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const currentStatus = getAttendanceStatus(student._id);
                    return (
                      <TableRow key={student._id}>
                        <TableCell>
                          {student.rollNo || student.admissionNo || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>
                          {currentStatus ? (
                            <Chip
                              label={currentStatus.toUpperCase()}
                              color={getStatusColor(currentStatus)}
                              variant="outlined"
                            />
                          ) : (
                            <Chip label="NOT MARKED" color="default" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant={currentStatus === 'present' ? 'contained' : 'outlined'}
                              color="success"
                              size="small"
                              onClick={() => handleMarkAttendance(student._id, 'present')}
                              disabled={loading}
                            >
                              Present
                            </Button>
                            <Button
                              variant={currentStatus === 'absent' ? 'contained' : 'outlined'}
                              color="error"
                              size="small"
                              onClick={() => handleMarkAttendance(student._id, 'absent')}
                              disabled={loading}
                            >
                              Absent
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : selectedClass ? (
            <Card>
              <CardContent>
                <Typography variant="h6" textAlign="center" color="text.secondary">
                  No students found in this class
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" textAlign="center" color="text.secondary">
                  Please select a class to view students
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Attendance; 