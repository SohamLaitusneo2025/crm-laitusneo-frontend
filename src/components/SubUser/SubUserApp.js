import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SubUserNavigation from './SubUserNavigation';

import SubUserDashboard from './Dashboard/SubUserDashboard';
import SubUserLeadManagement from './LeadManagement';
import SubUserTaskManagement from './TaskManagement';
import SubUserMeetingManagement from './MeetingManagement';
import SubUserPitchDeck from './PitchDeck';
import './SubUserApp.css';

const SubUserApp = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Get the current tab from the URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/sub-user' || path === '/sub-user/dashboard') return 'dashboard';
    if (path === '/sub-user/task-management') return 'task-management';
    if (path === '/sub-user/lead-management') return 'lead-management';
    if (path === '/sub-user/meeting-management') return 'meeting-management';
    if (path === '/sub-user/pitch-deck') return 'pitch-deck';
    return 'dashboard';
  };

  // Update active tab when URL changes
  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);
  }, [location.pathname]);

  // Redirect to dashboard if on base sub-user route
  useEffect(() => {
    if (location.pathname === '/sub-user') {
      navigate('/sub-user/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SubUserDashboard />;
      case 'task-management':
        return <SubUserTaskManagement />;
      case 'lead-management':
        return <SubUserLeadManagement />;
      case 'meeting-management':
        return <SubUserMeetingManagement />;
      case 'pitch-deck':
        return <SubUserPitchDeck />;
      default:
        return <SubUserDashboard />;
    }
  };

  return (
    <div className="sub-user-app">
      <SubUserNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="sub-user-main">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default SubUserApp;
