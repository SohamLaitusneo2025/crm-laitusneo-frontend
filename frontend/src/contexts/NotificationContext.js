import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success', duration = 4000, title = null) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration, title };
    
    setNotifications(prev => [...prev, notification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 4000, title = null) => {
    return addNotification(message, 'success', duration, title);
  }, [addNotification]);

  const showError = useCallback((message, duration = 5000, title = null) => {
    return addNotification(message, 'error', duration, title);
  }, [addNotification]);

  const showWarning = useCallback((message, duration = 4500, title = null) => {
    return addNotification(message, 'warning', duration, title);
  }, [addNotification]);

  const showInfo = useCallback((message, duration = 4000, title = null) => {
    return addNotification(message, 'info', duration, title);
  }, [addNotification]);

  const value = {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container">
        {notifications.map((notification, index) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            title={notification.title}
            onClose={() => removeNotification(notification.id)}
            style={{ top: `${10 + (index * 50)}px` }}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
