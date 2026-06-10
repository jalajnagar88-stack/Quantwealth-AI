import React, { useState } from 'react';
import './ReasoningChain.css';

function ReasoningChain() {
  const [selectedSignal] = useState('TCS');

  const reasoning = {
    TCS: {
      signal: 'BUY',
      confidence: 85,
      factors: [
        { label: 'RSI = 24', status: 'OVERSOLD', score: 95, color: '#10b981' },
        { label: 'Sentiment = 76/100', status: 'BULLISH', score: 90, color: '#10b981' },
        { label: 'Volume = 8.5x', status: 'SPIKE', score: 88, color: '#10b981' },
        { label: 'MACD = Bullish Cross', status: 'POSITIVE', score: 85, color: '#10b981' }
      ]
    }
  };

  const data = reasoning[selectedSignal];

  return (
    <div className="reasoning-container">
      <h2>Claude AI Reasoning Chain</h2>
      <div className="reasoning-card">
        <div className="signal-header">
          <div className={`signal-badge ${data.signal.toLowerCase()}`}>{data.signal}</div>
          <div className="confidence-display">
            <span className="confidence-label">AI Confidence</span>
            <span className="confidence-value">{data.confidence}%</span>
          </div>
        </div>

        <div className="reasoning-chain">
          {data.factors.map((factor, idx) => (
            <div key={idx} className="reasoning-step">
              <div className="step-number">{idx + 1}</div>
              <div className="step-content">
                <div className="step-label">{factor.label}</div>
                <div className="step-status">{factor.status}</div>
              </div>
              <div className="step-bar">
                <div
                  className="step-fill"
                  style={{
                    width: `${factor.score}%`,
                    backgroundColor: factor.color
                  }}
                ></div>
              </div>
              <div className="step-score">{factor.score}%</div>
            </div>
          ))}
        </div>

        <div className="reasoning-footer">
          <div className="final-decision">
            <span>Final Decision:</span>
            <strong style={{ color: '#10b981' }}>Strong Buy Signal</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReasoningChain;
