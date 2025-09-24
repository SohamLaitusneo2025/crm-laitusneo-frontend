import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, User, Package, Target, Clock } from 'lucide-react';
import Modal from '../Modal/Modal';
import dataService from '../../services/dataService';
import './TaskAssignment.css';

const TaskAssignment = () => {
  const [formData, setFormData] = useState({
    salesmanId: '',
    productId: '',
    target: '',
    dueDate: '',
    description: ''
  });

  const [salesmen, setSalesmen] = useState([]);
  const [products, setProducts] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState({
    salesmen: false,
    products: false,
    tasks: false,
    submitting: false
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ 
    type: 'info', 
    title: '', 
    message: '', 
    confirmText: 'OK',
    showCancel: false,
    onConfirm: null
  });
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchSalesmen();
    fetchProducts();
    fetchAssignedTasks();
  }, []);

  const fetchSalesmen = async () => {
    setLoading(prev => ({ ...prev, salesmen: true }));
    try {
      const data = await dataService.getSalesmen();
      setSalesmen(data);
    } catch (err) {
      setError('Failed to load salesmen');
      console.error('Error fetching salesmen:', err);
    } finally {
      setLoading(prev => ({ ...prev, salesmen: false }));
    }
  };

  const fetchProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const data = await dataService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchAssignedTasks = async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const data = await dataService.getAssignedTasks();
      setAssignedTasks(data);
    } catch (err) {
      setError('Failed to load assigned tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));
    
    try {
      const taskData = {
        salesman_id: formData.salesmanId,
        product_id: formData.productId,
        target_quantity: parseInt(formData.target),
        due_date: formData.dueDate,
        title: products.find(p => p.id == formData.productId)?.name || 'Task',
        description: formData.description
      };

      const result = await dataService.assignTask(taskData);
      
      // Reset form
      setFormData({
        salesmanId: '',
        productId: '',
        target: '',
        dueDate: '',
        description: ''
      });
      
      // Refresh tasks list
      await fetchAssignedTasks();
      
      setModalData({
        type: 'success',
        title: 'Task Assigned',
        message: 'Task has been assigned successfully!',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } catch (err) {
      setModalData({
        type: 'error',
        title: 'Assignment Failed',
        message: err.message || 'Failed to assign task',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', class: 'pending' },
      'in-progress': { label: 'In Progress', class: 'in-progress' },
      completed: { label: 'Completed', class: 'completed' },
      overdue: { label: 'Overdue', class: 'overdue' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (current, target) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };


  const getFilteredTasks = () => {
    if (showCompletedTasks) {
      return assignedTasks.filter(task => task.status === 'completed');
    }
    return assignedTasks.filter(task => task.status !== 'completed');
  };

  const isFormValid = formData.salesmanId && formData.productId && formData.target && formData.dueDate;

  return (
    <div className="task-assignment">

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="assignment-content">
        <div className="assignment-form-section">
          <div className="form-header">
            <h3>Assign New Task</h3>
          </div>

          <form onSubmit={handleSubmit} className="assignment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salesmanId">
                  Select Salesman *
                </label>
                <select
                  id="salesmanId"
                  name="salesmanId"
                  value={formData.salesmanId}
                  onChange={handleInputChange}
                  required
                  disabled={loading.salesmen}
                >
                  <option value="">Choose a salesman...</option>
                  {salesmen
                    .filter(salesman => salesman.is_active)
                    .map(salesman => (
                      <option key={salesman.id} value={salesman.id}>
                        {salesman.first_name} {salesman.last_name} ({salesman.username})
                      </option>
                    ))}
                </select>
                {loading.salesmen && <span className="loading-text">Loading salesmen...</span>}
              </div>

              <div className="form-group">
                <label htmlFor="productId">
                  Select Product *
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  required
                  disabled={loading.products}
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {loading.products && <span className="loading-text">Loading products...</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="target">
                  Target Quantity *
                </label>
                <input
                  type="number"
                  id="target"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  placeholder="Enter target quantity"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Task Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description or special instructions..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={!isFormValid || loading.submitting}
                className="submit-btn"
              >
                <Save size={16} />
                {loading.submitting ? 'Assigning Task...' : 'Assign Task'}
              </button>
            </div>
          </form>
        </div>

        <div className="assigned-tasks-section">
          <div className="tasks-header">
            <div className="tasks-title-section">
              <h3>Assigned Tasks</h3>
              <span className="task-count">{getFilteredTasks().length} tasks</span>
            </div>
            <div className="tasks-toggle">
              <button 
                className={`toggle-btn ${!showCompletedTasks ? 'active' : ''}`}
                onClick={() => setShowCompletedTasks(false)}
              >
                Active Tasks
              </button>
              <button 
                className={`toggle-btn ${showCompletedTasks ? 'active' : ''}`}
                onClick={() => setShowCompletedTasks(true)}
              >
                Completed Tasks
              </button>
            </div>
          </div>

          {loading.tasks ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : (
            <div className="tasks-list">
              {getFilteredTasks().map((task) => {
                const daysUntilDue = getDaysUntilDue(task.due_date);
                const isOverdue = daysUntilDue < 0;
                const progress = calculateProgress(task.current_quantity, task.target_quantity);
                
                return (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <div className="task-id">#{task.task_id}</div>
                      {getStatusBadge(isOverdue ? 'overdue' : task.status)}
                    </div>
                    
                    <div className="task-content">
                      <div className="task-info">
                        <div className="salesman-info">
                          <User size={14} />
                          <span>{task.salesman_name}</span>
                        </div>
                        <div className="product-info">
                          <Package size={14} />
                          <span>{task.product_name}</span>
                        </div>
                      </div>
                      
                      <div className="task-metrics">
                        <div className="metric">
                          <Target size={14} />
                          <span>Target: {task.target_quantity}</span>
                        </div>
                        <div className="metric">
                          <Clock size={14} />
                          <span className={isOverdue ? 'overdue' : ''}>
                            {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="progress-section">
                        <div className="progress-label">
                          <span>Progress</span>
                          <span>{progress}% ({task.current_quantity}/{task.target_quantity})</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="task-meta">
                        <div className="assigned-date">
                          Assigned: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {getFilteredTasks().length === 0 && !loading.tasks && (
                <div className="empty-state">
                  <p>
                    {showCompletedTasks 
                      ? 'No completed tasks yet.' 
                      : 'No active tasks assigned yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Professional Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        showCancel={modalData.showCancel}
        onConfirm={modalData.onConfirm}
        size="medium"
      />
    </div>
  );
};

export default TaskAssignment;