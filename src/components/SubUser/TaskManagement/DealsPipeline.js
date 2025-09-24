import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Calendar, DollarSign, Package } from 'lucide-react';
import DealForm from './DealForm';
import dataService from '../../../services/dataService';
import './DealsPipeline.css';

const DealsPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dragOverColumn = useRef(null);
  const pipelineContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const pipelineColumns = [
    { id: 'New', title: 'New', color: '#3b82f6' },
    { id: 'Qualifying', title: 'Qualifying', color: '#8b5cf6' },
    { id: 'Demo Scheduled', title: 'Demo Scheduled', color: '#f59e0b' },
    { id: 'Pending Commitment', title: 'Pending Commitment', color: '#ef4444' },
    { id: 'In Negotiation', title: 'In Negotiation', color: '#f97316' },
    { id: 'WON', title: 'WON', color: '#10b981' },
    { id: 'LOST', title: 'LOST', color: '#6b7280' }
  ];

  // Load deals on component mount
  useEffect(() => {
    loadDeals();
  }, []);

  // Cleanup scroll interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const dealsData = await dataService.getDeals();
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    setEditingDeal(null);
    setShowForm(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await dataService.deleteDeal(dealId);
      setDeals(deals.filter(deal => deal.id !== dealId));
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError('Failed to delete deal. Please try again.');
    }
  };

  const handleSaveDeal = async (dealData) => {
    try {
      if (editingDeal) {
        const updatedDeal = await dataService.updateDeal(editingDeal.id, dealData);
        setDeals(deals.map(deal => 
          deal.id === editingDeal.id 
            ? { ...deal, ...updatedDeal.deal }
            : deal
        ));
      } else {
        const newDeal = await dataService.createDeal(dealData);
        setDeals([...deals, newDeal.deal]);
      }
      setShowForm(false);
      setEditingDeal(null);
    } catch (err) {
      console.error('Error saving deal:', err);
      setError('Failed to save deal. Please try again.');
    }
  };

  // Auto-scroll functionality with requestAnimationFrame for smoothness
  const stopAutoScroll = useCallback(() => {
    console.log('🛑 Stopping auto scroll');
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsAutoScrolling(false);
  }, []);

  const startAutoScroll = useCallback((direction) => {
    console.log('🚀 Starting smooth auto scroll:', direction);
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
    }

    setIsAutoScrolling(true);
    const scrollSpeed = 8; // Reduced for smoother motion
    let lastTime = 0;

    const animateScroll = (currentTime) => {
      if (!pipelineContainerRef.current) return;
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Only scroll every 16ms (60fps) for smoothness
      if (deltaTime >= 16) {
        const container = pipelineContainerRef.current;
        const scrollAmount = direction === 'left' ? -scrollSpeed : scrollSpeed;
        const oldScrollLeft = container.scrollLeft;
        
        // Use smooth scrolling
        container.scrollBy({
          left: scrollAmount,
          behavior: 'auto' // Use 'auto' for immediate response
        });
        
        // Check if we've reached the end
        if (direction === 'left' && container.scrollLeft <= 0) {
          container.scrollLeft = 0;
          stopAutoScroll();
          return;
        } else if (direction === 'right' && container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = container.scrollWidth - container.clientWidth;
          stopAutoScroll();
          return;
        }
        
        console.log(`📜 Smooth scrolling ${direction}: ${oldScrollLeft} -> ${container.scrollLeft}`);
      }
      
      // Continue animation
      scrollIntervalRef.current = requestAnimationFrame(animateScroll);
    };

    scrollIntervalRef.current = requestAnimationFrame(animateScroll);
  }, [stopAutoScroll]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !pipelineContainerRef.current) {
      return;
    }

    const container = pipelineContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    const scrollThreshold = 120; // Increased threshold for more responsive triggering

    // Check if mouse is near the left or right edge of the container
    const distanceFromLeft = mouseX - containerRect.left;
    const distanceFromRight = containerRect.right - mouseX;

    // More detailed debug logging
    const canScrollLeft = container.scrollLeft > 0;
    const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;

    // Reduced logging for better performance
    if (distanceFromLeft < scrollThreshold || distanceFromRight < scrollThreshold) {
      console.log('🖱️ Near edge:', {
        distanceFromLeft,
        distanceFromRight,
        threshold: scrollThreshold,
        canScrollLeft,
        canScrollRight
      });
    }

    if (distanceFromLeft < scrollThreshold && canScrollLeft) {
      // Scroll left
      if (!isAutoScrolling) {
        console.log('⬅️ Starting left scroll');
        startAutoScroll('left');
      }
    } else if (distanceFromRight < scrollThreshold && canScrollRight) {
      // Scroll right
      if (!isAutoScrolling) {
        console.log('➡️ Starting right scroll');
        startAutoScroll('right');
      }
    } else {
      // Stop scrolling if not near edges
      if (isAutoScrolling) {
        console.log('⏹️ Stopping auto scroll - not near edges');
        stopAutoScroll();
      }
    }
  }, [isDragging, isAutoScrolling, startAutoScroll, stopAutoScroll]);

  const handleDragStart = (e, deal) => {
    console.log('🎯 Drag start:', deal.id);
    setDraggedDeal(deal);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add global mouse move listener for auto-scroll
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    console.log('✅ Mouse move listener added');
    
    // Also add a drag over listener to the document to ensure we capture all mouse movements
    document.addEventListener('dragover', handleMouseMove, { passive: false });
  };

  const handleDragOver = (e) => {
    console.log('handleDragOver', e.dataTransfer);
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    dragOverColumn.current = columnId;
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    console.log('🎯 Drop:', draggedDeal?.id, 'into column:', columnId);
    if (draggedDeal && draggedDeal.status !== columnId) {
      try {
        await dataService.updateDealStatus(draggedDeal.id, columnId);
        setDeals(deals.map(deal => 
          deal.id === draggedDeal.id 
            ? { ...deal, status: columnId }
            : deal
        ));
      } catch (err) {
        console.error('Error updating deal status:', err);
        setError('Failed to update deal status. Please try again.');
      }
    }
    
    // Cleanup drag state and event listeners
    setDraggedDeal(null);
    setIsDragging(false);
    dragOverColumn.current = null;
    stopAutoScroll();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('dragover', handleMouseMove);
    console.log('✅ Drop cleanup completed');
  };

  const handleDragEnd = () => {
    console.log('🏁 Drag end');
    // Cleanup drag state and event listeners
    setDraggedDeal(null);
    setIsDragging(false);
    dragOverColumn.current = null;
    stopAutoScroll();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('dragover', handleMouseMove);
    console.log('✅ Mouse move listeners removed');
  };

  const getDealsByStatus = (status) => {
    return deals.filter(deal => deal.status === status);
  };

  const getTotalAmountByStatus = (status) => {
    const dealsInStatus = getDealsByStatus(status);
    return dealsInStatus.reduce((total, deal) => {
      // Remove ₹ and commas, then convert to number
      const amount = parseFloat(deal.price.replace(/[₹,]/g, ''));
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price || price === '0') return '₹0';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  if (loading) {
    return (
      <div className="deals-pipeline">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="deals-pipeline">
        <div className="pipeline-header">
          <div className="header-content">
            <h2>Deals Pipeline</h2>
            {error && <div className="error-message">{error}</div>}
          </div>
          <button className="add-deal-btn" onClick={handleAddDeal}>
            <Plus size={20} />
            Add Deal
          </button>
        </div>

        <div 
          className={`pipeline-container ${isDragging ? 'dragging' : ''} ${isAutoScrolling ? 'auto-scrolling' : ''}`}
          ref={pipelineContainerRef}
        >
          {pipelineColumns.map(column => (
            <div
              key={column.id}
              className={`pipeline-column ${dragOverColumn.current === column.id ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <div className="column-header-top">
                  <h3>{column.title}</h3>
                  <span className="deal-count">{getDealsByStatus(column.id).length}</span>
                </div>
                <div className="column-total">
                  Amount = {formatCurrency(getTotalAmountByStatus(column.id))}
                </div>
              </div>
              
              <div className="column-content">
                {getDealsByStatus(column.id).map(deal => (
                  <div
                    key={deal.id}
                    className="deal-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="deal-header">
                      <div className="client-info">
                        <h4 className="client-name">{deal.clientName}</h4>
                        {deal.fromLead && deal.leadId && (
                          <span className="lead-badge" title="Created from accepted lead">
                            {deal.leadId}
                          </span>
                        )}
                      </div>
                      <div className="deal-actions">
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditDeal(deal)}
                          title="Edit Deal"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteDeal(deal.id)}
                          title="Delete Deal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="deal-details">
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{deal.mobile}</span>
                      </div>
                      <div className="detail-item">
                        <Mail size={14} />
                        <span>{deal.email}</span>
                      </div>
                      <div className="detail-item">
                        <Package size={14} />
                        <span className="product-name">{deal.productName}</span>
                      </div>
                      <div className="detail-item">
                        <DollarSign size={14} />
                        <span className="price">{formatPrice(deal.price)}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={14} />
                        <span>Last: {formatDate(deal.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getDealsByStatus(column.id).length === 0 && (
                  <div className="empty-column">
                    <p>No deals in this stage</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <DealForm
          deal={editingDeal}
          onSave={handleSaveDeal}
          onCancel={() => {
            setShowForm(false);
            setEditingDeal(null);
          }}
        />
      )}
    </>
  );
};

export default DealsPipeline;
