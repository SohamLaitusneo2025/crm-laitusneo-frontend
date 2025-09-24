import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'OK', 
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false,
  size = 'medium'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'confirm':
        return <Trash2 size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getIconColor = () => {
    return '#6b7280';
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container modal-${size}`}>
        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <div className="modal-icon" style={{ color: getIconColor() }}>
              {getIcon()}
            </div>
          </div>
          <div className="modal-header-content">
            {title && <h3 className="modal-title">{title}</h3>}
            {message && <p className="modal-message">{message}</p>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div className="modal-actions">
          {showCancel && (
            <button 
              className="modal-btn modal-btn-cancel" 
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-btn modal-btn-${type === 'confirm' ? 'confirm' : 'primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
