import React, { useState } from 'react';
import './Dashboard.css';

const initialState = {
  name: '',
  schoolId: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  adminEmail: '',
  adminPassword: '',
  adminFirstName: '',
  adminLastName: '',
};

const SchoolForm = ({ open, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  if (!open) return null;

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'School name is required';
    if (!form.schoolId) errs.schoolId = 'School ID is required';
    if (!form.address) errs.address = 'Address is required';
    if (!form.contactEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail)) errs.contactEmail = 'Valid email required';
    if (!form.contactPhone) errs.contactPhone = 'Phone is required';
    if (!form.adminEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.adminEmail)) errs.adminEmail = 'Valid admin email required';
    if (!form.adminPassword || form.adminPassword.length < 6) errs.adminPassword = 'Password must be at least 6 characters';
    if (!form.adminFirstName) errs.adminFirstName = 'First name required';
    if (!form.adminLastName) errs.adminLastName = 'Last name required';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await onSubmit(form);
      setForm(initialState);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create school');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} title="Close">&times;</button>
        <h2 style={{marginBottom: '1rem'}}>Create New School</h2>
        <form onSubmit={handleSubmit} className="school-form">
          <div className="form-section">
            <h4>School Info</h4>
            <div className="form-group">
              <label>School Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>School ID</label>
              <input name="schoolId" value={form.schoolId} onChange={handleChange} />
              {errors.schoolId && <span className="form-error">{errors.schoolId}</span>}
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange} />
              {errors.contactEmail && <span className="form-error">{errors.contactEmail}</span>}
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} />
              {errors.contactPhone && <span className="form-error">{errors.contactPhone}</span>}
            </div>
          </div>
          <div className="form-section">
            <h4>Admin User Info</h4>
            <div className="form-group">
              <label>Admin Email</label>
              <input name="adminEmail" value={form.adminEmail} onChange={handleChange} />
              {errors.adminEmail && <span className="form-error">{errors.adminEmail}</span>}
            </div>
            <div className="form-group">
              <label>Admin Password</label>
              <input name="adminPassword" type="password" value={form.adminPassword} onChange={handleChange} />
              {errors.adminPassword && <span className="form-error">{errors.adminPassword}</span>}
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input name="adminFirstName" value={form.adminFirstName} onChange={handleChange} />
              {errors.adminFirstName && <span className="form-error">{errors.adminFirstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="adminLastName" value={form.adminLastName} onChange={handleChange} />
              {errors.adminLastName && <span className="form-error">{errors.adminLastName}</span>}
            </div>
          </div>
          {submitError && <div className="form-error" style={{marginBottom: '1rem'}}>{submitError}</div>}
          <div className="form-actions">
            <button type="button" className="edit-button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="add-school-button" disabled={loading}>{loading ? 'Creating...' : 'Create School'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolForm; 