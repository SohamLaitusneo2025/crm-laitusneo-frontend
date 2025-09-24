import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './SubUserNavigation.css';
import logo from '../../Assets/logo.png';

const SubUserNavigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/sub-user/dashboard' },
    { id: 'task-management', label: 'Tasks', icon: CheckSquare, path: '/sub-user/task-management' },
    { id: 'lead-management', label: 'Leads', icon: Users, path: '/sub-user/lead-management' },
    { id: 'meeting-management', label: 'Meetings', icon: Calendar, path: '/sub-user/meeting-management' },
    { id: 'pitch-deck', label: 'Sales Deck', icon: FileText, path: '/sub-user/pitch-deck' }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path, tabId) => {
    navigate(path);
    if (setActiveTab) {
      setActiveTab(tabId);
    }
  };

  return (
    <nav className="sub-user-navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <img src={logo} alt="CRM Logo" className="logo-image" />
        </div>
      </div>
      
      <ul className="nav-menu">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <li key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}>
              <button
                className="nav-link"
                onClick={() => handleNavigation(item.path, item.id)}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label-1">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="nav-footer">
        <div className="nav-user">
          <div className="user-avatar">
            {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : 'SU'}
          </div>
          <div className="user-info">
            <p className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Sub User'}
            </p>
            <p className="user-role">
              {user ? (user.user_type === 'main' ? 'Main User' : 'Sub User') : 'Salesman'}
            </p>
          </div>
        </div>
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </nav>
  );
};

export default SubUserNavigation;
