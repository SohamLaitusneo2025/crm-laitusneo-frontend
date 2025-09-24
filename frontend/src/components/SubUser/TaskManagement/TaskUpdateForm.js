import React, { useState } from 'react';
import { X } from 'lucide-react';
import './TaskManagement.css';

const TaskUpdateForm = ({ task, onSave, onCancel }) => {
  const [currentQuantity, setCurrentQuantity] = useState(task.current_quantity || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(task.id, currentQuantity);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = task.target_quantity > 0 
    ? Math.min(100, Math.round((currentQuantity / task.target_quantity) * 100))
    : 0;

  return (
    <div className="modal-overlay">
      <div className="task-update-modal">
        <div className="modal-header">
          <h3>Update Task Progress</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="task-info">
            <h4>{task.product_name}</h4>
            <p>{task.title}</p>
          </div>
          
          <div className="task-details">
            <div className="detail-row">
              <span className="label">Target:</span>
              <span className="value">{task.target_quantity}</span>
            </div>
            <div className="detail-row">
              <span className="label">Due Date:</span>
              <span className="value">{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Assigned By: Manager</span>
              <span className="value">{task.assigned_by_name}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="update-form">
            <div className="form-group">
              <label htmlFor="currentQuantity">
                Current Quantity
              </label>
              <input
                type="number"
                id="currentQuantity"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 0)}
                min="0"
                max={task.target_quantity}
                required
              />
              <div className="quantity-info">
                {currentQuantity}/{task.target_quantity} ({progress}%)
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="secondary-btn"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Progress'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskUpdateForm;