import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, TrendingUp, Target, MessageSquare, Filter, ArrowUp, ArrowDown, CheckCircle, XCircle, Plus } from 'lucide-react';
import dataService from '../../services/dataService';
import './SalesmanUpdates.css';

const SalesmanUpdates = () => {
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [salesmanOptions, setSalesmanOptions] = useState([]);
  const [updatesData, setUpdatesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.getSalesmanUpdates();
      setSalesmanOptions(response.salesmen || []);
      setUpdatesData(response.updates || []);
    } catch (err) {
      console.error('Error loading salesman updates:', err);
      setError('Failed to load salesman updates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUpdateIcon = (type, changeType) => {
    // Handle deal update change types first
    if (type === 'deal_update') {
      switch (changeType) {
        case 'promoted':
          return <ArrowUp size={16} />;
        case 'demoted':
          return <ArrowDown size={16} />;
        case 'completed':
          return <CheckCircle size={16} />;
        case 'lost':
          return <XCircle size={16} />;
        case 'created':
          return <Plus size={16} />;
        default:
          return <FileText size={16} />;
      }
    }
    
    // Handle other update types
    switch (type) {
      case 'sales_update':
        return <TrendingUp size={16} />;
      case 'task_update':
        return <Target size={16} />;
      case 'challenge':
        return <MessageSquare size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getUpdateTypeColor = (type, changeType) => {
    // Handle deal update change types first
    if (type === 'deal_update') {
      switch (changeType) {
        case 'promoted':
          return 'green';
        case 'demoted':
          return 'red';
        case 'completed':
          return 'success';
        case 'lost':
          return 'danger';
        case 'created':
          return 'blue';
        default:
          return 'gray';
      }
    }
    
    // Handle other update types
    switch (type) {
      case 'sales_update':
        return 'green';
      case 'task_update':
        return 'blue';
      case 'challenge':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', class: 'completed' },
      'in_progress': { label: 'In Progress', class: 'in-progress' },
      pending: { label: 'Pending', class: 'pending' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredUpdates = () => {
    if (!selectedSalesman) return [];
    
    // Filter updates by selected salesman
    let updates = updatesData.filter(update => update.salesman_id === parseInt(selectedSalesman));
    
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          updates = updates.filter(update => {
            const updateDate = new Date(update.date);
            return updateDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          updates = updates.filter(update => new Date(update.date) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          updates = updates.filter(update => new Date(update.date) >= filterDate);
          break;
        default:
          break;
      }
    }
    
    return updates.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const selectedSalesmanData = salesmanOptions.find(s => s.id === parseInt(selectedSalesman));
  const filteredUpdates = getFilteredUpdates();

  if (loading) {
    return (
      <div className="salesman-updates">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading salesman updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="salesman-updates">
      <div className="updates-header">
        <div className="header-content">
          <FileText size={24} />
          <h2>Salesman Updates</h2>
          <p>View and track individual salesman progress and updates</p>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <div className="updates-controls">
        <div className="salesman-selector">
          <label htmlFor="salesmanSelect">
            <User size={16} />
            Select Salesman
          </label>
          <select
            id="salesmanSelect"
            value={selectedSalesman}
            onChange={(e) => setSelectedSalesman(e.target.value)}
            className="salesman-select"
          >
            <option value="">Choose a salesman...</option>
            {salesmanOptions.map(salesman => (
              <option key={salesman.id} value={salesman.id}>
                {salesman.first_name} {salesman.last_name} ({salesman.username})
              </option>
            ))}
          </select>
        </div>

        {selectedSalesman && (
          <div className="date-filter">
            <label htmlFor="dateFilter">
              <Filter size={16} />
              Filter by Date
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        )}
      </div>

      {selectedSalesman && selectedSalesmanData && (
        <div className="salesman-profile">
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-avatar">
                {selectedSalesmanData.first_name.charAt(0)}
              </div>
              <div className="profile-details">
                <h3>{selectedSalesmanData.first_name} {selectedSalesmanData.last_name}</h3>
                <p>Username: {selectedSalesmanData.username}</p>
                <span className={`status-badge ${selectedSalesmanData.is_active ? 'active' : 'inactive'}`}>
                  {selectedSalesmanData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{filteredUpdates.length}</span>
                <span className="stat-label">Total Updates</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {filteredUpdates.filter(u => u.type === 'sales_update').length}
                </span>
                <span className="stat-label">Sales Updates</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="updates-content">
        {!selectedSalesman ? (
          <div className="no-selection">
            <User size={48} />
            <h3>Select a Salesman</h3>
            <p>Choose a salesman from the dropdown to view their updates and progress</p>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="no-updates">
            <FileText size={48} />
            <h3>No Updates Found</h3>
            <p>No updates available for the selected time period</p>
          </div>
        ) : (
          <div className="updates-list">
            {filteredUpdates.map((update) => (
              <div key={update.id} className="update-card">
                <div className="update-header">
                  <div className="update-type">
                    <div className={`type-icon ${getUpdateTypeColor(update.type, update.change_type)}`}>
                      {getUpdateIcon(update.type, update.change_type)}
                    </div>
                    <div className="type-info">
                      <h4>{update.title}</h4>
                      <span className="update-date">
                        <Calendar size={12} />
                        {formatDate(update.date)}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(update.status)}
                </div>

                <div className="update-content">
                  <p className="update-text">{update.content}</p>
                  
                  {update.metrics && (
                    <div className="update-metrics">
                      {Object.entries(update.metrics).map(([key, value]) => (
                        <div key={key} className="metric-item">
                          <span className="metric-label">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span className="metric-value">
                            {typeof value === 'number' && key.includes('revenue') 
                              ? `₹${value.toLocaleString('en-IN')}` 
                              : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesmanUpdates;
