import React, { useState } from 'react';
import './AddUserForm.css';

const AddUserForm = ({ isOpen, onClose, onSubmit, userType }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    qualification: '',
    joiningDate: '',
    class: '',
    section: '',
    rollNo: '',
    admissionNo: '',
    parentName: '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common validations
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Teacher-specific validations
    if (userType === 'teacher') {
      if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
      if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
      if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    }

    // Student-specific validations
    if (userType === 'student') {
      if (!formData.class.trim()) newErrors.class = 'Class is required';
      if (!formData.section.trim()) newErrors.section = 'Section is required';
      if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
      if (!formData.admissionNo.trim()) newErrors.admissionNo = 'Admission number is required';
      if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await onSubmit(formDataToSend);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      qualification: '',
      joiningDate: '',
      class: '',
      section: '',
      rollNo: '',
      admissionNo: '',
      parentName: '',
      image: null
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New {userType === 'teacher' ? 'Teacher' : 'Student'}</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {userType === 'teacher' && (
            <>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'error' : ''}
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="qualification">Qualification</label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={errors.qualification ? 'error' : ''}
                />
                {errors.qualification && <span className="error-message">{errors.qualification}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="joiningDate">Joining Date</label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className={errors.joiningDate ? 'error' : ''}
                />
                {errors.joiningDate && <span className="error-message">{errors.joiningDate}</span>}
              </div>
            </>
          )}

          {userType === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="class">Class</label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className={errors.class ? 'error' : ''}
                />
                {errors.class && <span className="error-message">{errors.class}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="section">Section</label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className={errors.section ? 'error' : ''}
                />
                {errors.section && <span className="error-message">{errors.section}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="rollNo">Roll No.</label>
                <input
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className={errors.rollNo ? 'error' : ''}
                />
                {errors.rollNo && <span className="error-message">{errors.rollNo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="admissionNo">Admission No.</label>
                <input
                  type="text"
                  id="admissionNo"
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleChange}
                  className={errors.admissionNo ? 'error' : ''}
                />
                {errors.admissionNo && <span className="error-message">{errors.admissionNo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="parentName">Parent Name</label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className={errors.parentName ? 'error' : ''}
                />
                {errors.parentName && <span className="error-message">{errors.parentName}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="image">Profile Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Adding...' : `Add ${userType === 'teacher' ? 'Teacher' : 'Student'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm; 