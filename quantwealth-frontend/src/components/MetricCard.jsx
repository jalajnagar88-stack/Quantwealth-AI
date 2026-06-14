import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './MetricCard.css';

function MetricCard({ label, value, change, trend = 'neutral' }) {
  const icon = trend === 'up'
    ? <TrendingUp size={11} />
    : trend === 'down'
    ? <TrendingDown size={11} />
    : <Minus size={11} />;

  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={`metric-change metric-change--${trend}`}>
        {icon}{change}
      </div>
    </div>
  );
}

export default MetricCard;
