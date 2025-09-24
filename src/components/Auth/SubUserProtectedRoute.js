import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SubUserProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="modern-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is a sub-user
  if (!isAuthenticated || user?.user_type !== 'sub') {
    return <Navigate to="/sub-user-login" replace />;
  }

  return children;
};

export default SubUserProtectedRoute;
