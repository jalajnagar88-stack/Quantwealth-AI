import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Trophy, History, 
  Package, DollarSign, Percent, Plus, Minus,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PaperTrading.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app';

const TRADING_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 45000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3200 },
  { symbol: 'HACD', name: 'HACD Token', price: 1250 },
  { symbol: 'HAC', name: 'HAC Token', price: 890 },
  { symbol: 'CARAT', name: 'Carat Token', price: 450 },
];

export default function PaperTrading() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [tradeModal, setTradeModal] = useState(null); // 'buy' or 'sell'
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [livePrice, setLivePrice] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_URL}/api/paper-trading${path}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      ...opts,
    });
    return res.json();
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await apiFetch('/portfolio');
      if (data.success) setPortfolio(data.data);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  }, [apiFetch]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await apiFetch('/transactions');
      if (data.success) setTransactions(data.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  }, [apiFetch]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await apiFetch('/leaderboard');
      if (data.success) setLeaderboard(data.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, [apiFetch]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPortfolio(), fetchTransactions(), fetchLeaderboard()]);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(fetchPortfolio, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchPortfolio, fetchTransactions, fetchLeaderboard]);

  const fetchLivePrice = async (symbol) => {
    const data = await apiFetch(`/price/${symbol}`);
    if (data.success) setLivePrice(data.data.price);
    else setLivePrice(null);
  };

  const openTradeModal = (type, symbol = '') => {
    setTradeModal(type);
    setSelectedStock(symbol);
    setQuantity(1);
    setLivePrice(null);
    setError('');
    if (symbol) fetchLivePrice(symbol);
  };

  const executeTrade = async () => {
    if (!selectedStock || quantity < 1) {
      setError('Please select stock and quantity');
      return;
    }
    setTradeLoading(true);
    setError('');

    const endpoint = tradeModal === 'buy' ? '/buy' : '/sell';
    const data = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ symbol: selectedStock, quantity }),
    });

    setTradeLoading(false);
    if (data.success) {
      setSuccess(`${tradeModal.toUpperCase()} executed: ${quantity} shares of ${selectedStock} @ ₹${data.price}`);
      setTradeModal(null);
      fetchPortfolio();
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.message || 'Trade failed');
    }
  };

  const resetPortfolio = async () => {
    const data = await apiFetch('/reset', { method: 'POST' });
    if (data.success) {
      setSuccess('Portfolio reset to $100,000');
      setResetConfirm(false);
      fetchPortfolio();
      fetchTransactions();
    }
  };

  const formatUSD = (n) => {
    if (n === undefined || n === null) return '$0';
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="paper-trading">
        <div className="pt-loading">
          <RefreshCw className="spin" size={32} />
          <p>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-trading">
      <div className="pt-header">
        <div className="pt-title">
          <Wallet size={28} />
          <div>
            <h1>Paper Trading</h1>
            <p>Practice with $100,000 virtual money</p>
          </div>
        </div>
        <div className="pt-actions">
          <button className="pt-btn pt-btn-buy" onClick={() => openTradeModal('buy')}>
            <Plus size={16} /> Buy
          </button>
          <button className="pt-btn pt-btn-sell" onClick={() => openTradeModal('sell')}>
            <Minus size={16} /> Sell
          </button>
          <button className="pt-btn pt-btn-reset" onClick={() => setResetConfirm(true)}>
            <RefreshCw size={16} /> Reset
          </button>
        </div>
      </div>

      {success && (
        <div className="pt-alert pt-alert-success">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="pt-summary">
          <div className="pt-card pt-card-total">
            <span className="pt-label">Total Value</span>
            <span className="pt-value">{formatUSD(portfolio.totalValue)}</span>
            <span className={`pt-change ${portfolio.totalPnL >= 0 ? 'positive' : 'negative'}`}>
              {portfolio.totalPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {portfolio.totalPnL >= 0 ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}%
            </span>
          </div>
          <div className="pt-card">
            <span className="pt-label">Cash Available</span>
            <span className="pt-value">{formatUSD(portfolio.cash)}</span>
          </div>
          <div className="pt-card">
            <span className="pt-label">Holdings Value</span>
            <span className="pt-value">{formatUSD(portfolio.holdingsValue)}</span>
          </div>
          <div className="pt-card">
            <span className="pt-label">P&L</span>
            <span className={`pt-value ${portfolio.totalPnL >= 0 ? 'positive' : 'negative'}`}>
              {portfolio.totalPnL >= 0 ? '+' : ''}{formatUSD(portfolio.totalPnL)}
            </span>
          </div>
          <div className="pt-card">
            <span className="pt-label">Win Rate</span>
            <span className="pt-value">{portfolio.winRate.toFixed(1)}%</span>
            <span className="pt-sub">{portfolio.winCount}W / {portfolio.lossCount}L</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="pt-tabs">
        <button className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}>
          <Package size={16} /> Holdings
        </button>
        <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>
          <History size={16} /> History
        </button>
        <button className={activeTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveTab('leaderboard')}>
          <Trophy size={16} /> Leaderboard
        </button>
      </div>

      {/* Holdings Tab */}
      {activeTab === 'portfolio' && (
        <div className="pt-holdings">
          {portfolio?.holdings?.length > 0 ? (
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Qty</th>
                  <th>Avg Price</th>
                  <th>Live Price</th>
                  <th>Current Value</th>
                  <th>P&L</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h) => (
                  <tr key={h.symbol}>
                    <td>
                      <strong>{h.symbol}</strong>
                    </td>
                    <td>{h.quantity}</td>
                    <td>${h.avgPrice.toFixed(2)}</td>
                    <td>${h.livePrice?.toFixed(2) || '-'}</td>
                    <td>{formatUSD(h.currentValue)}</td>
                    <td className={h.pnl >= 0 ? 'positive' : 'negative'}>
                      {h.pnl >= 0 ? '+' : ''}{formatUSD(h.pnl)} ({h.pnlPercent.toFixed(1)}%)
                    </td>
                    <td>
                      <button className="pt-btn-small" onClick={() => openTradeModal('sell', h.symbol)}>
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="pt-empty">
              <Package size={48} />
              <h3>No holdings yet</h3>
              <p>Start by buying some assets!</p>
              <button className="pt-btn pt-btn-buy" onClick={() => openTradeModal('buy')}>
                <Plus size={16} /> Buy Assets
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="pt-transactions">
          {transactions.length > 0 ? (
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                    <td>
                      <span className={`pt-badge ${t.type.toLowerCase()}`}>{t.type}</span>
                    </td>
                    <td><strong>{t.symbol}</strong></td>
                    <td>{t.quantity}</td>
                    <td>${t.price.toFixed(2)}</td>
                    <td>{formatUSD(t.total)}</td>
                    <td className={t.pnl > 0 ? 'positive' : t.pnl < 0 ? 'negative' : ''}>
                      {t.pnl ? `${t.pnl > 0 ? '+' : ''}${formatUSD(t.pnl)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="pt-empty">
              <History size={48} />
              <h3>No transactions yet</h3>
              <p>Your trade history will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="pt-leaderboard">
          <table className="pt-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Trader</th>
                <th>Portfolio Value</th>
                <th>P&L</th>
                <th>Trades</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((trader) => (
                <tr key={trader.userId} className={trader.userId === user?.id ? 'highlight' : ''}>
                  <td>
                    {trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : trader.rank}
                  </td>
                  <td>{trader.userId === user?.id ? 'You' : `Trader ${trader.userId.slice(-4)}`}</td>
                  <td>{formatUSD(trader.totalValue)}</td>
                  <td className={trader.totalPnL >= 0 ? 'positive' : 'negative'}>
                    {trader.totalPnL >= 0 ? '+' : ''}{formatUSD(trader.totalPnL)}
                  </td>
                  <td>{trader.tradeCount}</td>
                  <td>{trader.winRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trade Modal */}
      {tradeModal && (
        <div className="pt-modal-overlay" onClick={() => setTradeModal(null)}>
          <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{tradeModal === 'buy' ? 'Buy Assets' : 'Sell Assets'}</h3>
            {error && <div className="pt-error"><AlertCircle size={16} /> {error}</div>}
            
            <div className="pt-form-group">
              <label>Select Asset</label>
              <select 
                value={selectedStock} 
                onChange={(e) => {
                  setSelectedStock(e.target.value);
                  if (e.target.value) fetchLivePrice(e.target.value);
                }}
              >
                <option value="">Choose an asset...</option>
                {TRADING_ASSETS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name} (~${s.price})</option>
                ))}
              </select>
            </div>

            {livePrice && (
              <div className="pt-live-price">
                Live Price: <strong>${livePrice.toFixed(2)}</strong>
              </div>
            )}

            <div className="pt-form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            {livePrice && (
              <div className="pt-estimate">
                Estimated Total: <strong>{formatUSD(livePrice * quantity)}</strong>
              </div>
            )}

            <div className="pt-modal-actions">
              <button className="pt-btn" onClick={() => setTradeModal(null)}>Cancel</button>
              <button 
                className={`pt-btn ${tradeModal === 'buy' ? 'pt-btn-buy' : 'pt-btn-sell'}`}
                onClick={executeTrade}
                disabled={tradeLoading || !selectedStock}
              >
                {tradeLoading ? 'Processing...' : `${tradeModal === 'buy' ? 'Buy' : 'Sell'} ${quantity} units`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      {resetConfirm && (
        <div className="pt-modal-overlay" onClick={() => setResetConfirm(false)}>
          <div className="pt-modal pt-modal-confirm" onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={32} />
            <h3>Reset Portfolio?</h3>
            <p>This will reset your cash to $100,000 and clear all holdings & history.</p>
            <div className="pt-modal-actions">
              <button className="pt-btn" onClick={() => setResetConfirm(false)}>Cancel</button>
              <button className="pt-btn pt-btn-danger" onClick={resetPortfolio}>Yes, Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
