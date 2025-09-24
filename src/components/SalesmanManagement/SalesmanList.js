import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Key, Trash2 } from 'lucide-react';
import Modal from '../Modal/Modal';
import axios from 'axios';
import './SalesmanList.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SalesmanList = ({ onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [modalData, setModalData] = useState({ 
    type: 'info', 
    title: '', 
    message: '', 
    confirmText: 'OK',
    showCancel: false,
    onConfirm: null
  });
  const [salesmanData, setSalesmanData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get auth token
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch salesman data from API
  const fetchSalesmen = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/salesmen`, { headers: authHeaders });
      const salesmen = response.data?.salesmen || [];
      setSalesmanData(salesmen);
    } catch (error) {
      console.error('Failed to fetch salesmen:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to load salesman data. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesmen();
  }, []);

  const filteredSalesman = salesmanData.filter(salesman => {
    const fullName = `${salesman.first_name} ${salesman.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         salesman.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salesman.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status if statusFilter is set
    if (statusFilter === 'active') {
      return matchesSearch && salesman.is_active;
    } else if (statusFilter === 'inactive') {
      return matchesSearch && !salesman.is_active;
    }
    
    // Show all if no status filter or 'all' is selected
    return matchesSearch;
  });

  const handleStatusToggle = async (salesmanId) => {
    try {
      const salesman = salesmanData.find(s => s.id === salesmanId);
      const newStatus = !salesman.is_active;
      
      const response = await axios.patch(`${API_BASE}/salesmen/${salesmanId}`, 
        { is_active: newStatus }, 
        { headers: authHeaders }
      );
      
      if (response.status === 200) {
        // Update local state with new status
        setSalesmanData(prev => prev.map(s => 
          s.id === salesmanId ? { ...s, is_active: newStatus } : s
        ));
        
        // Update parent component metrics
        if (onDataChange) {
          onDataChange();
        }
        
        setModalData({
          type: 'success',
          title: 'Status Updated',
          message: `Salesman ${salesman.username} has been ${newStatus ? 'activated' : 'deactivated'} successfully.`,
          confirmText: 'OK',
          showCancel: false,
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Failed to update salesman status:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to update salesman status. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
    }
    setShowModal(true);
  };

  const handleResetPassword = (salesmanId) => {
    const salesman = salesmanData.find(s => s.id === salesmanId);
    setModalData({
      type: 'confirm',
      title: 'Reset Password',
      message: `Are you sure you want to reset the password for ${salesman?.first_name} ${salesman?.last_name}? A new password will be generated and displayed.`,
      confirmText: 'Reset Password',
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await axios.post(`${API_BASE}/salesmen/${salesmanId}/reset-password`, 
            {}, 
            { headers: authHeaders }
          );
          
          if (response.status === 200) {
            const { new_password, salesman: salesmanInfo } = response.data;
            
            setModalData({
              type: 'success',
              title: 'Password Reset Successfully',
              message: `New password for ${salesmanInfo.name} (${salesmanInfo.username}): ${new_password}`,
              confirmText: 'OK',
              showCancel: false,
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Failed to reset password:', error);
          setModalData({
            type: 'error',
            title: 'Error',
            message: 'Failed to reset password. Please try again.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        }
        setShowModal(true);
      }
    });
    setShowModal(true);
  };

  const handleDelete = (salesmanId) => {
    const salesman = salesmanData.find(s => s.id === salesmanId);
    setModalData({
      type: 'confirm',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete salesman ${salesman?.username}? This action cannot be undone.`,
      confirmText: 'Delete',
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await axios.delete(`${API_BASE}/salesmen/${salesmanId}`, 
            { headers: authHeaders }
          );
          
          if (response.status === 200) {
            // Remove from local state
            setSalesmanData(prev => prev.filter(s => s.id !== salesmanId));
            
            // Update parent component metrics
            if (onDataChange) {
              onDataChange();
            }
            
            setModalData({
              type: 'success',
              title: 'Deleted Successfully',
              message: `Salesman ${salesman.username} has been deleted successfully.`,
              confirmText: 'OK',
              showCancel: false,
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Failed to delete salesman:', error);
          setModalData({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete salesman. Please try again.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        }
        setShowModal(true);
      }
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="salesman-list">
      <div className="list-header">
        <div className="header-content">
          <Users size={24} />
          <h2>Salesman List</h2>
          <button 
            className="search-toggle-btn"
            onClick={() => setShowSearch(!showSearch)}
            title={showSearch ? "Hide Search & Filter" : "Show Search & Filter"}
          >
            <Search size={18} />
          </button>
        </div>
        <p className="header-subtitle">View and manage your sales team members.</p>
      </div>

      {showSearch && (
        <div className="list-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Salesmen</option>
              <option value="active">Active Salesmen</option>
              <option value="inactive">Inactive Salesmen</option>
            </select>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="salesman-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading salesmen...
                </td>
              </tr>
            ) : (
              filteredSalesman.map((salesman) => (
                <tr key={salesman.id} className={!salesman.is_active ? 'inactive' : ''}>
                  <td className="id-cell">
                    <span className="salesman-id">{salesman.username}</span>
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(salesman.is_active)}
                  </td>
                  <td className="name-cell">
                    <span className="salesman-name">{salesman.first_name} {salesman.last_name}</span>
                  </td>
                  <td className="contact-cell">
                    <div className="contact-info">
                      <div className="contact-item">
                        <span>{salesman.contact_number || 'N/A'}</span>
                      </div>
                      <div className="contact-item">
                        <span>{salesman.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className={`action-btn ${salesman.is_active ? "deactivate" : "activate"}`}
                        onClick={() => handleStatusToggle(salesman.id)}
                        title={salesman.is_active ? "Deactivate" : "Activate"}
                      >
                        {salesman.is_active ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </button>
                      <button
                        className="action-btn reset-password"
                        onClick={() => handleResetPassword(salesman.id)}
                        title="Reset Password"
                      >
                        <Key size={14} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(salesman.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredSalesman.length === 0 && (
        <div className="no-results">
          <p>No salesmen found matching your criteria.</p>
        </div>
      )}

      {/* Professional Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
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

export default SalesmanList;