import React, { useState, useEffect } from 'react';
import { X, Save, Package, Github, ExternalLink, Code, FileText, DollarSign, Clock, User, MessageSquare, Play, Settings } from 'lucide-react';

const ProductForm = ({ 
  editingProduct, 
  onClose, 
  onSubmit, 
  initialData = { 
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
  }
}) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ 
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
    });
    onClose();
  };

  return (
    <div className="product-form-overlay" onClick={handleClose}>
      <div className="product-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <div className="modal-header-content">
            <div className="modal-icon">
              <Package size={24} />
            </div>
            <div>
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="modal-subtitle">Enter the product information to create a new product entry</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-sections">
            <div className="form-section">
              <h4 className="form-section-title">
                <Package size={18} />
                Basic Information
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <Package size={16} />
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description">
                    <FileText size={16} />
                    Product Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of the product"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">
                <Code size={18} />
                Technical Details
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="technologies">
                    <Code size={16} />
                    Technologies Used
                  </label>
                  <input
                    type="text"
                    id="technologies"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    required
                    placeholder="React, Node.js, MongoDB"
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="githubLink">
                    <Github size={16} />
                    GitHub Link
                  </label>
                  <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    required
                    placeholder="https://github.com/username/repository"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="previewLink">
                    <ExternalLink size={16} />
                    Preview Link
                  </label>
                  <input
                    type="url"
                    id="previewLink"
                    name="previewLink"
                    value={formData.previewLink}
                    onChange={handleInputChange}
                    required
                    placeholder="https://your-demo-site.com"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">
                <DollarSign size={18} />
                Business Information
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    <DollarSign size={16} />
                    Product Price
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., ₹15,000, ₹2,50,000, Free"
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="deliveryTimeline">
                    <Clock size={16} />
                    Delivery Timeline
                  </label>
                  <input
                    type="text"
                    id="deliveryTimeline"
                    name="deliveryTimeline"
                    value={formData.deliveryTimeline}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2-3 weeks, 1 month, 3-6 months"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adminName">
                    <User size={16} />
                    Admin Name
                  </label>
                  <input
                    type="text"
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    required
                    placeholder="Name of the product administrator"
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">
                    <Settings size={16} />
                    Product Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="working">Working</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">
                <Play size={18} />
                Documentation & Media
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pptLink">
                    <FileText size={16} />
                    PPT Link
                  </label>
                  <input
                    type="url"
                    id="pptLink"
                    name="pptLink"
                    value={formData.pptLink}
                    onChange={handleInputChange}
                    placeholder="https://docs.google.com/presentation/..."
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="demoVideoLink">
                    <Play size={16} />
                    Demo Video Link
                  </label>
                  <input
                    type="url"
                    id="demoVideoLink"
                    name="demoVideoLink"
                    value={formData.demoVideoLink}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="conversationFlowLink">
                    <MessageSquare size={16} />
                    Conversation Flow Link
                  </label>
                  <input
                    type="url"
                    id="conversationFlowLink"
                    name="conversationFlowLink"
                    value={formData.conversationFlowLink}
                    onChange={handleInputChange}
                    placeholder="https://miro.com/board/... or https://figma.com/file/..."
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={12} />
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
