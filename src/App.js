import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import SalesmanManagement from './components/SalesmanManagement/SalesmanManagement';
import ProductManagement from './components/ProductManagement/ProductManagement';
import LeadManagement from './components/LeadManagement/LeadManagement';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import SubUserApp from './components/SubUser/SubUserApp';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SubUserProtectedRoute from './components/Auth/SubUserProtectedRoute';
import './App.css';
import './components/Auth/LoadingSpinner.css';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

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

  // Check if user is a sub-user
  const isSubUser = user?.user_type === 'sub';

  return (
    <div className="app">
      {isAuthenticated && !isSubUser && <Navigation />}
      <main className={isAuthenticated && !isSubUser ? "main-content" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={isSubUser ? "/sub-user" : "/"} replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to={isSubUser ? "/sub-user" : "/"} replace /> : <Signup />} 
          />
          
          {/* Sub-User Routes */}
          <Route path="/sub-user" element={
            <SubUserProtectedRoute>
              <SubUserApp />
            </SubUserProtectedRoute>
          } />
          <Route path="/sub-user/dashboard" element={
            <SubUserProtectedRoute>
              <SubUserApp />
            </SubUserProtectedRoute>
          } />
          <Route path="/sub-user/task-management" element={
            <SubUserProtectedRoute>
              <SubUserApp />
            </SubUserProtectedRoute>
          } />
          <Route path="/sub-user/lead-management" element={
            <SubUserProtectedRoute>
              <SubUserApp />
            </SubUserProtectedRoute>
          } />
          <Route path="/sub-user/meeting-management" element={
            <SubUserProtectedRoute>
              <SubUserApp />
            </SubUserProtectedRoute>
          } />
          <Route path="/sub-user/pitch-deck" element={
            <SubUserProtectedRoute>
              <SubUserApp />
            </SubUserProtectedRoute>
          } />
          
          {/* Main User Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/salesman" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/salesman" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/overview" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/list" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/create" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/tasks" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/updates" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/salesman/reports" element={
            <ProtectedRoute>
              <SalesmanManagement />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <LeadManagement />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to={isSubUser ? "/sub-user" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
