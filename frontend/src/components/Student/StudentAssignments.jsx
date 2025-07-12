import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, List, ListItem, ListItemText, Divider,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/class/${user.classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/submission/student/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (assignmentId) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`http://localhost:5000/api/assignment/submission/${assignmentId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Assignments
      </Typography>
      <List>
        {assignments.map(assignment => (
          <div key={assignment._id}>
            <ListItem>
              <ListItemText
                primary={`${assignment.subject}: ${assignment.topic}`}
                secondary={`Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}`}
              />
              <Button
                variant="contained"
                href={`http://localhost:5000${assignment.filePath}`}
                download
              >
                Download
              </Button>
              <Button
                variant="contained"
                component="label"
                sx={{ ml: 2 }}
              >
                Upload Submission
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </Button>
              {file && (
                <Button
                  variant="contained"
                  onClick={() => handleSubmit(assignment._id)}
                  sx={{ ml: 2 }}
                >
                  Submit
                </Button>
              )}
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Submissions
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assignment</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>File</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map(submission => (
              <TableRow key={submission._id}>
                <TableCell>{submission.assignmentId.subject}: {submission.assignmentId.topic}</TableCell>
                <TableCell>{new Date(submission.submissionDate).toLocaleDateString()}</TableCell>
                <TableCell>{submission.marks !== null ? submission.marks : 'Not graded'}</TableCell>
                <TableCell>{submission.remarks || 'No remarks'}</TableCell>
                <TableCell>
                  <a href={`http://localhost:5000${submission.filePath}`} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default StudentAssignments;