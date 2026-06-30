import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, DollarSign, Database, FlaskConical } from 'lucide-react';
import './BacktestResults.css';

function BacktestResults({ data, symbol, stockName, strategy, years, initialCapital }) {
  const canvasRef = useRef(null);

  // Format currency in USD
  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Backend now returns totalProfit/Loss as actual INR amounts
  // Also supports legacy format where they may come from data.netProfit etc.
  const netProfit = data.netProfit !== undefined ? data.netProfit : (data.totalProfit - data.totalLoss);
  const finalCapital = data.finalCapital !== undefined ? data.finalCapital : (initialCapital + netProfit);
  const roi = data.roi !== undefined ? parseFloat(data.roi).toFixed(1) : ((netProfit / initialCapital) * 100).toFixed(1);
  const profitFactor = data.profitFactor !== undefined
    ? parseFloat(data.profitFactor).toFixed(2)
    : (data.totalLoss > 0 ? (data.totalProfit / data.totalLoss).toFixed(2) : '∞');
  const avgProfitPerTrade = data.avgProfitPerTrade !== undefined
    ? data.avgProfitPerTrade
    : (data.totalTrades > 0 ? (netProfit / data.totalTrades).toFixed(0) : 0);

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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw equity curve
    const isProfitable = equityCurve[equityCurve.length - 1] > equityCurve[0];
    ctx.strokeStyle = isProfitable ? '#10b981' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();

    equityCurve.forEach((val, idx) => {
      const x = (idx / equityCurve.length) * width;
      const y = height - ((val - minVal) / range) * height * 0.8 - height * 0.1;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, isProfitable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    fillGradient.addColorStop(1, isProfitable ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)');
    ctx.fillStyle = fillGradient;
    ctx.fill();
  }, [data]);

  return (
    <div className="backtest-results-container">
      {/* Results Header */}
      <div className="results-header">
        <div className="header-main">
          <h2>
            <span className="stock-symbol">{symbol}</span>
            <span className="stock-name">{stockName}</span>
          </h2>
          <div className="strategy-badge">
            <Target size={14} />
            {strategy}
          </div>
        </div>
        <div className="header-meta">
          <span className="meta-item">
            <Calendar size={14} />
            {years} Years
          </span>
          <span className="meta-item">
            <DollarSign size={14} />
            Initial: {formatUSD(initialCapital)}
          </span>
          {data.dataSource && (
            <span className={`meta-item meta-datasource ${data.engineUsed === 'python' ? 'real' : 'mock'}`}>
              {data.engineUsed === 'python' ? <Database size={13} /> : <FlaskConical size={13} />}
              {data.dataSource}
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="key-metric primary">
          <div className="key-label">Final Capital</div>
          <div className={`key-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            {formatUSD(finalCapital)}
          </div>
          <div className={`key-change ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            {netProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {netProfit >= 0 ? '+' : ''}{roi}% ROI
          </div>
        </div>

        <div className="key-metric secondary">
          <div className="key-label">Net Profit/Loss</div>
          <div className={`key-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            {netProfit >= 0 ? '+' : ''}{formatUSD(netProfit)}
          </div>
        </div>

        <div className="key-metric secondary">
          <div className="key-label">Win Rate</div>
          <div className="key-value">{data.winRate}%</div>
          <div className="key-sublabel">{data.totalTrades} trades</div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="detailed-metrics">
        <div className="metric-card">
          <div className="metric-label">Total Profit</div>
          <div className="metric-value positive">+{formatUSD(data.totalProfit)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Loss</div>
          <div className="metric-value negative">-{formatUSD(data.totalLoss)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Profit Factor</div>
          <div className="metric-value">{profitFactor}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Max Drawdown</div>
          <div className="metric-value negative">{data.maxDrawdown}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Sharpe Ratio</div>
          <div className="metric-value">{data.sharpeRatio.toFixed(2)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Profit/Trade</div>
          <div className={`metric-value ${avgProfitPerTrade >= 0 ? 'positive' : 'negative'}`}>
            {avgProfitPerTrade >= 0 ? '+' : ''}{formatUSD(avgProfitPerTrade)}
          </div>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <h3>Equity Curve</h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: netProfit >= 0 ? '#10b981' : '#ef4444' }}></span>
              Portfolio Value
            </span>
          </div>
        </div>
        <div className="chart-wrapper">
          <canvas ref={canvasRef} style={{ width: '100%', height: '300px' }} />
        </div>
      </div>

      {/* Trade History */}
      <div className="trades-container">
        <div className="trades-header">
          <h3>Trade History</h3>
          <span className="trades-count">Last {Math.min(data.trades.length, 10)} of {data.totalTrades} trades</span>
        </div>
        <div className="trades-table">
          <div className="table-header">
            <div className="col-date">Date</div>
            <div className="col-type">Type</div>
            <div className="col-price">Price</div>
            <div className="col-pnl">P&L</div>
          </div>
          {data.trades.slice(0, 10).map((trade, idx) => {
            const tradeDate = trade.date
              ? new Date(trade.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A';
            const pnlPct = trade.pnlPercent !== undefined ? trade.pnlPercent : trade.pnl;
            return (
              <div key={idx} className={`trade-row ${pnlPct >= 0 ? 'profit' : 'loss'}`}>
                <div className="col-date">{tradeDate}</div>
                <div className="col-type">
                  <span className={`type-badge ${trade.type.toLowerCase()}`}>
                    {trade.type}
                  </span>
                </div>
                <div className="col-price">{formatUSD(trade.price)}</div>
                <div className={`col-pnl ${pnlPct >= 0 ? 'positive' : 'negative'}`}>
                  {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategy Notes */}
      <div className="strategy-notes">
        <h4>Strategy Notes</h4>
        <ul>
          <li>Transaction costs (brokerage + taxes) of 0.5% per trade included</li>
          <li>Results are based on historical data and may not reflect future performance</li>
          <li>Slippage of 0.1% applied to all trades</li>
          <li>Strategy tested on historical market data</li>
        </ul>
      </div>
    </div>
  );
}

export default BacktestResults;
