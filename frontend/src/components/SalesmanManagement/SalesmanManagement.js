import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Plus, List, Calendar, FileText, Download } from 'lucide-react';
import MinimalCard from '../MinimalCard/MinimalCard';
import AccountCreation from './AccountCreation';
import SalesmanList from './SalesmanList';
import TaskAssignment from './TaskAssignment';
import SalesmanUpdates from './SalesmanUpdates';
import ReportGeneration from './ReportGeneration';
import axios from 'axios';
import './SalesmanManagement.css';

const SalesmanManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [metrics, setMetrics] = useState({
    totalSalesman: { count: 0, change: 0, trend: 'up' },
    activeSalesman: { count: 0, change: 0, trend: 'up' },
    inactiveSalesman: { count: 0, change: 0, trend: 'down' }
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch salesman metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/salesmen`, { headers: authHeaders });
      const salesmen = response.data?.salesmen || [];
      
      // Count active and inactive salesmen (exclude deleted users)
      const activeCount = salesmen.filter(s => s.is_active).length;
      const inactiveCount = salesmen.filter(s => !s.is_active).length;
      const totalCount = salesmen.length;
      
      setMetrics({
        totalSalesman: { count: totalCount, change: 0, trend: 'up' },
        activeSalesman: { count: activeCount, change: 0, trend: 'up' },
        inactiveSalesman: { count: inactiveCount, change: 0, trend: 'down' }
      });
    } catch (error) {
      console.error('Failed to fetch salesman metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the current tab from the URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/salesman/create') return 'create';
    if (path === '/salesman' || path === '/salesman/overview' || path === '/salesman/list' || path === '/salesman/salesman') return 'salesman';
    if (path === '/salesman/tasks') return 'tasks';
    if (path === '/salesman/updates') return 'updates';
    if (path === '/salesman/reports') return 'reports';
    return 'create';
  };

  // Update active tab when URL changes
  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);
  }, [location.pathname]);

  // Fetch metrics when component mounts
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Redirect to create if on base salesman route
  useEffect(() => {
    if (location.pathname === '/salesman') {
      navigate('/salesman/create', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/salesman/${tabId}`);
  };

  const handleCardClick = (cardType) => {
    // Filter the salesman list based on the card clicked
    // This will be handled by the SalesmanList component
    console.log(`Clicked on ${cardType} card`);
  };


  const tabs = [
    { id: 'create', label: 'Create Account', icon: Plus },
    { id: 'salesman', label: 'Salesman', icon: Users },
    { id: 'tasks', label: 'Assign Tasks', icon: Calendar },
    { id: 'updates', label: 'Updates', icon: FileText },
    { id: 'reports', label: 'Reports', icon: Download }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return <AccountCreation onDataChange={fetchMetrics} />;
      case 'salesman':
        return (
          <div className="salesman-combined">
            <div className="dashboard-grid">
              <div onClick={() => handleCardClick('total')} style={{ cursor: 'pointer' }}>
                <MinimalCard
                  title="Total Salesman Onboarded"
                  value={metrics.totalSalesman.count}
                  icon={Users}
                  color="blue"
                />
              </div>
              
              <div onClick={() => handleCardClick('active')} style={{ cursor: 'pointer' }}>
                <MinimalCard
                  title="Active Salesman"
                  value={metrics.activeSalesman.count}
                  icon={UserCheck}
                  color="green"
                />
              </div>
              
              <div onClick={() => handleCardClick('inactive')} style={{ cursor: 'pointer' }}>
                <MinimalCard
                  title="Inactive Salesman"
                  value={metrics.inactiveSalesman.count}
                  icon={UserX}
                  color="red"
                />
              </div>
            </div>
            <div className="salesman-list-section">
              <SalesmanList onDataChange={fetchMetrics} />
            </div>
          </div>
        );
      case 'tasks':
        return <TaskAssignment />;
      case 'updates':
        return <SalesmanUpdates />;
      case 'reports':
        return <ReportGeneration />;
      default:
        return (
          <div>
            <h2>Salesman Management</h2>
            <p>Loading...</p>
          </div>
        );
    }
  };

  return (
    <div className="salesman-management">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Salesman Management</h1>
          <p className="dashboard-subtitle">Manage your sales team efficiently</p>
        </div>
      </div>

      <div className="salesman-tabs-container">
        <div className="salesman-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="salesman-content-container">
        <div className="salesman-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SalesmanManagement;