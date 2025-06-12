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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Fees = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    dueDate: '',
    remarks: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchFees();
      fetchSummary();
    }
  }, [selectedClass]);

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

  const fetchFees = async () => {
    try {
      const response = await axios.get(`/api/fees/class/${selectedClass}`);
      setFees(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching fees', { variant: 'error' });
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`/api/fees/summary/class/${selectedClass}`);
      setSummary(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching fee summary', { variant: 'error' });
    }
  };

  const handleOpenDialog = (fee = null) => {
    if (fee) {
      setSelectedFee(fee);
      setFormData({
        studentId: fee.studentId._id,
        amount: fee.amount,
        dueDate: fee.dueDate.split('T')[0],
        remarks: fee.remarks || ''
      });
    } else {
      setSelectedFee(null);
      setFormData({
        studentId: '',
        amount: '',
        dueDate: '',
        remarks: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFee(null);
    setFormData({
      studentId: '',
      amount: '',
      dueDate: '',
      remarks: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        classId: selectedClass,
        amount: parseFloat(formData.amount)
      };

      if (selectedFee) {
        await axios.put(`/api/fees/${selectedFee._id}`, data);
        enqueueSnackbar('Fee updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/fees', data);
        enqueueSnackbar('Fee added successfully', { variant: 'success' });
      }

      handleCloseDialog();
      fetchFees();
      fetchSummary();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error saving fee', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await axios.delete(`/api/fees/${id}`);
        enqueueSnackbar('Fee deleted successfully', { variant: 'success' });
        fetchFees();
        fetchSummary();
      } catch (error) {
        enqueueSnackbar('Error deleting fee', { variant: 'error' });
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Fee Management
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
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section}
                  </MenuItem>
                ))}
              </Select>
            </CardContent>
          </Card>
        </Grid>

        {summary && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fee Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Amount</Typography>
                    <Typography variant="h6">₹{summary.totalAmount}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Paid</Typography>
                    <Typography variant="h6">₹{summary.totalPaid}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Pending</Typography>
                    <Typography variant="h6">₹{summary.totalPending}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Typography variant="body2">
                      Paid: {summary.statusCounts.paid}<br />
                      Partial: {summary.statusCounts.partial}<br />
                      Pending: {summary.statusCounts.pending}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Fee Records</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={!selectedClass}
            >
              Add Fee
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell>
                      {fee.studentId.firstName} {fee.studentId.lastName}
                    </TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{fee.status}</TableCell>
                    <TableCell>₹{fee.paidAmount || 0}</TableCell>
                    <TableCell>
                      {fee.paymentDate
                        ? new Date(fee.paymentDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(fee)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(fee._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFee ? 'Edit Fee Record' : 'Add New Fee Record'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
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
              {selectedFee ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Fees; 