import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, UserCheck, UserX } from 'lucide-react';
import axios from 'axios';
import './SalesmanEditForm.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SalesmanEditForm = ({ 
  salesman, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Get auth token
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (salesman) {
      setFormData({
        first_name: salesman.first_name || '',
        last_name: salesman.last_name || '',
        email: salesman.email || '',
        contact_number: salesman.contact_number || '',
        is_active: salesman.is_active !== undefined ? salesman.is_active : true
      });
    }
  }, [salesman]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.contact_number.replace(/\s/g, ''))) {
      newErrors.contact_number = 'Contact number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE}/salesmen/${salesman.id}`, formData, {
        headers: authHeaders
      });

      if (response.status === 200) {
        onSave(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update salesman:', error);
      
      if (error.response?.status === 400) {
        // Handle validation errors from backend
        const errorMessage = error.response.data?.error || 'Validation failed';
        setErrors({ general: errorMessage });
      } else if (error.response?.status === 409) {
        // Handle conflict errors (e.g., email already exists)
        const errorMessage = error.response.data?.error || 'Email already exists';
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: 'Failed to update salesman. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="salesman-edit-overlay" onClick={handleClose}>
      <div className="salesman-edit-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <div className="header-content">
            <div className="form-icon">
              <User size={24} />
            </div>
            <div>
              <h2>Edit Salesman</h2>
              <p>Update salesman information</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-sections">
            <div className="form-section">
              <div className="form-section-title">
                <User size={16} />
                <span>Personal Information</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <User size={14} />
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={errors.first_name ? 'error' : ''}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <span className="error-message">{errors.first_name}</span>}
                </div>
                
                <div className="form-group">
                  <label>
                    <User size={14} />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={errors.last_name ? 'error' : ''}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <span className="error-message">{errors.last_name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Mail size={14} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter email address"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>
                    <Phone size={14} />
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className={errors.contact_number ? 'error' : ''}
                    placeholder="Enter contact number"
                  />
                  {errors.contact_number && <span className="error-message">{errors.contact_number}</span>}
                </div>
              </div>

            </div>

            <div className="form-section">
              <div className="form-section-title">
                <UserCheck size={16} />
                <span>Account Status</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-custom">
                      {formData.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                    </span>
                    <span className="checkbox-text">
                      {formData.is_active ? 'Active Account' : 'Inactive Account'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Salesman
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesmanEditForm;
