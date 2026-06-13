import React, { useEffect, useRef } from 'react';
import './BacktestResults.css';

function BacktestResults({ data, symbol }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.equityCurve) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const equityCurve = data.equityCurve;
    const minVal = Math.min(...equityCurve);
    const maxVal = Math.max(...equityCurve);
    const range = maxVal - minVal;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();

    equityCurve.forEach((val, idx) => {
      const x = (idx / equityCurve.length) * width;
      const y = height - ((val - minVal) / range) * height * 0.8 - 20;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data]);

  return (
    <div className="backtest-results">
      <h2>Backtest Results - {symbol}</h2>

      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">Win Rate</div>
          <div className="metric-value">{data.winRate}%</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Profit</div>
          <div className="metric-value positive">${data.totalProfit.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Loss</div>
          <div className="metric-value negative">${data.totalLoss.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Trades</div>
          <div className="metric-value">{data.totalTrades}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Max Drawdown</div>
          <div className="metric-value negative">{data.maxDrawdown}%</div>
        </div>
        <div className="metric">
          <div className="metric-label">Sharpe Ratio</div>
          <div className="metric-value">{data.sharpeRatio.toFixed(2)}</div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Equity Curve</h3>
        <canvas ref={canvasRef} style={{ width: '100%', height: '300px' }} />
      </div>

      <div className="trades-section">
        <h3>Trade History</h3>
        <div className="trades-list">
          {data.trades.slice(0, 10).map((trade, idx) => (
            <div key={idx} className={`trade-item trade-${trade.type.toLowerCase()}`}>
              <div className="trade-date">{trade.date}</div>
              <div className="trade-type">{trade.type}</div>
              <div className="trade-price">${trade.price.toFixed(2)}</div>
              <div className="trade-pnl">{trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BacktestResults;
