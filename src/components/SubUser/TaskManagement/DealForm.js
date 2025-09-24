import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './DealForm.css';

const DealForm = ({ deal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    mobile: '',
    email: '',
    productName: '',
    price: '',
    lastActivity: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (deal) {
      setFormData({
        clientName: deal.clientName || '',
        mobile: deal.mobile || '',
        email: deal.email || '',
        productName: deal.productName || '',
        price: deal.price || '',
        lastActivity: deal.lastActivity || new Date().toISOString().split('T')[0]
      });
    }
  }, [deal]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (!/^₹?[\d,]+(\.\d{2})?$/.test(formData.price)) {
      newErrors.price = 'Please enter a valid price (e.g., ₹1,00,000 or 100000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatPrice = (value) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    if (numericValue === '') return '';
    
    // Add rupee sign and format with Indian number system
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    return `₹${number.toLocaleString('en-IN')}`;
  };

  const handlePriceChange = (e) => {
    const formattedPrice = formatPrice(e.target.value);
    setFormData(prev => ({
      ...prev,
      price: formattedPrice
    }));

    if (errors.price) {
      setErrors(prev => ({
        ...prev,
        price: ''
      }));
    }
  };

  return (
    <div className="deal-form-overlay">
      <div className="deal-form-modal">
        <div className="form-header">
          <h3>{deal ? 'Edit Deal' : 'Add New Deal'}</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="deal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Client Name *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className={errors.clientName ? 'error' : ''}
                placeholder="Enter client name"
              />
              {errors.clientName && <span className="error-message">{errors.clientName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={errors.mobile ? 'error' : ''}
                placeholder="+1 234-567-8900"
              />
              {errors.mobile && <span className="error-message">{errors.mobile}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="client@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastActivity">Last Activity Date</label>
              <input
                type="date"
                id="lastActivity"
                name="lastActivity"
                value={formData.lastActivity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className={errors.productName ? 'error' : ''}
                placeholder="Enter product name"
              />
              {errors.productName && <span className="error-message">{errors.productName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                className={errors.price ? 'error' : ''}
                placeholder="₹1,00,000"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              <Save size={16} />
              {deal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealForm;
