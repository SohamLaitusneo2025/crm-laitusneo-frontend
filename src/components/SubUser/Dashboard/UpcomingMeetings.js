import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Video, Phone, Mail, Clock } from 'lucide-react';
import dataService from '../../../services/dataService';
import { useNotification } from '../../../contexts/NotificationContext';
import './UpcomingMeetings.css';

const UpcomingMeetings = () => {
  const { showError } = useNotification();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load meetings data
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await dataService.getMeetings();
      
      // Filter for upcoming scheduled meetings and sort by date/time
      const upcomingMeetings = meetingsData
        .filter(meeting => {
          const meetingDate = new Date(meeting.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return meeting.status === 'Scheduled' && meetingDate >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        })
        .slice(0, 5); // Show only next 5 meetings
      
      setMeetings(upcomingMeetings);
    } catch (err) {
      console.error('Error loading meetings:', err);
      showError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'microsoft teams':
        return '🔵';
      case 'google meet':
        return '🟢';
      case 'zoom':
        return '🔵';
      default:
        return '📹';
    }
  };

  const getMeetingTypeIcon = (type) => {
    return type === 'online' ? <Video size={16} /> : <MapPin size={16} />;
  };

  const getMeetingTypeColor = (type) => {
    return type === 'online' ? '#3b82f6' : '#10b981';
  };

  const formatDate = (dateString) => {
    const meetingDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);
    
    if (meetingDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (meetingDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return meetingDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="upcoming-meetings">
      <div className="meetings-header">
        <h3 className="meetings-title">
          <Calendar size={20} />
          Upcoming Meetings
        </h3>
        <span className="meetings-count">{meetings.length} meetings</span>
      </div>
      
      <div className="meetings-list">
        {loading ? (
          <div className="meetings-loading">
            <div className="loading-spinner"></div>
            <p>Loading meetings...</p>
          </div>
        ) : meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header">
                <div className="meeting-type">
                  <div 
                    className="meeting-type-icon"
                    style={{ color: getMeetingTypeColor(meeting.type) }}
                  >
                    {getMeetingTypeIcon(meeting.type)}
                  </div>
                  <span className="meeting-type-text">
                    {meeting.type === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="meeting-time">
                  <Clock size={14} />
                  <span>{formatTime(meeting.time)}</span>
                </div>
              </div>
              
              <div className="meeting-content">
                <div className="meeting-details">
                  <h4 className="client-name">{meeting.clientName}</h4>
                  
                  {meeting.type === 'online' ? (
                    <div className="platform-info">
                      <span className="platform-icon">{getPlatformIcon(meeting.platform)}</span>
                      <span className="platform-name">{meeting.platform || 'Online Platform'}</span>
                    </div>
                  ) : (
                    <div className="location-info">
                      <MapPin size={14} />
                      <span className="location-text">{meeting.venue || 'Venue TBD'}</span>
                    </div>
                  )}
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
              
              <div className="meeting-footer">
                <span className="meeting-date">{formatDate(meeting.date)}</span>
                <span className="meeting-duration">1 hour</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-meetings">
            <Calendar size={48} />
            <h4>No Upcoming Meetings</h4>
            <p>You don't have any scheduled meetings at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingMeetings;
