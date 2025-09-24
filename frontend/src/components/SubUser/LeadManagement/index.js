import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, Users, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import dataService from '../../../services/dataService';
import { useNotification } from '../../../contexts/NotificationContext';
import './LeadManagement.css';

const SubUserLeadManagement = () => {
  const { showSuccess, showError } = useNotification();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    contactNumber: '',
    productName: '',
    status: 'New',
    value: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load leads from API
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const leadsData = await dataService.getLeads();
      setLeads(leadsData);
    } catch (err) {
      console.error('Error loading leads:', err);
      showError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate lead statistics
  const totalLeads = leads.length;
  const acceptedLeads = leads.filter(lead => lead.status === 'Accepted').length;
  const rejectedLeads = leads.filter(lead => lead.status === 'Rejected').length;

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, rowsPerPage]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(parseInt(newRowsPerPage));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'Accepted': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Contacted': return '#f59e0b';
      case 'Qualified': return '#8b5cf6';
      default: return '#6b7280';
    }
  };


  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await dataService.updateLeadStatus(leadId, newStatus);
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      // Show success message for accepted leads
      if (newStatus === 'Accepted') {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          showSuccess(`Lead "${lead.name}" has been accepted and moved to the deals pipeline!`);
        }
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      showError('Failed to update lead status. Please try again.');
    }
  };

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    
    try {
      await dataService.deleteLead(leadToDelete.id);
      setLeads(leads.filter(lead => lead.id !== leadToDelete.id));
      setShowDeleteModal(false);
      setLeadToDelete(null);
      showSuccess(`Lead "${leadToDelete.name}" has been deleted successfully!`);
    } catch (err) {
      console.error('Error deleting lead:', err);
      showError('Failed to delete lead. Please try again.');
    }
  };

  const cancelDeleteLead = () => {
    setShowDeleteModal(false);
    setLeadToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!newLead.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!newLead.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!newLead.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    }

    if (!newLead.productName.trim()) {
      errors.productName = 'Product name is required';
    }

    return errors;
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const leadData = {
          name: newLead.name,
          email: newLead.email,
          contactNo: newLead.contactNumber,
          productName: newLead.productName,
          status: newLead.status,
          value: newLead.value
        };

        const response = await dataService.addLead(leadData);
        setLeads([response.lead, ...leads]);
        setNewLead({
          name: '',
          email: '',
          contactNumber: '',
          productName: '',
          status: 'New',
          value: 0
        });
        setFormErrors({});
        setShowAddModal(false);
        showSuccess('Lead added successfully!');
      } catch (err) {
        console.error('Error adding lead:', err);
        showError('Failed to add lead. Please try again.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewLead(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (loading) {
    return (
      <div className="sub-user-lead-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-user-lead-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Lead Management</h1>
        </div>
        <div className="header-actions">
          <button 
            className="search-btn"
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Search size={20} />
          </button>
          <button 
            className="add-lead-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-cards">
        <div className="status-card total">
          <div className="card-icon">
            <Users size={24} />
          </div>
          <div className="card-content">
            <h3>Total Leads</h3>
            <div className="card-number">{totalLeads}</div>
          </div>
        </div>
        <div className="status-card accepted">
          <div className="card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Accepted Leads</h3>
            <div className="card-number">{acceptedLeads}</div>
          </div>
        </div>
        <div className="status-card rejected">
          <div className="card-icon">
            <XCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Rejected Leads</h3>
            <div className="card-number">{rejectedLeads}</div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Pipelined">Pipelined</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
      )}

      <div className="leads-table-wrapper">
        <div className="leads-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="lead-id">
                      <span className="lead-id-text">{lead.lead_id || `L${lead.id.toString().padStart(3, '0')}`}</span>
                    </div>
                  </td>
                  <td>
                    <div className="company-info">
                      <div className="company-name">{lead.name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-email">{lead.email}</div>
                    </div>
                  </td>
                  <td>{lead.contactNo}</td>
                  <td>{lead.productName}</td>
                  <td>
                    <div className="price-value">
                      ₹{lead.value ? lead.value.toLocaleString('en-IN') : '0'}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(lead.status) }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <div className="created-date">
                      {formatDate(lead.created_at)}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn accept-btn"
                        onClick={() => handleStatusChange(lead.id, 'Accepted')}
                        title="Accept Lead"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        className="action-btn reject-btn"
                        onClick={() => handleStatusChange(lead.id, 'Rejected')}
                        title="Reject Lead"
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteLead(lead)}
                        title="Delete Lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLeads.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <div className="rows-per-page">
                <span>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(e.target.value)}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="pagination-info-text">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} entries
              </div>
            </div>

            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredLeads.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>No leads found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}


      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Lead</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddLead}>
                <div className="form-group">
                  <label>Name *</label>
                  <input 
                    type="text" 
                    value={newLead.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter lead name"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={newLead.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input 
                    type="tel" 
                    value={newLead.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="Enter contact number"
                    className={formErrors.contactNumber ? 'error' : ''}
                  />
                  {formErrors.contactNumber && <span className="error-message">{formErrors.contactNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    value={newLead.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Enter product name"
                    className={formErrors.productName ? 'error' : ''}
                  />
                  {formErrors.productName && <span className="error-message">{formErrors.productName}</span>}
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={newLead.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Lead Value (₹)</label>
                  <input 
                    type="number" 
                    value={newLead.value}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                    placeholder="Enter lead value"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && leadToDelete && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3>Delete Lead</h3>
              <button 
                className="modal-close"
                onClick={cancelDeleteLead}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">
                  <Trash2 size={48} color="#ef4444" />
                </div>
                <h4>Are you sure you want to delete this lead?</h4>
                <p>This action cannot be undone. The following lead will be permanently removed:</p>
                <div className="lead-details">
                  <div className="detail-item">
                    <strong>Name:</strong> {leadToDelete.name}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {leadToDelete.email}
                  </div>
                  <div className="detail-item">
                    <strong>Product:</strong> {leadToDelete.productName}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(leadToDelete.status) }}
                    >
                      {leadToDelete.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={cancelDeleteLead}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-danger"
                  onClick={confirmDeleteLead}
                >
                  <Trash2 size={16} />
                  Delete Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubUserLeadManagement;
