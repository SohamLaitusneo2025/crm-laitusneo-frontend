import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Calendar, BarChart3, List, Target, User, Package } from 'lucide-react';
import DealsPipeline from './DealsPipeline';
import TaskUpdateForm from './TaskUpdateForm';
import dataService from '../../../services/dataService';
import './TaskManagement.css';

const SubUserTaskManagement = () => {
  const [activeView, setActiveView] = useState('pipeline'); // 'pipeline' or 'tasks'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Fetch tasks on component mount
  useEffect(() => {
    if (activeView === 'tasks') {
      fetchTasks();
    }
  }, [activeView]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await dataService.getSalesmanTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (taskId, currentQuantity) => {
    try {
      const result = await dataService.updateTaskProgress(taskId, currentQuantity);
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...result.task }
          : task
      ));
      
      setSelectedTask(null);
    } catch (err) {
      setError('Failed to update task progress');
      console.error('Error updating task progress:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'pending': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', class: 'pending' },
      'in_progress': { label: 'In Progress', class: 'in-progress' },
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

  const filterTasks = (tasks, status) => {
    if (status === 'all') return tasks;
    
    const statusMap = {
      'pending': 'pending',
      'in_progress': 'in_progress', 
      'completed': 'completed'
    };
    
    return tasks.filter(task => task.status === statusMap[status]);
  };

  const sortTasks = (tasks, sortBy) => {
    const sortedTasks = [...tasks];
    
    switch (sortBy) {
      case 'dueDate':
        return sortedTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      case 'priority':
        // Assuming priority is based on days until due (closer = higher priority)
        return sortedTasks.sort((a, b) => {
          const daysA = getDaysUntilDue(a.due_date);
          const daysB = getDaysUntilDue(b.due_date);
          return daysA - daysB;
        });
      case 'status':
        const statusOrder = { 'pending': 1, 'in_progress': 2, 'completed': 3 };
        return sortedTasks.sort((a, b) => {
          const orderA = statusOrder[a.status] || 0;
          const orderB = statusOrder[b.status] || 0;
          return orderA - orderB;
        });
      default:
        return sortedTasks;
    }
  };

  const getFilteredAndSortedTasks = () => {
    const filtered = filterTasks(tasks, filterStatus);
    return sortTasks(filtered, sortBy);
  };

  const renderTasksView = () => (
    <>
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="task-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Tasks
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>
        <div className="view-options">
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {getFilteredAndSortedTasks().map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            const daysUntilDue = getDaysUntilDue(task.due_date);
            const isOverdue = daysUntilDue < 0;
            const progress = calculateProgress(task.current_quantity, task.target_quantity);
            
            return (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div className="task-title">{task.title}</div>
                  <div className="task-actions">
                    {getStatusBadge(isOverdue ? 'overdue' : task.status)}
                  </div>
                </div>
                
                <div className="task-description">{task.description}</div>
                
                <div className="task-info">
                  <div className="salesman-info">
                    <Package size={14} />
                    <span>{task.product_name}</span>
                  </div>
                  <div className="product-info">
                    <User size={14} />
                    <span>Assigned by: {task.assigned_by_name}</span>
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
                    Progress: {progress}% ({task.current_quantity}/{task.target_quantity})
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="task-footer">
                  <div className="task-buttons">
                    <button 
                      className="task-btn secondary"
                      onClick={() => setSelectedTask(task)}
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {getFilteredAndSortedTasks().length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">
            <CheckCircle size={48} />
          </div>
          <h3>No tasks found</h3>
          <p>
            {filterStatus === 'all' 
              ? "You don't have any tasks assigned yet."
              : `No ${filterStatus.replace('_', ' ')} tasks found.`
            }
          </p>
        </div>
      )}

      {selectedTask && (
        <TaskUpdateForm
          task={selectedTask}
          onSave={handleUpdateProgress}
          onCancel={() => setSelectedTask(null)}
        />
      )}
    </>
  );

  return (
    <div className="sub-user-task-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Task Management</h1>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
            >
              <BarChart3 size={18} />
              Deals Pipeline
            </button>
            <button 
              className={`view-btn ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveView('tasks')}
            >
              <List size={18} />
              Tasks
            </button>
          </div>
          {activeView === 'tasks' && (
            <button className="add-task-btn" onClick={fetchTasks}>
              <Plus size={20} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {activeView === 'pipeline' ? <DealsPipeline /> : renderTasksView()}
    </div>
  );
};

export default SubUserTaskManagement;