import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Package, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';
import logo from '../../Assets/logo.png'

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, active: true },
    { path: '/salesman', label: 'Salesman Management', icon: Users, active: true },
    { path: '/leads', label: 'Lead Management', icon: UserCheck, active: true},
    { path: '/products', label: 'Product Management', icon: Package, active: true },
    
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <img src={logo} alt="CRM Logo" className="logo-image" />
        </div>
      </div>
      
      <ul className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if current path starts with the item path for sub-routes
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
          const isDisabled = !item.active;
          
          return (
            <li key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              {isDisabled ? (
                  <div
                    className={`nav-link nav-link-disabled ${item.comingSoon ? 'nav-link-coming-soon' : ''}`}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.comingSoon && <span className="coming-soon-badge">Soon</span>}
                  </div>
              ) : (
                <Link 
                  to={item.path} 
                  className="nav-link"
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      
      <div className="nav-footer">
        <div className="nav-user">
          <div className="user-avatar">
            {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : 'AD'}
          </div>
          <div className="user-info">
            <p className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
            </p>
            <p className="user-role">
              {user ? (user.user_type === 'main' ? 'Main User' : 'Sub User') : 'Administrator'}
            </p>
          </div>
        </div>
        <button 
          className="logout-btn"
          onClick={logout}
          title="Logout"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
