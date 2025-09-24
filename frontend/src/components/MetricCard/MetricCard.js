import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './MetricCard.css';

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  trend, 
  icon: Icon,
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'metric-card-blue',
    green: 'metric-card-green',
    purple: 'metric-card-purple',
    orange: 'metric-card-orange',
    red: 'metric-card-red'
  };

  const iconColorClasses = {
    blue: 'metric-icon-blue',
    green: 'metric-icon-green',
    purple: 'metric-icon-purple',
    orange: 'metric-icon-orange',
    red: 'metric-icon-red'
  };

  return (
    <div className={`metric-card ${colorClasses[color]}`}>
      <div className="metric-card-header">
        <div className={`metric-icon ${iconColorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div className="metric-trend">
          {change && (
            <div className={`metric-change ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default MetricCard;
