import React from 'react';
import './SignalsList.css';

function SignalsList() {
  const signals = [
    { symbol: 'TCS', name: 'Tata Consultancy', signal: 'BUY', confidence: 85, analysis: 'RSI=24 (oversold) • Sentiment=76/100 • Volume spike' },
    { symbol: 'INFY', name: 'Infosys Limited', signal: 'SELL', confidence: 72, analysis: 'RSI=72 (overbought) • MACD bearish • Sentiment=38/100' },
    { symbol: 'WIPRO', name: 'Wipro Limited', signal: 'BUY', confidence: 68, analysis: 'Golden Cross detected • Bullish divergence • Volume surge' }
  ];

  return (
    <div className="signals-container">
      <h2>AI-Generated Signals</h2>
      <div className="signals-list">
        {signals.map((signal, idx) => (
          <div key={idx} className={`signal-item signal-${signal.signal.toLowerCase()}`}>
            <div className="signal-left">
              <div className="signal-symbol">{signal.symbol}</div>
              <div>
                <div className="signal-name">{signal.name}</div>
                <div className="signal-analysis">{signal.analysis}</div>
              </div>
            </div>
            <div className="signal-right">
              <div className={`signal-badge ${signal.signal.toLowerCase()}`}>{signal.signal}</div>
              <div className="signal-confidence">Confidence: {signal.confidence}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SignalsList;
