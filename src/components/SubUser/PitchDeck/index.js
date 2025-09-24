import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Package, 
  Github, 
  ExternalLink, 
  Code, 
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
import axios from 'axios';
import './PitchDeck.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SubUserPitchDeck = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

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
      // If API fails, show empty state
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
          <ExternalLink size={12} className="detail-icon" />
          <a href={product.preview_link} target="_blank" rel="noopener noreferrer" className="detail-link">
            Preview
          </a>
        </div>
        {product.ppt_link && (
          <div className="detail-item">
            <FileText size={12} className="detail-icon" />
            <a href={product.ppt_link} target="_blank" rel="noopener noreferrer" className="detail-link">
              Presentation
            </a>
          </div>
        )}
        {product.demo_video_link && (
          <div className="detail-item">
            <Play size={12} className="detail-icon" />
            <a href={product.demo_video_link} target="_blank" rel="noopener noreferrer" className="detail-link">
              Demo
            </a>
          </div>
        )}
        {product.conversation_flow_link && (
          <div className="detail-item">
            <MessageSquare size={12} className="detail-icon" />
            <a href={product.conversation_flow_link} target="_blank" rel="noopener noreferrer" className="detail-link">
              Flow
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

  const ProductSection = ({ title, products, status }) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="product-management">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Product Portfolio</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Product Portfolio</h1>
          {/* <p className="dashboard-subtitle">View products and development status</p> */}
        </div>
        <button 
          className="btn-primary"
          onClick={fetchProducts}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="product-management-content">
        <ProductSection 
          title="Active" 
          products={filterProductsByStatus('working')} 
          status="working"
        />
        
        <ProductSection 
          title="Maintenance" 
          products={filterProductsByStatus('under_maintenance')} 
          status="under_maintenance"
        />
        
        <ProductSection 
          title="Archived" 
          products={filterProductsByStatus('rejected')} 
          status="rejected"
        />
      </div>
    </div>
  );
};

export default SubUserPitchDeck;