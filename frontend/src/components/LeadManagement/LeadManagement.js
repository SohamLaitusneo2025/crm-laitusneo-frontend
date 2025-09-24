import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  Package,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import Modal from '../Modal/Modal';
import './LeadManagement.css';
import dataService from '../../services/dataService';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [, setEditingLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    showCancel: false,
    onConfirm: null
  });
  const [newLead, setNewLead] = useState({
    name: '',
    contactNo: '',
    email: '',
    productName: '',
    productStatus: 'interested',
    salesmanName: '',
    status: 'active',
    value: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const leadsData = await dataService.getLeads();
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const activeLeads = leads.filter(lead => lead.status === 'New' || lead.status === 'Accepted');
  const pipelinedLeads = leads.filter(lead => lead.status === 'Pipelined');
  const wonLeads = leads.filter(lead => lead.status === 'Won');
  const lostLeads = leads.filter(lead => lead.status === 'Lost' || lead.status === 'Rejected');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.salesman_name && lead.salesman_name.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!newLead.name.trim()) {
      errors.name = 'Full name is required';
    } else if (newLead.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Contact number validation
    if (!newLead.contactNo.trim()) {
      errors.contactNo = 'Contact number is required';
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(newLead.contactNo.replace(/[\s\-()]/g, ''))) {
      errors.contactNo = 'Please enter a valid phone number';
    }

    // Email validation
    if (!newLead.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Product name validation
    if (!newLead.productName.trim()) {
      errors.productName = 'Product name is required';
    }

    // Salesman name validation
    if (!newLead.salesmanName.trim()) {
      errors.salesmanName = 'Salesman name is required';
    }

    // Lead value validation
    if (newLead.value < 0) {
      errors.value = 'Lead value cannot be negative';
    }

    return errors;
  };

  const handleAddLead = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dataService.addLead(newLead);
      setNewLead({
        name: '',
        contactNo: '',
        email: '',
        productName: '',
        productStatus: 'interested',
        salesmanName: '',
        status: 'active',
        value: 0
      });
      setFormErrors({});
      setShowAddModal(false);
      loadLeads();

      // Show success message
      setModalData({
        type: 'success',
        title: 'Lead Added Successfully',
        message: 'The new lead has been added to your CRM system.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error adding lead:', error);
      setModalData({
        type: 'error',
        title: 'Error Adding Lead',
        message: 'Failed to add the lead. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    setModalData({
      type: 'confirm',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',
      confirmText: 'Delete',
      showCancel: true,
      onConfirm: async () => {
        try {
          await dataService.deleteLead(leadId);
          loadLeads();
          setModalData({
            type: 'success',
            title: 'Deleted Successfully',
            message: 'Lead has been deleted successfully.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        } catch (error) {
          console.error('Error deleting lead:', error);
          setModalData({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete lead. Please try again.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        }
      }
    });
    setShowModal(true);
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await dataService.updateLeadStatus(leadId, newStatus);
      loadLeads();
      
      // Show success message for accepted leads
      if (newStatus === 'Accepted') {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          setError(`✅ Lead "${lead.name}" has been accepted and moved to the deals pipeline!`);
          // Clear the success message after 5 seconds
          setTimeout(() => setError(null), 5000);
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      setError('Failed to update lead status. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const getProductStatusColor = (status) => {
    switch (status) {
      case 'purchased': return '#10b981';
      case 'interested': return '#3b82f6';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getProductStatusIcon = (status) => {
    switch (status) {
      case 'purchased': return <TrendingUp size={16} />;
      case 'interested': return <Eye size={16} />;
      case 'rejected': return <TrendingDown size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'Accepted': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Pipelined': return '#8b5cf6';
      case 'Won': return '#059669';
      case 'Lost': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // if (loading) {
  //   return (
  //     <div className="loading-container">
  //       <div className="loading-spinner">
  //         <div className="modern-spinner">
  //           <div className="spinner-ring"></div>
  //           <div className="spinner-ring"></div>
  //           {/* <div className="spinner-ring"></div> */}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="lead-management">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Lead Management</h1>
          <p className="dashboard-subtitle">Track and manage your sales leads effectively</p>
          {error && <div className="error-message">{error}</div>}
        </div>
        {/* <button
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Add New Lead
        </button> */}
      </div>

      {/* Summary Cards */}
      <div className="leads-summary">
        <div className="summary-card">
          <div className="summary-icon active">
            <UserCheck size={24} />
          </div>
          <div className="summary-info">
            <h4>Active Leads</h4>
            <div className="summary-count">{activeLeads.length}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pipelined">
            <Package size={24} />
          </div>
          <div className="summary-info">
            <h4>Pipelined</h4>
            <div className="summary-count">{pipelinedLeads.length}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon value">
            <DollarSign size={24} />
          </div>
          <div className="summary-info">
            <h4>Total Value</h4>
            <div className="summary-count">
              {formatCurrency(leads.reduce((sum, lead) => sum + (lead.value || 0), 0))}
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon won">
            <TrendingUp size={24} />
          </div>
          <div className="summary-info">
            <h4>Won Leads</h4>
            <div className="summary-count">{wonLeads.length}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon lost">
            <TrendingDown size={24} />
          </div>
          <div className="summary-info">
            <h4>Lost Leads</h4>
            <div className="summary-count">{lostLeads.length}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="leads-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Leads</option>
            <option value="New">New</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Pipelined">Pipelined</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="leads-section">
        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Lead</th>
                <th>Contact</th>
                <th>Product</th>
                <th>Salesman</th>
                <th>Value</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead) => (
                <tr key={lead.id} className={`lead-row ${lead.status}`}>
                  <td className="lead-id-cell">
                    <div className="lead-id">
                      <span className="lead-id-text">{lead.lead_id || `L${lead.id.toString().padStart(3, '0')}`}</span>
                    </div>
                  </td>
                  <td className="lead-info-cell">
                    <div className="lead-name">{lead.name}</div>
                  </td>
                  <td className="contact-cell">
                    <div className="contact-info">
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{lead.contactNo}</span>
                      </div>
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="product-cell">
                    <div className="product-info">
                      <div className="product-name">{lead.productName}</div>
                      <div
                        className="product-status"
                        style={{ color: getProductStatusColor(lead.productStatus) }}
                      >
                        <span>{lead.productStatus}</span>
                      </div>
                    </div>
                  </td>
                  <td className="salesman-cell">
                    <div className="salesman-info">
                      <User size={14} />
                      <span>{lead.salesman_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="value-cell">
                    <div className="value-amount">
                      {formatCurrency(lead.value || 0)}
                    </div>
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(lead.status) }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="created-date-cell">
                    <div className="created-date">
                      {formatDate(lead.created_at)}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => setEditingLead(lead)}
                        title="Edit Lead"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDeleteLead(lead.id)}
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

          {filteredLeads.length === 0 && (
            <div className="no-data">
              <UserCheck size={48} />
              <h3>No leads found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
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
                  <option value={50}>50</option>
                  <option value={100}>100</option>
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

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3>Add New Lead</h3>
                  <p className="modal-subtitle">Enter the lead information to create a new prospect</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="modal-form">
              <div className="form-sections">
                <div className="form-section">
                  <h4 className="form-section-title">
                    <User size={18} />
                    Personal Information
                  </h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="leadName">
                        <User size={16} />
                        Full Name
                      </label>
                      <input
                        id="leadName"
                        type="text"
                        value={newLead.name}
                        onChange={(e) => {
                          setNewLead({ ...newLead, name: e.target.value });
                          if (formErrors.name) {
                            setFormErrors({ ...formErrors, name: '' });
                          }
                        }}
                        placeholder="Enter full name"
                        className={formErrors.name ? 'error' : ''}
                        required
                      />
                      {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactNumber">
                        <Phone size={16} />
                        Contact Number
                      </label>
                      <input
                        id="contactNumber"
                        type="tel"
                        value={newLead.contactNo}
                        onChange={(e) => {
                          setNewLead({ ...newLead, contactNo: e.target.value });
                          if (formErrors.contactNo) {
                            setFormErrors({ ...formErrors, contactNo: '' });
                          }
                        }}
                        placeholder="+1 (555) 123-4567"
                        className={formErrors.contactNo ? 'error' : ''}
                        required
                      />
                      {formErrors.contactNo && <span className="error-message">{formErrors.contactNo}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">
                        <Mail size={16} />
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => {
                          setNewLead({ ...newLead, email: e.target.value });
                          if (formErrors.email) {
                            setFormErrors({ ...formErrors, email: '' });
                          }
                        }}
                        placeholder="example@company.com"
                        className={formErrors.email ? 'error' : ''}
                        required
                      />
                      {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">
                    <Package size={18} />
                    Product Information
                  </h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="productName">
                        <Package size={16} />
                        Product Name
                      </label>
                      <input
                        id="productName"
                        type="text"
                        value={newLead.productName}
                        onChange={(e) => {
                          setNewLead({ ...newLead, productName: e.target.value });
                          if (formErrors.productName) {
                            setFormErrors({ ...formErrors, productName: '' });
                          }
                        }}
                        placeholder="Enter product name"
                        className={formErrors.productName ? 'error' : ''}
                        required
                      />
                      {formErrors.productName && <span className="error-message">{formErrors.productName}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="productStatus">
                        <TrendingUp size={16} />
                        Product Status
                      </label>
                      <select
                        id="productStatus"
                        value={newLead.productStatus}
                        onChange={(e) => setNewLead({ ...newLead, productStatus: e.target.value })}
                      >
                        <option value="interested">Interested</option>
                        <option value="purchased">Purchased</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">
                    <UserCheck size={18} />
                    Sales Information
                  </h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="salesmanName">
                        <User size={16} />
                        Assigned Salesman
                      </label>
                      <input
                        id="salesmanName"
                        type="text"
                        value={newLead.salesmanName}
                        onChange={(e) => {
                          setNewLead({ ...newLead, salesmanName: e.target.value });
                          if (formErrors.salesmanName) {
                            setFormErrors({ ...formErrors, salesmanName: '' });
                          }
                        }}
                        placeholder="Enter salesman name"
                        className={formErrors.salesmanName ? 'error' : ''}
                        required
                      />
                      {formErrors.salesmanName && <span className="error-message">{formErrors.salesmanName}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="leadValue">
                        <DollarSign size={16} />
                        Lead Value
                      </label>
                      <div className="input-with-currency">
                        <span className="currency-symbol">₹</span>
                        <input
                          id="leadValue"
                          type="number"
                          value={newLead.value}
                          onChange={(e) => {
                            setNewLead({ ...newLead, value: parseFloat(e.target.value) || 0 });
                            if (formErrors.value) {
                              setFormErrors({ ...formErrors, value: '' });
                            }
                          }}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={formErrors.value ? 'error' : ''}
                          required
                        />
                      </div>
                      {formErrors.value && <span className="error-message">{formErrors.value}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Modal */}
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

export default LeadManagement;