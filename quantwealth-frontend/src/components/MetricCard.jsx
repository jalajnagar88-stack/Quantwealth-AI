import React from 'react';
import './MetricCard.css';

function MetricCard({ label, value, change }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-change">{change}</div>
    </div>
  );
}

export default MetricCard;
