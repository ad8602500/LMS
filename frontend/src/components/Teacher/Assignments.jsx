// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Box, Button, TextField, MenuItem, Select, InputLabel, FormControl,
//   Typography, Paper, List, ListItem, ListItemText, Divider,
//   Table, TableBody, TableCell, TableHead, TableRow, IconButton
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';

// const Assignments = () => {
//   const [assignments, setAssignments] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subject, setSubject] = useState('');
//   const [topic, setTopic] = useState('');
//   const [dueDate, setDueDate] = useState('');
//   const [classId, setClassId] = useState('');
//   const [file, setFile] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [submissions, setSubmissions] = useState([]);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     fetchClasses();
//     fetchAssignments();
//   }, []);

//   const fetchClasses = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/admin/classes', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setClasses(response.data);
//     } catch (error) {
//       console.error('Error fetching classes:', error);
//     }
//   };

//   const fetchAssignments = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/assignment/class/admin/classes', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setAssignments(response.data);
//     } catch (error) {
//       console.error('Error fetching assignments:', error);
//     }
//   };

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('subject', subject);
//     formData.append('topic', topic);
//     formData.append('dueDate', dueDate);
//     formData.append('classId', classId);
//     formData.append('file', file);

//     try {
//       if (editId) {
//         await axios.put(`http://localhost:5000/api/assignment/${editId}`, formData, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
//         });
//         setEditId(null);
//       } else {
//         await axios.post('http://localhost:5000/api/assignment', formData, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
//         });
//       }
//       setSubject('');
//       setTopic('');
//       setDueDate('');
//       setClassId('');
//       setFile(null);
//       fetchAssignments();
//     } catch (error) {
//       console.error('Error saving assignment:', error);
//     }
//   };

//   const handleEdit = (assignment) => {
//     setEditId(assignment._id);
//     setSubject(assignment.subject);
//     setTopic(assignment.topic);
//     setDueDate(assignment.dueDate ? assignment.dueDate.split('T')[0] : '');
//     setClassId(assignment.classId._id);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/assignment/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       fetchAssignments();
//     } catch (error) {
//       console.error('Error deleting assignment:', error);
//     }
//   };

//   const handleViewSubmissions = async (assignmentId) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/api/assignment/submission/${assignmentId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSubmissions(response.data);
//       setSelectedAssignment(assignmentId);
//     } catch (error) {
//       console.error('Error fetching submissions:', error);
//     }
//   };

//   const handleGradeSubmission = async (submissionId, marks, remarks) => {
//     try {
//       await axios.put(`http://localhost:5000/api/assignment/submission/${submissionId}`, { marks, remarks }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       handleViewSubmissions(selectedAssignment);
//     } catch (error) {
//       console.error('Error grading submission:', error);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         {editId ? 'Edit Assignment' : 'Create Assignment'}
//       </Typography>
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <form onSubmit={handleSubmit}>
//           <TextField
//             label="Subject"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             fullWidth
//             margin="normal"
//             required
//           />
//           <TextField
//             label="Topic"
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//             fullWidth
//             margin="normal"
//             required
//           />
//           <TextField
//             label="Due Date"
//             type="date"
//             value={dueDate}
//             onChange={(e) => setDueDate(e.target.value)}
//             fullWidth
//             margin="normal"
//             InputLabelProps={{ shrink: true }}
//           />
//           <FormControl fullWidth margin="normal">
//             <InputLabel>Class</InputLabel>
//             <Select
//               value={classId}
//               onChange={(e) => setClassId(e.target.value)}
//               required
//             >
//               {classes.map(cls => (
//                 <MenuItem key={cls._id} value={cls._id}>
//                   {cls.name} {cls.section}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <Button
//             variant="contained"
//             component="label"
//             sx={{ mt: 2 }}
//           >
//             Upload File
//             <input
//               type="file"
//               hidden
//               onChange={handleFileChange}
//               accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//             />
//           </Button>
//           {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             sx={{ mt: 2, ml: 2 }}
//           >
//             {editId ? 'Update' : 'Create'}
//           </Button>
//         </form>
//       </Paper>

//       <Typography variant="h5" gutterBottom>
//         Assignments
//       </Typography>
//       <List>
//         {assignments.map(assignment => (
//           <div key={assignment._id}>
//             <ListItem>
//               <ListItemText
//                 primary={`${assignment.subject}: ${assignment.topic}`}
//                 secondary={`Class: ${assignment.classId.name} ${assignment.classId.section} | Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}`}
//               />
//               <Button onClick={() => handleViewSubmissions(assignment._id)}>
//                 View Submissions
//               </Button>
//               <IconButton onClick={() => handleEdit(assignment)}>
//                 <EditIcon />
//               </IconButton>
//               <IconButton onClick={() => handleDelete(assignment._id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </ListItem>
//             <Divider />
//           </div>
//         ))}
//       </List>

//       {selectedAssignment && (
//         <Box sx={{ mt: 3 }}>
//           <Typography variant="h5" gutterBottom>
//             Submissions
//           </Typography>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Student</TableCell>
//                 <TableCell>Roll No</TableCell>
//                 <TableCell>File</TableCell>
//                 <TableCell>Submission Date</TableCell>
//                 <TableCell>Marks</TableCell>
//                 <TableCell>Remarks</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {submissions.map(submission => (
//                 <TableRow key={submission._id}>
//                   <TableCell>{submission.studentId.firstName} {submission.studentId.lastName}</TableCell>
//                   <TableCell>{submission.studentId.rollNo}</TableCell>
//                   <TableCell>
//                     <a href={`http://localhost:5000${submission.filePath}`} target="_blank" rel="noopener noreferrer">
//                       Download
//                     </a>
//                   </TableCell>
//                   <TableCell>{new Date(submission.submissionDate).toLocaleDateString()}</TableCell>
//                   <TableCell>
//                     <TextField
//                       type="number"
//                       defaultValue={submission.marks || ''}
//                       onBlur={(e) => handleGradeSubmission(submission._id, e.target.value, submission.remarks)}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <TextField
//                       defaultValue={submission.remarks || ''}
//                       onBlur={(e) => handleGradeSubmission(submission._id, submission.marks, e.target.value)}
//                       size="small"
//                       fullWidth
//                     />
//                   </TableCell>
//                   <TableCell />
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default Assignments;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, MenuItem, Select, InputLabel, FormControl,
  Typography, Paper, List, ListItem, ListItemText, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [classId, setClassId] = useState('');
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched classes:', response.data); // Debug log
      setClasses(response.data);
      if (response.data.length > 0) {
        setClassId(response.data[0]._id); // Set default class
        fetchAssignments(response.data[0]._id); // Fetch assignments for the first class
      }
    } catch (error) {
      console.error('Error fetching classes:', error.response?.data || error.message);
      setError('Failed to fetch classes');
    }
  };

  const fetchAssignments = async (classId) => {
    if (!classId) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched assignments:', response.data); // Debug log
      setAssignments(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching assignments:', error.response?.data || error.message);
      setError('Failed to fetch assignments');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editId) {
      setError('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('topic', topic);
    formData.append('dueDate', dueDate);
    formData.append('classId', classId);
    if (file) formData.append('file', file);

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/assignment/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/assignment', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      setSubject('');
      setTopic('');
      setDueDate('');
      setClassId('');
      setFile(null);
      setError(null);
      fetchAssignments(classId); // Refresh assignments
    } catch (error) {
      console.error('Error saving assignment:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleEdit = (assignment) => {
    setEditId(assignment._id);
    setSubject(assignment.subject);
    setTopic(assignment.topic);
    setDueDate(assignment.dueDate ? assignment.dueDate.split('T')[0] : '');
    setClassId(assignment.classId._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/assignment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssignments(classId); // Refresh assignments
      setError(null);
    } catch (error) {
      console.error('Error deleting assignment:', error.response?.data || error.message);
      setError('Failed to delete assignment');
    }
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/submission/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched submissions:', response.data); // Debug log
      setSubmissions(response.data);
      setSelectedAssignment(assignmentId);
      setError(null);
    } catch (error) {
      console.error('Error fetching submissions:', error.response?.data || error.message);
      setError('Failed to fetch submissions');
    }
  };

  const handleGradeSubmission = async (submissionId, marks, remarks) => {
    try {
      await axios.put(`http://localhost:5000/api/assignment/submission/${submissionId}`, { marks, remarks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      handleViewSubmissions(selectedAssignment); // Refresh submissions
      setError(null);
    } catch (error) {
      console.error('Error grading submission:', error.response?.data || error.message);
      setError('Failed to grade submission');
    }
  };

  const handleClassChange = (e) => {
    const selectedClassId = e.target.value;
    setClassId(selectedClassId);
    fetchAssignments(selectedClassId); // Fetch assignments for selected class
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {editId ? 'Edit Assignment' : 'Create Assignment'}
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Class</InputLabel>
            <Select
              value={classId}
              onChange={handleClassChange}
              required
            >
              <MenuItem value="">Select Class</MenuItem>
              {classes.map(cls => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name} {cls.section}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </Button>
          {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, ml: 2 }}
          >
            {editId ? 'Update' : 'Create'}
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Assignments
      </Typography>
      {assignments.length === 0 && <Typography>No assignments found for selected class</Typography>}
      <List>
        {assignments.map(assignment => (
          <div key={assignment._id}>
            <ListItem>
              <ListItemText
                primary={`${assignment.subject}: ${assignment.topic}`}
                secondary={`Class: ${assignment.classId.name} ${assignment.classId.section} | Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}`}
              />
              <Button onClick={() => handleViewSubmissions(assignment._id)}>
                View Submissions
              </Button>
              <IconButton onClick={() => handleEdit(assignment)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(assignment._id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>

      {selectedAssignment && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Submissions
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Roll No</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission._id}>
                  <TableCell>{submission.studentId.firstName} {submission.studentId.lastName}</TableCell>
                  <TableCell>{submission.studentId.rollNo}</TableCell>
                  <TableCell>
                    <a href={`http://localhost:5000${submission.filePath}`} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </TableCell>
                  <TableCell>{new Date(submission.submissionDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      defaultValue={submission.marks || ''}
                      onBlur={(e) => handleGradeSubmission(submission._id, e.target.value, submission.remarks)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      defaultValue={submission.remarks || ''}
                      onBlur={(e) => handleGradeSubmission(submission._id, submission.marks, e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Assignments;