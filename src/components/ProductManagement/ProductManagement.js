import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  Github, 
  ExternalLink, 
  Code, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Wrench,
  DollarSign,
  Clock,
  FileText,
  Play,
  User,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import Modal from '../Modal/Modal';
import ProductForm from './ProductForm';
import axios from 'axios';
import './ProductManagement.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ 
    type: 'info', 
    title: '', 
    message: '', 
    confirmText: 'OK',
    showCancel: false,
    onConfirm: null
  });

  // Get auth token
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/products`, { headers: authHeaders });
      const productsData = response.data?.products || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to load products. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormSubmit = useCallback(async (formData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const response = await axios.put(`${API_BASE}/products/${editingProduct.id}`, formData, { headers: authHeaders });
        if (response.status === 200) {
          setProducts(prev => prev.map(product => 
            product.id === editingProduct.id 
              ? response.data.product
              : product
          ));
          setModalData({
            type: 'success',
            title: 'Product Updated',
            message: 'Product has been updated successfully.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        }
        setEditingProduct(null);
      } else {
        // Add new product
        const response = await axios.post(`${API_BASE}/products`, formData, { headers: authHeaders });
        if (response.status === 201) {
          setProducts(prev => [...prev, response.data.product]);
          setModalData({
            type: 'success',
            title: 'Product Added',
            message: 'Product has been added successfully.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        }
      }
      setShowModal(true);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to save product. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    }
  }, [editingProduct, authHeaders]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = (productId) => {
    setModalData({
      type: 'confirm',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await axios.delete(`${API_BASE}/products/${productId}`, { headers: authHeaders });
          if (response.status === 200) {
            setProducts(prev => prev.filter(product => product.id !== productId));
            setModalData({
              type: 'success',
              title: 'Deleted Successfully',
              message: 'Product has been deleted successfully.',
              confirmText: 'OK',
              showCancel: false,
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Failed to delete product:', error);
          setModalData({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete product. Please try again.',
            confirmText: 'OK',
            showCancel: false,
            onConfirm: null
          });
        }
        setShowModal(true);
      }
    });
    setShowModal(true);
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE}/products/${productId}`, 
        { status: newStatus }, 
        { headers: authHeaders }
      );
      if (response.status === 200) {
        setProducts(prev => prev.map(product => 
          product.id === productId 
            ? response.data.product
            : product
        ));
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to update product status. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    }
  };

  const handleFormClose = useCallback(() => {
    setShowAddForm(false);
    setEditingProduct(null);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working': return <CheckCircle className="status-icon working" />;
      case 'under_maintenance': return <Wrench className="status-icon maintenance" />;
      case 'rejected': return <XCircle className="status-icon rejected" />;
      default: return <AlertCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return 'status-working';
      case 'under_maintenance': return 'status-maintenance';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  const filterProductsByStatus = (status) => {
    return products.filter(product => product.status === status);
  };

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-header">
        <div className="product-title">
          {getStatusIcon(product.status)}
          <h3>{product.name}</h3>
        </div>
        <div className="product-actions">
          <button 
            className="action-btn edit-btn" 
            onClick={() => handleEdit(product)}
            title="Edit Product"
          >
            <Edit size={12} />
          </button>
          <button 
            className="action-btn delete-btn" 
            onClick={() => handleDelete(product.id)}
            title="Delete Product"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      <div className="product-details">
        <div className="detail-item">
          <FileText size={12} className="detail-icon" />
          <span className="detail-text">{product.description}</span>
        </div>
        <div className="detail-item">
          <DollarSign size={12} className="detail-icon" />
          <span className="detail-text">{product.price}</span>
        </div>
        <div className="detail-item">
          <Clock size={12} className="detail-icon" />
          <span className="detail-text">{product.delivery_timeline}</span>
        </div>
        <div className="detail-item">
          <User size={12} className="detail-icon" />
          <span className="detail-text">{product.admin_name}</span>
        </div>
        <div className="detail-item">
          <Code size={12} className="detail-icon" />
          <span className="technologies">{product.technologies}</span>
        </div>
        <div className="detail-item">
          <Github size={12} className="detail-icon" />
          <a href={product.github_link} target="_blank" rel="noopener noreferrer" className="detail-link">
            GitHub Repository
          </a>
        </div>
        <div className="detail-item">
          <ExternalLink size={12} className="detail-icon" />
          <a href={product.preview_link} target="_blank" rel="noopener noreferrer" className="detail-link">
            Live Preview
          </a>
        </div>
        {product.ppt_link && (
          <div className="detail-item">
            <FileText size={12} className="detail-icon" />
            <a href={product.ppt_link} target="_blank" rel="noopener noreferrer" className="detail-link">
              PPT Presentation
            </a>
          </div>
        )}
        {product.demo_video_link && (
          <div className="detail-item">
            <Play size={12} className="detail-icon" />
            <a href={product.demo_video_link} target="_blank" rel="noopener noreferrer" className="detail-link">
              Demo Video
            </a>
          </div>
        )}
        {product.conversation_flow_link && (
          <div className="detail-item">
            <MessageSquare size={12} className="detail-icon" />
            <a href={product.conversation_flow_link} target="_blank" rel="noopener noreferrer" className="detail-link">
              Conversation Flow
            </a>
          </div>
        )}
      </div>
      
      <div className="product-footer">
        <span className={`status-badge ${getStatusColor(product.status)}`}>
          {product.status.replace('_', ' ').toUpperCase()}
        </span>
        <span className="created-date">Created: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</span>
      </div>
    </div>
  );


  const ProductSection = ({ title, products, status, showStatusChange = false }) => (
    <div className="product-section">
      <div className="section-header">
        <h2>{title}</h2>
        <span className="product-count">{products.length} products</span>
      </div>
      
      {products.length === 0 ? (
        <div className="empty-state">
          <Package size={32} className="empty-icon" />
          <p>No {status.replace('_', ' ')} products found</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card-wrapper">
              <ProductCard product={product} />
              {showStatusChange && product.status === 'under_maintenance' && (
                <div className="status-change-actions">
                  <button 
                    className="btn-success"
                    onClick={() => handleStatusChange(product.id, 'working')}
                  >
                    <CheckCircle size={12} />
                    Move to Working
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="product-management">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Product Management</h1>
          <p className="dashboard-subtitle">Manage your product portfolio and track development status</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn-secondary"
            onClick={fetchProducts}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="btn-primary add-product-btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} />
            Add New Product
          </button>
        </div>
      </div>

      <div className="product-management-content">
        <ProductSection 
          title="Working Products" 
          products={filterProductsByStatus('working')} 
          status="working"
        />
        
        <ProductSection 
          title="Under Maintenance" 
          products={filterProductsByStatus('under_maintenance')} 
          status="under_maintenance"
          showStatusChange={true}
        />
        
        <ProductSection 
          title="Rejected Products" 
          products={filterProductsByStatus('rejected')} 
          status="rejected"
        />
      </div>

      {showAddForm && (
        <ProductForm
          editingProduct={editingProduct}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={editingProduct ? {
            name: editingProduct.name,
            githubLink: editingProduct.github_link,
            previewLink: editingProduct.preview_link,
            technologies: editingProduct.technologies,
            description: editingProduct.description || '',
            price: editingProduct.price || '',
            deliveryTimeline: editingProduct.delivery_timeline || '',
            pptLink: editingProduct.ppt_link || '',
            demoVideoLink: editingProduct.demo_video_link || '',
            adminName: editingProduct.admin_name || '',
            conversationFlowLink: editingProduct.conversation_flow_link || '',
            status: editingProduct.status || 'working'
          } : { 
            name: '', 
            githubLink: '', 
            previewLink: '', 
            technologies: '',
            description: '',
            price: '',
            deliveryTimeline: '',
            pptLink: '',
            demoVideoLink: '',
            adminName: '',
            conversationFlowLink: '',
            status: 'working'
          }}
        />
      )}

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

export default ProductManagement;
