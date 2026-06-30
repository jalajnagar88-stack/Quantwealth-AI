import React, { useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Bot } from 'lucide-react';
import './SignalsList.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app/api';

const NSE_STOCKS = [
  { symbol: 'TCS',        name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'INFY',       name: 'Infosys',                   sector: 'IT' },
  { symbol: 'RELIANCE',   name: 'Reliance Industries',       sector: 'Energy' },
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',                 sector: 'Banking' },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',                sector: 'Banking' },
  { symbol: 'SBIN',       name: 'State Bank of India',       sector: 'Banking' },
  { symbol: 'WIPRO',      name: 'Wipro',                     sector: 'IT' },
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',        sector: 'Pharma' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors',               sector: 'Auto' },
  { symbol: 'ITC',        name: 'ITC',                       sector: 'FMCG' },
];

function mockTechnicals(symbol) {
  const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
  const rsi  = 25 + (seed * 37) % 55;
  const macd = ((seed % 20) - 10) / 100;
  const vol  = (seed % 10) + 1;
  const sent = 30 + (seed * 13) % 50;
  const price = 500 + (seed * 73) % 4500;
  return { rsi: +rsi.toFixed(1), macd: +macd.toFixed(4), volumeAnomalyScore: vol, sentimentScore: sent, currentPrice: price };
}

const SIGNAL_COLORS = { BUY: 'buy', SELL: 'sell', SKIP: 'skip' };

function ConfidenceBar({ value }) {
  return (
    <div className="sl-conf-bar-wrap">
      <div className="sl-conf-bar" style={{ width: `${value}%` }} />
    </div>
  );
}

function SignalCard({ item, onGenerate, expanded, onToggle }) {
  const sig = item.signal;
  const cls = sig ? SIGNAL_COLORS[sig.signal] : null;

  return (
    <div className={`sl-card ${cls ? `sl-card--${cls}` : ''}`}>
      <div className="sl-card-top">
        <div className="sl-symbol-badge">{item.symbol.slice(0, 4)}</div>
        <div className="sl-card-info">
          <span className="sl-card-name">{item.name}</span>
          <span className="sl-card-sector">{item.sector}</span>
        </div>

        {sig ? (
          <>
            <div className="sl-card-right">
              <span className={`sl-badge sl-badge--${cls}`}>
                {cls === 'buy'  && <TrendingUp  size={12} />}
                {cls === 'sell' && <TrendingDown size={12} />}
                {cls === 'skip' && <Minus size={12} />}
                {sig.signal}
              </span>
              <span className="sl-conf-text">{sig.confidence}%</span>
            </div>
            <button className="sl-expand-btn" onClick={onToggle}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </>
        ) : (
          <button
            className="sl-gen-btn"
            onClick={() => onGenerate(item.symbol)}
            disabled={item.loading}
          >
            {item.loading
              ? <RefreshCw size={13} className="sl-spin" />
              : <><Zap size={13} /> Generate</>}
          </button>
        )}
      </div>

      {sig && <ConfidenceBar value={sig.confidence} />}

      {sig && expanded && (
        <div className="sl-reasoning">
          <Bot size={12} />
          <p>{sig.reasoning}</p>
        </div>
      )}

      {item.error && (
        <div className="sl-card-error"><AlertCircle size={12} />{item.error}</div>
      )}
    </div>
  );
}

function SignalsList() {
  const [stocks, setStocks] = useState(
    NSE_STOCKS.map(s => ({ ...s, signal: null, loading: false, error: null }))
  );
  const [expanded,   setExpanded]   = useState({});
  const [generating, setGenerating] = useState(false);

  const generateOne = useCallback(async (symbol) => {
    setStocks(prev => prev.map(s =>
      s.symbol === symbol ? { ...s, loading: true, error: null } : s
    ));
    try {
      const token = localStorage.getItem('token');
      const tech  = mockTechnicals(symbol);
      const res   = await fetch(`${API_URL}/signals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          symbol,
          currentPrice:   tech.currentPrice,
          technicalData:  { rsi: tech.rsi, macd: tech.macd, volumeAnomalyScore: tech.volumeAnomalyScore },
          sentimentScore: tech.sentimentScore,
          recentHistory:  []
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed');
      setStocks(prev => prev.map(s =>
        s.symbol === symbol ? { ...s, loading: false, signal: data.data } : s
      ));
    } catch (err) {
      setStocks(prev => prev.map(s =>
        s.symbol === symbol ? { ...s, loading: false, error: err.message } : s
      ));
    }
  }, []);

  const generateAll = useCallback(async () => {
    setGenerating(true);
    await Promise.all(NSE_STOCKS.map(s => generateOne(s.symbol)));
    setGenerating(false);
  }, [generateOne]);

  const toggleExpand = (symbol) =>
    setExpanded(prev => ({ ...prev, [symbol]: !prev[symbol] }));

  const generated = stocks.filter(s => s.signal).length;
  const buys  = stocks.filter(s => s.signal?.signal === 'BUY').length;
  const sells = stocks.filter(s => s.signal?.signal === 'SELL').length;

  return (
    <div className="sl-page">
      {/* Header */}
      <div className="sl-header">
        <div>
          <h1 className="sl-title">AI Trading Signals</h1>
          <p className="sl-subtitle">AI-generated signals using technical indicators for top NSE stocks</p>
        </div>
        <div className="sl-header-right">
          {generated > 0 && (
            <div className="sl-summary">
              <span className="sl-sum-item sl-sum--buy"><TrendingUp size={13} /> {buys} BUY</span>
              <span className="sl-sum-item sl-sum--sell"><TrendingDown size={13} /> {sells} SELL</span>
              <span className="sl-sum-item">{generated}/{stocks.length} generated</span>
            </div>
          )}
          <button
            className={`sl-gen-all-btn ${generating ? 'sl-gen-all-btn--loading' : ''}`}
            onClick={generateAll}
            disabled={generating}
          >
            <Zap size={14} />
            {generating ? 'Generating…' : 'Generate All'}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="sl-disclaimer">
        <AlertCircle size={13} />
        Signals use indicative technical inputs (RSI, MACD, volume). For live prices connect a broker. Not SEBI-registered investment advice.
      </div>

      {/* Grid */}
      <div className="sl-grid">
        {stocks.map(item => (
          <SignalCard
            key={item.symbol}
            item={item}
            onGenerate={generateOne}
            expanded={!!expanded[item.symbol]}
            onToggle={() => toggleExpand(item.symbol)}
          />
        ))}
      </div>
    </div>
  );
}

export default SignalsList;
