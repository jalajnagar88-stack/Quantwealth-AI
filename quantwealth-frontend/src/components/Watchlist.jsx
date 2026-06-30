import React, { useState, useEffect, useCallback } from 'react';
import { Star, Plus, Trash2, Bell, BellOff, TrendingUp, TrendingDown, X, Briefcase } from 'lucide-react';
import './Watchlist.css';

const API = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app/api';

const getToken = () => localStorage.getItem('token');

const apiFetch = (path, opts = {}) =>
  fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    ...opts,
  }).then(r => r.json());

const NIFTY50 = [
  'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','HINDUNILVR','ITC','SBIN',
  'BHARTIARTL','KOTAKBANK','LT','AXISBANK','ASIANPAINT','MARUTI','TITAN',
  'SUNPHARMA','BAJFINANCE','WIPRO','ONGC','NTPC','POWERGRID','TATAMOTORS',
  'TATASTEEL','JSWSTEEL','TECHM','HCLTECH','DRREDDY','DIVISLAB','CIPLA',
  'EICHERMOT','HEROMOTOCO','BPCL','COALINDIA','NESTLEIND','BAJAJFINSV',
];

export default function Watchlist() {
  const [tab, setTab] = useState('watchlist');

  // — Watchlist state
  const [wlItems, setWlItems] = useState([]);
  const [wlInput, setWlInput] = useState('');
  const [wlLoading, setWlLoading] = useState(true);
  const [wlSuggestions, setWlSuggestions] = useState([]);

  // — Alerts state
  const [alerts, setAlerts] = useState([]);
  const [alertForm, setAlertForm] = useState({ symbol: '', targetPrice: '', condition: 'above', note: '' });
  const [alertLoading, setAlertLoading] = useState(true);

  // — Portfolio state
  const [holdings, setHoldings] = useState([]);
  const [holdForm, setHoldForm] = useState({ symbol: '', qty: '', avgPrice: '' });
  const [portLoading, setPortLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // Fetch all on mount
  useEffect(() => {
    apiFetch('/watchlist').then(d => { setWlItems(d.items || []); setWlLoading(false); });
    apiFetch('/alerts').then(d => { setAlerts(d.alerts || []); setAlertLoading(false); });
    apiFetch('/portfolio').then(d => { setHoldings(d.holdings || []); setPortLoading(false); });
  }, []);

  // Watchlist autocomplete
  const handleWlInput = (v) => {
    setWlInput(v);
    const q = v.toUpperCase();
    setWlSuggestions(q.length >= 1 ? NIFTY50.filter(s => s.startsWith(q)).slice(0, 6) : []);
  };

  const addToWatchlist = async (sym) => {
    const s = (sym || wlInput).toUpperCase().trim();
    if (!s) return;
    const d = await apiFetch('/watchlist', { method: 'POST', body: JSON.stringify({ symbol: s }) });
    if (d.error) return flash(d.error, true);
    setWlItems(d.items);
    setWlInput(''); setWlSuggestions([]);
    flash(`${s} added to watchlist`);
  };

  const removeFromWatchlist = async (sym) => {
    const d = await apiFetch(`/watchlist/${sym}`, { method: 'DELETE' });
    if (d.error) return flash(d.error, true);
    setWlItems(d.items);
    flash(`${sym} removed`);
  };

  // Alerts
  const createAlert = async () => {
    const { symbol, targetPrice, condition, note } = alertForm;
    if (!symbol || !targetPrice) return flash('Fill symbol and target price', true);
    const d = await apiFetch('/alerts', { method: 'POST', body: JSON.stringify({ symbol, targetPrice: parseFloat(targetPrice), condition, note }) });
    if (d.error) return flash(d.error, true);
    setAlerts(prev => [d.alert, ...prev]);
    setAlertForm({ symbol: '', targetPrice: '', condition: 'above', note: '' });
    flash(`Alert set for ${symbol.toUpperCase()}`);
  };

  const deleteAlert = async (id) => {
    await apiFetch(`/alerts/${id}`, { method: 'DELETE' });
    setAlerts(prev => prev.filter(a => a._id !== id));
    flash('Alert deleted');
  };

  // Portfolio
  const addHolding = async () => {
    const { symbol, qty, avgPrice } = holdForm;
    if (!symbol || !qty || !avgPrice) return flash('Fill all fields', true);
    const d = await apiFetch('/portfolio/holding', {
      method: 'POST',
      body: JSON.stringify({ symbol, qty: parseFloat(qty), avgPrice: parseFloat(avgPrice) })
    });
    if (d.error) return flash(d.error, true);
    setHoldings(d.holdings);
    setHoldForm({ symbol: '', qty: '', avgPrice: '' });
    flash(`${symbol.toUpperCase()} added`);
  };

  const removeHolding = async (sym) => {
    const d = await apiFetch(`/portfolio/holding/${sym}`, { method: 'DELETE' });
    if (d.error) return flash(d.error, true);
    setHoldings(d.holdings);
    flash(`${sym} removed`);
  };

  const totalInvested = holdings.reduce((s, h) => s + h.qty * h.avgPrice, 0);

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1>My Portfolio Hub</h1>
        <p>Track your watchlist, price alerts, and holdings in one place</p>
      </div>

      {(error || success) && (
        <div className={`wl-toast ${error ? 'wl-toast--err' : 'wl-toast--ok'}`}>
          {error || success}
        </div>
      )}

      <div className="wl-tabs">
        {[['watchlist','Watchlist'],['alerts','Price Alerts'],['portfolio','Portfolio']].map(([k,l]) => (
          <button key={k} className={`wl-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── WATCHLIST ── */}
      {tab === 'watchlist' && (
        <div className="wl-section">
          <div className="wl-add-row">
            <div className="wl-autocomplete">
              <input
                className="wl-input"
                placeholder="Search NSE symbol e.g. RELIANCE"
                value={wlInput}
                onChange={e => handleWlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addToWatchlist()}
              />
              {wlSuggestions.length > 0 && (
                <ul className="wl-suggestions">
                  {wlSuggestions.map(s => (
                    <li key={s} onClick={() => addToWatchlist(s)}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <button className="wl-btn-primary" onClick={() => addToWatchlist()}>
              <Plus size={16}/> Add
            </button>
          </div>

          {wlLoading ? <div className="wl-loading">Loading…</div> : wlItems.length === 0 ? (
            <div className="wl-empty">
              <Star size={40} strokeWidth={1.5}/>
              <p>No stocks yet. Search above to add.</p>
            </div>
          ) : (
            <div className="wl-list">
              {wlItems.map(item => (
                <div key={item.symbol} className="wl-item">
                  <div className="wl-item-sym">
                    <Star size={16} className="wl-star"/>
                    <span>{item.symbol}</span>
                    <span className="wl-item-ns">.NS</span>
                  </div>
                  <span className="wl-item-date">{new Date(item.addedAt).toLocaleDateString('en-IN')}</span>
                  <button className="wl-remove" onClick={() => removeFromWatchlist(item.symbol)}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS ── */}
      {tab === 'alerts' && (
        <div className="wl-section">
          <div className="wl-alert-form">
            <input className="wl-input" placeholder="Symbol" value={alertForm.symbol}
              onChange={e => setAlertForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
            <select className="wl-input wl-select" value={alertForm.condition}
              onChange={e => setAlertForm(p => ({ ...p, condition: e.target.value }))}>
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
            </select>
            <input className="wl-input" type="number" placeholder="Target price (₹)" value={alertForm.targetPrice}
              onChange={e => setAlertForm(p => ({ ...p, targetPrice: e.target.value }))} />
            <input className="wl-input" placeholder="Note (optional)" value={alertForm.note}
              onChange={e => setAlertForm(p => ({ ...p, note: e.target.value }))} />
            <button className="wl-btn-primary" onClick={createAlert}><Bell size={15}/> Set Alert</button>
          </div>

          {alertLoading ? <div className="wl-loading">Loading…</div> : alerts.length === 0 ? (
            <div className="wl-empty"><BellOff size={40} strokeWidth={1.5}/><p>No alerts set yet.</p></div>
          ) : (
            <div className="wl-list">
              {alerts.map(a => (
                <div key={a._id} className={`wl-item ${a.triggered ? 'triggered' : ''}`}>
                  <div className="wl-item-sym">
                    {a.condition === 'above' ? <TrendingUp size={16} className="up"/> : <TrendingDown size={16} className="down"/>}
                    <span>{a.symbol}</span>
                  </div>
                  <div className="wl-alert-meta">
                    <span className={`wl-cond ${a.condition}`}>{a.condition === 'above' ? '↑ Above' : '↓ Below'}</span>
                    <span className="wl-price">₹{a.targetPrice.toLocaleString('en-IN')}</span>
                    {a.note && <span className="wl-note">{a.note}</span>}
                    {a.triggered && <span className="wl-triggered-badge">✓ Triggered</span>}
                  </div>
                  <button className="wl-remove" onClick={() => deleteAlert(a._id)}><X size={15}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PORTFOLIO ── */}
      {tab === 'portfolio' && (
        <div className="wl-section">
          {holdings.length > 0 && (
            <div className="wl-port-summary">
              <div className="wl-port-stat">
                <span>Total Invested</span>
                <strong>₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
              </div>
              <div className="wl-port-stat">
                <span>Holdings</span>
                <strong>{holdings.length}</strong>
              </div>
            </div>
          )}

          <div className="wl-alert-form">
            <input className="wl-input" placeholder="Symbol e.g. TCS" value={holdForm.symbol}
              onChange={e => setHoldForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
            <input className="wl-input" type="number" placeholder="Qty" value={holdForm.qty}
              onChange={e => setHoldForm(p => ({ ...p, qty: e.target.value }))} />
            <input className="wl-input" type="number" placeholder="Avg buy price (₹)" value={holdForm.avgPrice}
              onChange={e => setHoldForm(p => ({ ...p, avgPrice: e.target.value }))} />
            <button className="wl-btn-primary" onClick={addHolding}><Plus size={15}/> Add Holding</button>
          </div>

          {portLoading ? <div className="wl-loading">Loading…</div> : holdings.length === 0 ? (
            <div className="wl-empty"><Briefcase size={40} strokeWidth={1.5}/><p>No holdings yet.</p></div>
          ) : (
            <div className="wl-port-table">
              <div className="wl-port-head">
                <span>Symbol</span><span>Qty</span><span>Avg Price</span><span>Invested</span><span></span>
              </div>
              {holdings.map(h => (
                <div key={h.symbol} className="wl-port-row">
                  <span className="wl-port-sym">{h.symbol}</span>
                  <span>{h.qty}</span>
                  <span>₹{h.avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <span>₹{(h.qty * h.avgPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <button className="wl-remove" onClick={() => removeHolding(h.symbol)}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
