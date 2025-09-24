import React, { useEffect, useState } from 'react';
import { Save, UserPlus, Users, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Modal from '../Modal/Modal';
import './AccountCreation.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AccountCreation = ({ onDataChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: ''
  });

  const [createdAccounts, setCreatedAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ 
    type: 'info', 
    title: '', 
    message: '', 
    confirmText: 'OK',
    showCancel: false,
    onConfirm: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [recentCredentials, setRecentCredentials] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt');

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const loadCreatedAccounts = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API_BASE}/salesmen`, { headers: authHeaders });
      const list = res.data?.salesmen || [];
      setCreatedAccounts(list);
    } catch (err) {
      console.error('Failed to load salesmen', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCreatedAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email
      };

      const res = await axios.post(`${API_BASE}/salesmen`, payload, { headers: { ...authHeaders, 'Content-Type': 'application/json' } });
      const { user, credentials } = res.data || {};

      const created = { ...user };

      // Update list - put latest on top
      setCreatedAccounts(prev => [created, ...prev]);

      // Store credentials for display
      setRecentCredentials(credentials);

      // Update parent component metrics
      if (onDataChange) {
        onDataChange();
      }

      // Reset form
      setFormData({ name: '', contactNumber: '', email: '' });

      // Show success without modal - credentials will be displayed inline
    } catch (err) {
      console.error('Create salesman failed', err);
      const apiMsg = err?.response?.data?.error || 'Failed to create account. Please try again.';
      setModalData({
        type: 'error',
        title: 'Creation Failed',
        message: apiMsg,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.contactNumber && formData.email;

  return (
    <div className="account-creation">
      {/* Header */}
      <div className="creation-header">
        <div className="header-icon">
          <UserPlus size={24} />
        </div>
        <div className="header-content">
          <h2>Create Salesman Account</h2>
          <p>Add a new team member with auto-generated credentials</p>
        </div>
      </div>

      <div className="creation-layout">
        {/* Form Section */}
        <div className="form-container">
          <form onSubmit={handleSubmit} className="creation-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`submit-btn ${!isFormValid ? 'disabled' : ''}`}
            >
              <Save size={18} />
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
            
            
            {!isFormValid && (
              <div className="form-helper">
                <span>Please fill in all required fields to create an account</span>
              </div>
            )}
          </form>

          {/* Recent Credentials Display */}
          {recentCredentials && (
            <div className="credentials-display">
              <div className="credentials-header">
                <h4>Generated Credentials</h4>
                <span className="success-badge">Account Created Successfully</span>
              </div>
              <div className="credentials-grid">
                <div className="credential-item">
                  <label>Username</label>
                  <div className="credential-value">
                    <code>{recentCredentials.username}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(recentCredentials.username, 'username')}
                      className="copy-btn"
                    >
                      {copiedField === 'username' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="credential-item">
                  <label>Password</label>
                  <div className="credential-value">
                    <code>{showPassword ? recentCredentials.password : '••••••••'}</code>
                    <div className="credential-actions">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="toggle-btn"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(recentCredentials.password, 'password')}
                        className="copy-btn"
                      >
                        {copiedField === 'password' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Accounts Section */}
        <div className="accounts-container">
          <div className="accounts-header">
            <div className="accounts-title">
              <Users size={20} />
              <h3>Recent Accounts</h3>
            </div>
            <span className="account-count">{createdAccounts.length}</span>
          </div>

          <div className="accounts-list">
            {loadingList ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Loading accounts...</span>
              </div>
            ) : createdAccounts.length === 0 ? (
              <div className="empty-state">
                <Users size={32} />
                <p>No accounts created yet</p>
                <span>Create your first salesman account above</span>
              </div>
            ) : (
              createdAccounts.slice(0, 5).map((account) => (
                <div key={account.id} className="account-card">
                  <div className="account-avatar">
                    {account.first_name?.charAt(0) || 'U'}
                  </div>
                  <div className="account-info">
                    <div className="account-name">
                      {[account.first_name, account.last_name].filter(Boolean).join(' ')}
                    </div>
                    <div className="account-details">
                      <span className="account-username">{account.username}</span>
                      <span className="account-email">{account.email}</span>
                    </div>
                  </div>
                  <div className="account-status">
                    <span className={`status-badge ${account.is_active ? 'active' : 'inactive'}`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        showCancel={modalData.showCancel}
        onConfirm={modalData.onConfirm}
        size="medium"
      />
    </div>
  );
};

export default AccountCreation;
