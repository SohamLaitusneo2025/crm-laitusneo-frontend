import React from 'react';
import './MinimalCard.css';

const MinimalCard = ({ 
  title, 
  value, 
  icon: Icon,
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'minimal-card-blue',
    green: 'minimal-card-green',
    red: 'minimal-card-red'
  };

  const iconColorClasses = {
    blue: 'minimal-icon-blue',
    green: 'minimal-icon-green',
    red: 'minimal-icon-red'
  };

  return (
    <div className={`minimal-card ${colorClasses[color]}`}>
      <div className="minimal-icon">
        <Icon size={20} />
      </div>
      <div className="minimal-content">
        <h3 className="minimal-title">{title}</h3>
        <div className="minimal-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      </div>
    </div>
  );
};

export default MinimalCard;
