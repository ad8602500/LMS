import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    status: 'present',
    remarks: ''
  });
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
      const response = await axios.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching classes', { variant: 'error' });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/classes/${selectedClass}/students`);
      setStudents(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching students', { variant: 'error' });
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance/class/${selectedClass}?date=${selectedDate}`);
      setAttendance(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching attendance', { variant: 'error' });
    }
  };

  const handleOpenDialog = (student) => {
    setSelectedStudent(student);
    const existingRecord = attendance.find(a => a.studentId._id === student._id);
    setFormData({
      status: existingRecord?.status || 'present',
      remarks: existingRecord?.remarks || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({
      status: 'present',
      remarks: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        classId: selectedClass,
        date: selectedDate,
        attendanceData: [{
          studentId: selectedStudent._id,
          status: formData.status,
          remarks: formData.remarks
        }]
      };

      await axios.post('/api/attendance/mark', data);
      enqueueSnackbar('Attendance marked successfully', { variant: 'success' });
      handleCloseDialog();
      fetchAttendance();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error marking attendance', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success.main';
      case 'absent':
        return 'error.main';
      case 'late':
        return 'warning.main';
      default:
        return 'text.primary';
    }
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
                Select Class
              </Typography>
              <Select
                fullWidth
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                sx={{ mb: 2 }}
              >
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  const attendanceRecord = attendance.find(
                    (a) => a.studentId._id === student._id
                  );
                  return (
                    <TableRow key={student._id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={getStatusColor(attendanceRecord?.status)}
                        >
                          {attendanceRecord?.status || 'Not Marked'}
                        </Typography>
                      </TableCell>
                      <TableCell>{attendanceRecord?.remarks || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(student)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Mark Attendance - {selectedStudent?.firstName} {selectedStudent?.lastName}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Attendance; 