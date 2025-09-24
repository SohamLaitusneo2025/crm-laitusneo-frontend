import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import dataService from '../../../services/dataService';
import { useNotification } from '../../../contexts/NotificationContext';
import './MeetingManagement.css';

const SubUserMeetingManagement = () => {
  const { showSuccess, showError } = useNotification();
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMeeting, setNewMeeting] = useState({
    type: 'offline',
    clientName: '',
    mobileNumber: '',
    email: '',
    date: '',
    time: '',
    venue: '',
    platform: '',
    meetingLink: '',
    googleMapsLink: '',
    status: 'Scheduled'
  });
  const [formErrors, setFormErrors] = useState({});

  // Reset form to default values
  const resetForm = () => {
    setNewMeeting({
      type: 'offline',
      clientName: '',
      mobileNumber: '',
      email: '',
      date: '',
      time: '',
      venue: '',
      platform: '',
      meetingLink: '',
      googleMapsLink: '',
      status: 'Scheduled'
    });
    setFormErrors({});
  };

  // Load meetings from API
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await dataService.getMeetings();
      setMeetings(meetingsData);
    } catch (err) {
      console.error('Error loading meetings:', err);
      showError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    return type === 'online' ? Video : MapPin;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#3b82f6';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      case 'Postponed': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle;
      case 'Cancelled': return XCircle;
      case 'Postponed': return AlertCircle;
      default: return Calendar;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'all') {
      // Hide completed meetings from "all" view
      return meeting.status !== 'Completed';
    }
    if (activeTab === 'offline') return meeting.type === 'offline' && meeting.status !== 'Completed';
    if (activeTab === 'online') return meeting.type === 'online' && meeting.status !== 'Completed';
    return meeting.status.toLowerCase() === activeTab;
  });

  const validateForm = () => {
    const errors = {};

    if (!newMeeting.clientName.trim()) {
      errors.clientName = 'Client name is required';
    }

    if (!newMeeting.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    }

    if (!newMeeting.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMeeting.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!newMeeting.date) {
      errors.date = 'Date is required';
    }

    if (!newMeeting.time) {
      errors.time = 'Time is required';
    }

    if (newMeeting.type === 'offline' && !newMeeting.venue.trim()) {
      errors.venue = 'Venue is required for offline meetings';
    }

    if (newMeeting.type === 'online' && !newMeeting.platform.trim()) {
      errors.platform = 'Platform is required for online meetings';
    }

    // Validate meeting link for online meetings
    if (newMeeting.type === 'online' && newMeeting.meetingLink.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(newMeeting.meetingLink.trim())) {
        errors.meetingLink = 'Please enter a valid meeting link (must start with http:// or https://)';
      }
    }

    // Validate Google Maps link for offline meetings
    if (newMeeting.type === 'offline' && newMeeting.googleMapsLink.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(newMeeting.googleMapsLink.trim())) {
        errors.googleMapsLink = 'Please enter a valid Google Maps link (must start with http:// or https://)';
      }
    }

    return errors;
  };

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await dataService.addMeeting(newMeeting);
        setMeetings([response.meeting, ...meetings]);
        resetForm();
        setShowAddModal(false);
        showSuccess('Meeting scheduled successfully!');
      } catch (err) {
        console.error('Error adding meeting:', err);
        showError('Failed to schedule meeting. Please try again.');
      }
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setNewMeeting(meeting);
    setShowEditModal(true);
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await dataService.updateMeeting(editingMeeting.id, newMeeting);
        setMeetings(meetings.map(meeting => 
          meeting.id === editingMeeting.id 
            ? response.meeting
            : meeting
        ));
        setEditingMeeting(null);
        setNewMeeting({
          type: 'offline',
          clientName: '',
          mobileNumber: '',
          email: '',
          date: '',
          time: '',
          venue: '',
          platform: '',
          meetingLink: '',
          googleMapsLink: '',
          status: 'Scheduled'
        });
        setFormErrors({});
        setShowEditModal(false);
        showSuccess('Meeting updated successfully!');
      } catch (err) {
        console.error('Error updating meeting:', err);
        showError('Failed to update meeting. Please try again.');
      }
    }
  };

  const handleStatusChange = async (meetingId, newStatus) => {
    try {
      await dataService.updateMeetingStatus(meetingId, newStatus);
      setMeetings(meetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status: newStatus }
          : meeting
      ));
      showSuccess('Meeting status updated successfully!');
    } catch (err) {
      console.error('Error updating meeting status:', err);
      showError('Failed to update meeting status. Please try again.');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await dataService.deleteMeeting(meetingId);
        setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
        showSuccess('Meeting deleted successfully!');
      } catch (err) {
        console.error('Error deleting meeting:', err);
        showError('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewMeeting(prev => ({
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="sub-user-meeting-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Meeting Management</h1>
          {/* <p>Schedule and manage your client meetings</p> */}
        </div>
        <button 
          className="add-meeting-btn"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Plus size={20} />
          Schedule Meeting
        </button>
      </div>

      {/* Meeting Type Tabs */}
      <div className="meeting-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Meetings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'offline' ? 'active' : ''}`}
          onClick={() => setActiveTab('offline')}
        >
          <MapPin size={16} />
          Offline Meetings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveTab('online')}
        >
          <Video size={16} />
          Online Meetings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {/* Meetings List */}
      <div className="meetings-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading meetings...</p>
          </div>
        ) : filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => {
            const TypeIcon = getTypeIcon(meeting.type);
            const StatusIcon = getStatusIcon(meeting.status);
            
            return (
              <div key={meeting.id} className={`meeting-card ${meeting.type}`}>
                <div className="meeting-header">
                  <div className="meeting-type">
                    <TypeIcon size={20} />
                    <span className="type-label">
                      {meeting.type === 'offline' ? 'Offline Meeting' : 'Online Meeting'}
                    </span>
                  </div>
                  <div className="meeting-actions-header">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditMeeting(meeting)}
                      title="Edit Meeting"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      title="Delete Meeting"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="meeting-content">
                  <div className="client-info">
                    <div className="client-header">
                      <h3 className="client-name">{meeting.clientName}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(meeting.status) }}
                      >
                        <StatusIcon size={12} />
                        {meeting.status}
                      </span>
                    </div>
                    <div className="contact-details">
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{meeting.mobileNumber}</span>
                      </div>
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{meeting.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="meeting-details">
                    <div className="detail-row">
                      <div className="detail-item date-time">
                        <Calendar size={16} />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="detail-item date-time">
                        <Clock size={16} />
                        <span>{formatTime(meeting.time)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item venue-platform">
                        {meeting.type === 'offline' ? (
                          <>
                            <MapPin size={16} />
                            <span>{meeting.venue}</span>
                          </>
                        ) : (
                          <>
                            <Video size={16} />
                            <span>{meeting.platform}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Display meeting links */}
                    {meeting.type === 'online' && meeting.meetingLink && (
                      <div className="detail-row">
                        <div className="detail-item link-item">
                          <Video size={16} />
                          <a 
                            href={meeting.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="meeting-link"
                          >
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {meeting.type === 'offline' && meeting.googleMapsLink && (
                      <div className="detail-row">
                        <div className="detail-item link-item">
                          <MapPin size={16} />
                          <a 
                            href={meeting.googleMapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="meeting-link"
                          >
                            View on Maps
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                <div className="meeting-actions">
                  {meeting.status === 'Scheduled' && (
                    <>
                      <button 
                        className="status-btn completed-btn"
                        onClick={() => handleStatusChange(meeting.id, 'Completed')}
                      >
                        <CheckCircle size={16} />
                        Completed
                      </button>
                      <button 
                        className="status-btn cancelled-btn"
                        onClick={() => handleStatusChange(meeting.id, 'Cancelled')}
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                      <button 
                        className="status-btn postponed-btn"
                        onClick={() => handleStatusChange(meeting.id, 'Postponed')}
                      >
                        <AlertCircle size={16} />
                        Postpone
                      </button>
                    </>
                  )}
                  {meeting.status === 'Postponed' && (
                    <>
                      <button 
                        className="status-btn completed-btn"
                        onClick={() => handleStatusChange(meeting.id, 'Completed')}
                      >
                        <CheckCircle size={16} />
                        Completed
                      </button>
                      <button 
                        className="status-btn scheduled-btn"
                        onClick={() => handleStatusChange(meeting.id, 'Scheduled')}
                      >
                        <Calendar size={16} />
                        Reschedule
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h3>No meetings found</h3>
            <p>Start by scheduling your first meeting with a client.</p>
          </div>
        )}
      </div>

      {/* Add Meeting Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule New Meeting</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddMeeting}>
                <div className="form-group">
                  <label>Meeting Type *</label>
                  <select 
                    value={newMeeting.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="offline">Offline Meeting</option>
                    <option value="online">Online Meeting</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Client Name *</label>
                  <input 
                    type="text" 
                    value={newMeeting.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Enter client name"
                    className={formErrors.clientName ? 'error' : ''}
                  />
                  {formErrors.clientName && <span className="error-message">{formErrors.clientName}</span>}
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={newMeeting.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="Enter mobile number"
                    className={formErrors.mobileNumber ? 'error' : ''}
                  />
                  {formErrors.mobileNumber && <span className="error-message">{formErrors.mobileNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={newMeeting.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input 
                      type="date" 
                      value={newMeeting.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={formErrors.date ? 'error' : ''}
                    />
                    {formErrors.date && <span className="error-message">{formErrors.date}</span>}
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <input 
                      type="time" 
                      value={newMeeting.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className={formErrors.time ? 'error' : ''}
                    />
                    {formErrors.time && <span className="error-message">{formErrors.time}</span>}
                  </div>
                </div>

                {newMeeting.type === 'offline' ? (
                  <>
                    <div className="form-group">
                      <label>Venue *</label>
                      <input 
                        type="text" 
                        value={newMeeting.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        placeholder="Enter meeting venue"
                        className={formErrors.venue ? 'error' : ''}
                      />
                      {formErrors.venue && <span className="error-message">{formErrors.venue}</span>}
                    </div>
                    <div className="form-group">
                      <label>Google Maps Link</label>
                      <input 
                        type="url" 
                        value={newMeeting.googleMapsLink}
                        onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className={formErrors.googleMapsLink ? 'error' : ''}
                      />
                      {formErrors.googleMapsLink && <span className="error-message">{formErrors.googleMapsLink}</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Platform *</label>
                      <select 
                        value={newMeeting.platform}
                        onChange={(e) => handleInputChange('platform', e.target.value)}
                        className={formErrors.platform ? 'error' : ''}
                      >
                        <option value="">Select platform</option>
                        <option value="Microsoft Teams">Microsoft Teams</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Skype">Skype</option>
                        <option value="WebEx">WebEx</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.platform && <span className="error-message">{formErrors.platform}</span>}
                    </div>
                    <div className="form-group">
                      <label>Meeting Link</label>
                      <input 
                        type="url" 
                        value={newMeeting.meetingLink}
                        onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                        placeholder="https://teams.microsoft.com/... or https://meet.google.com/..."
                        className={formErrors.meetingLink ? 'error' : ''}
                      />
                      {formErrors.meetingLink && <span className="error-message">{formErrors.meetingLink}</span>}
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Meeting</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateMeeting}>
                <div className="form-group">
                  <label>Meeting Type *</label>
                  <select 
                    value={newMeeting.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="offline">Offline Meeting</option>
                    <option value="online">Online Meeting</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Client Name *</label>
                  <input 
                    type="text" 
                    value={newMeeting.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Enter client name"
                    className={formErrors.clientName ? 'error' : ''}
                  />
                  {formErrors.clientName && <span className="error-message">{formErrors.clientName}</span>}
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={newMeeting.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="Enter mobile number"
                    className={formErrors.mobileNumber ? 'error' : ''}
                  />
                  {formErrors.mobileNumber && <span className="error-message">{formErrors.mobileNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={newMeeting.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input 
                      type="date" 
                      value={newMeeting.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={formErrors.date ? 'error' : ''}
                    />
                    {formErrors.date && <span className="error-message">{formErrors.date}</span>}
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <input 
                      type="time" 
                      value={newMeeting.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className={formErrors.time ? 'error' : ''}
                    />
                    {formErrors.time && <span className="error-message">{formErrors.time}</span>}
                  </div>
                </div>

                {newMeeting.type === 'offline' ? (
                  <>
                    <div className="form-group">
                      <label>Venue *</label>
                      <input 
                        type="text" 
                        value={newMeeting.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        placeholder="Enter meeting venue"
                        className={formErrors.venue ? 'error' : ''}
                      />
                      {formErrors.venue && <span className="error-message">{formErrors.venue}</span>}
                    </div>
                    <div className="form-group">
                      <label>Google Maps Link</label>
                      <input 
                        type="url" 
                        value={newMeeting.googleMapsLink}
                        onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className={formErrors.googleMapsLink ? 'error' : ''}
                      />
                      {formErrors.googleMapsLink && <span className="error-message">{formErrors.googleMapsLink}</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Platform *</label>
                      <select 
                        value={newMeeting.platform}
                        onChange={(e) => handleInputChange('platform', e.target.value)}
                        className={formErrors.platform ? 'error' : ''}
                      >
                        <option value="">Select platform</option>
                        <option value="Microsoft Teams">Microsoft Teams</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Skype">Skype</option>
                        <option value="WebEx">WebEx</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.platform && <span className="error-message">{formErrors.platform}</span>}
                    </div>
                    <div className="form-group">
                      <label>Meeting Link</label>
                      <input 
                        type="url" 
                        value={newMeeting.meetingLink}
                        onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                        placeholder="https://teams.microsoft.com/... or https://meet.google.com/..."
                        className={formErrors.meetingLink ? 'error' : ''}
                      />
                      {formErrors.meetingLink && <span className="error-message">{formErrors.meetingLink}</span>}
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={newMeeting.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubUserMeetingManagement;