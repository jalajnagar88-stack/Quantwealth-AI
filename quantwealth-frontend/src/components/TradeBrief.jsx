import React, { useState } from 'react';
import {
  Zap, TrendingUp, TrendingDown, ShieldCheck, Target,
  Clock, AlertTriangle, ChevronDown, ChevronUp, RefreshCw,
  BarChart2, DollarSign, Brain, ArrowRight
} from 'lucide-react';
import './TradeBrief.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app/api';

const CAPITAL_PRESETS = [50000, 100000, 250000, 500000, 1000000];
const RISK_PRESETS    = [1, 2, 3, 5, 10];

function formatINR(n) {
  if (!n && n !== 0) return '—';
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Number(n).toFixed(0)}`;
}

function ConvictionBadge({ level }) {
  return (
    <span className={`tb-conviction tb-conviction--${level.toLowerCase()}`}>
      {level === 'HIGH' ? '🔥' : '📊'} {level}
    </span>
  );
}

function SetupCard({ setup, index }) {
  const [expanded, setExpanded] = useState(false);
  const risk   = setup.entry - setup.stop_loss;
  const reward = setup.target - setup.entry;

  return (
    <div className={`tb-setup-card tb-setup-card--${setup.conviction.toLowerCase()}`}>

      {/* Header row */}
      <div className="tb-setup-header">
        <div className="tb-setup-left">
          <span className="tb-setup-rank">#{index + 1}</span>
          <div>
            <span className="tb-symbol">{setup.symbol}</span>
            <span className="tb-setup-name">{setup.setup_name}</span>
          </div>
        </div>
        <ConvictionBadge level={setup.conviction} />
      </div>

      {/* Key numbers */}
      <div className="tb-price-grid">
        <div className="tb-price-box tb-price-box--entry">
          <span className="tb-price-label">Entry Zone</span>
          <span className="tb-price-val">₹{setup.entry}</span>
        </div>
        <div className="tb-price-box tb-price-box--sl">
          <TrendingDown size={12}/>
          <span className="tb-price-label">Stop Loss</span>
          <span className="tb-price-val">₹{setup.stop_loss}</span>
          <span className="tb-price-sub">-₹{risk.toFixed(0)}/share</span>
        </div>
        <div className="tb-price-box tb-price-box--target">
          <TrendingUp size={12}/>
          <span className="tb-price-label">Target</span>
          <span className="tb-price-val">₹{setup.target}</span>
          <span className="tb-price-sub">+₹{reward.toFixed(0)}/share</span>
        </div>
        <div className="tb-price-box tb-price-box--rr">
          <span className="tb-price-label">R:R Ratio</span>
          <span className="tb-price-val tb-rr">1 : {setup.rr_ratio}</span>
        </div>
      </div>

      {/* Position sizing */}
      <div className="tb-sizing-row">
        <div className="tb-sizing-item">
          <BarChart2 size={12}/>
          <span>{setup.sizing.qty} shares</span>
        </div>
        <div className="tb-sizing-item">
          <DollarSign size={12}/>
          <span>{formatINR(setup.sizing.capital_used)} ({setup.sizing.capital_used_pct}% of capital)</span>
        </div>
        <div className="tb-sizing-item tb-sizing-item--risk">
          <AlertTriangle size={12}/>
          <span>Max loss: {formatINR(setup.sizing.risk_amount)} ({setup.sizing.risk_pct}%)</span>
        </div>
        <div className="tb-sizing-item tb-sizing-item--profit">
          <Target size={12}/>
          <span>Potential: +{formatINR(setup.potential_profit)}</span>
        </div>
      </div>

      {/* Win rate bar */}
      <div className="tb-winrate-row">
        <div className="tb-winrate-bar-wrap">
          <div className="tb-winrate-bar" style={{ width: `${setup.win_rate}%` }} />
        </div>
        <span className="tb-winrate-label">
          {setup.win_rate}% win rate · {setup.sample_trades} historical trades
        </span>
      </div>

      {/* AI Reasoning toggle */}
      {setup.ai_reasoning && (
        <>
          <button className="tb-reasoning-toggle" onClick={() => setExpanded(e => !e)}>
            <Brain size={13}/>
            AI Reasoning
            {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
          {expanded && (
            <div className="tb-reasoning-text">
              {setup.ai_reasoning}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TradeBrief() {
  const [capital,    setCapital]    = useState(100000);
  const [maxRisk,    setMaxRisk]    = useState(3);
  const [mode,       setMode]       = useState('swing');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/trade-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ capital, max_risk_pct: maxRisk, mode }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to generate brief');
      setResult(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRisk   = result?.setups?.reduce((s, x) => s + (x.sizing?.risk_amount || 0), 0) ?? 0;
  const totalProfit = result?.setups?.reduce((s, x) => s + (x.potential_profit   || 0), 0) ?? 0;

  return (
    <div className="tb-page">

      {/* ── Header ── */}
      <div className="tb-header">
        <div className="tb-header-left">
          <div className="tb-header-icon"><Zap size={22}/></div>
          <div>
            <h1 className="tb-title">Daily Trade Brief</h1>
            <p className="tb-subtitle">AI-powered setups with calculated risk — built for busy traders</p>
          </div>
        </div>
        <div className="tb-mode-toggle">
          <button
            className={`tb-mode-btn ${mode === 'intraday' ? 'active' : ''}`}
            onClick={() => setMode('intraday')}
          >
            <Clock size={13}/> Intraday
          </button>
          <button
            className={`tb-mode-btn ${mode === 'swing' ? 'active' : ''}`}
            onClick={() => setMode('swing')}
          >
            <TrendingUp size={13}/> Swing
          </button>
        </div>
      </div>

      {/* ── Config panel ── */}
      <div className="tb-config">

        <div className="tb-config-section">
          <label className="tb-config-label">Capital to Deploy</label>
          <div className="tb-capital-input">
            <span className="tb-currency">₹</span>
            <input
              type="number"
              value={capital}
              onChange={e => setCapital(Number(e.target.value) || 100000)}
              min={10000}
              step={10000}
            />
          </div>
          <div className="tb-presets">
            {CAPITAL_PRESETS.map(p => (
              <button
                key={p}
                className={capital === p ? 'active' : ''}
                onClick={() => setCapital(p)}
              >
                {formatINR(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-config-section">
          <label className="tb-config-label">
            <ShieldCheck size={13}/> Max Risk — {formatINR(capital * maxRisk / 100)} ({maxRisk}%)
          </label>
          <input
            className="tb-range"
            type="range"
            min={1} max={10} step={0.5}
            value={maxRisk}
            onChange={e => setMaxRisk(Number(e.target.value))}
          />
          <div className="tb-presets">
            {RISK_PRESETS.map(p => (
              <button
                key={p}
                className={maxRisk === p ? 'active' : ''}
                onClick={() => setMaxRisk(p)}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="tb-config-section tb-config-section--action">
          <div className="tb-summary-preview">
            <span>Scanning <strong>50 NSE stocks</strong></span>
            <span>Mode: <strong>{mode === 'swing' ? 'Swing (5–10 days)' : 'Intraday (same day)'}</strong></span>
            <span>Max loss: <strong>{formatINR(capital * maxRisk / 100)}</strong></span>
          </div>
          <button
            className="tb-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <><RefreshCw size={15} className="tb-spin"/> Scanning 50 stocks…</>
            ) : (
              <><Zap size={15}/> Generate My Trade Brief</>
            )}
          </button>
          {mode === 'intraday' && (
            <p className="tb-mode-note">
              ⚡ Intraday setups use 1-year data. Enter positions in your trading window, exit before 3:20pm.
            </p>
          )}
          {mode === 'swing' && (
            <p className="tb-mode-note">
              📈 Swing setups use 2-year data. Hold for 5–10 trading days, check once daily.
            </p>
          )}
        </div>

      </div>

      {/* ── Error ── */}
      {error && (
        <div className="tb-error">
          <AlertTriangle size={15}/> {error}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <>
          {result.setups.length === 0 ? (
            <div className="tb-no-setups">
              <BarChart2 size={32}/>
              <h3>No high-conviction setups today</h3>
              <p>{result.message || 'Markets may be in consolidation. Try switching to Swing mode or check back tomorrow.'}</p>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="tb-summary-bar">
                <div className="tb-summary-stat">
                  <span className="tb-summary-label">Setups Found</span>
                  <span className="tb-summary-val">{result.setups_found}</span>
                </div>
                <div className="tb-summary-stat">
                  <span className="tb-summary-label">Total Capital Needed</span>
                  <span className="tb-summary-val">
                    {formatINR(result.setups.reduce((s, x) => s + (x.sizing?.capital_used || 0), 0))}
                  </span>
                </div>
                <div className="tb-summary-stat tb-summary-stat--risk">
                  <span className="tb-summary-label">Total Risk</span>
                  <span className="tb-summary-val">{formatINR(totalRisk)}</span>
                </div>
                <div className="tb-summary-stat tb-summary-stat--profit">
                  <span className="tb-summary-label">Total Potential</span>
                  <span className="tb-summary-val">+{formatINR(totalProfit)}</span>
                </div>
                <div className="tb-summary-stat">
                  <span className="tb-summary-label">Portfolio R:R</span>
                  <span className="tb-summary-val">
                    1 : {totalRisk > 0 ? (totalProfit / totalRisk).toFixed(1) : '—'}
                  </span>
                </div>
              </div>

              {/* Setup cards */}
              <div className="tb-setups-list">
                {result.setups.map((setup, i) => (
                  <SetupCard key={setup.symbol} setup={setup} index={i}/>
                ))}
              </div>

              <p className="tb-disclaimer">
                ⚠️ These are AI-generated technical setups based on historical patterns. Past performance does not guarantee future results. Always use stop-losses. Not SEBI-registered investment advice.
              </p>
            </>
          )}
        </>
      )}

      {/* ── Empty state (before first run) ── */}
      {!result && !loading && !error && (
        <div className="tb-empty-state">
          <div className="tb-empty-icon"><Brain size={36}/></div>
          <h3>Your personalised trade brief, on demand</h3>
          <p>Set your capital and risk tolerance above, hit Generate — and get 2–3 ready-to-trade setups with AI reasoning, exact entry/SL/target, and position sizing calculated to your risk limit.</p>
          <div className="tb-feature-pills">
            <span>📊 50 NSE stocks scanned</span>
            <span>🤖 Gemini AI reasoning</span>
            <span>📐 Auto position sizing</span>
            <span>📈 5-year backtested win rates</span>
          </div>
        </div>
      )}

    </div>
  );
}
