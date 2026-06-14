import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart2, ShieldCheck, Newspaper, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MetricCard from './MetricCard';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_STATS = {
  totalBacktests: 0,
  avgWinRate: 0,
  avgRoi: 0,
  totalTrades: 0,
  totalProfit: 0,
};

function formatINR(n) {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function SkeletonCard() {
  return <div className="metric-card db-skeleton" />;
}

function RecentBacktest({ bt }) {
  const profit = bt.netProfit ?? 0;
  return (
    <div className="db-recent-row">
      <span className="db-recent-symbol">{bt.symbol}</span>
      <span className="db-recent-strategy">{bt.strategy}</span>
      <span className={`db-recent-pnl ${profit >= 0 ? 'pos' : 'neg'}`}>
        {profit >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {profit >= 0 ? '+' : ''}{formatINR(profit)}
      </span>
      <span className="db-recent-wr">{(bt.winRate ?? 0).toFixed(0)}% WR</span>
    </div>
  );
}

function NewsItem({ article }) {
  return (
    <a className="db-news-item" href={article.url} target="_blank" rel="noreferrer">
      <span className={`db-news-dot db-news-dot--${article.sentiment}`} />
      <span className="db-news-title">{article.title}</span>
      <span className="db-news-source">{article.source}</span>
    </a>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [recents,  setRecents]  = useState([]);
  const [news,     setNews]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/backtest/stats`,   { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${API_URL}/backtest/history?limit=5`, { headers: h }).then(r => r.json()).catch(() => null),
      fetch(`${API_URL}/news?limit=5`,    { headers: h }).then(r => r.json()).catch(() => null),
    ]).then(([statsRes, histRes, newsRes]) => {
      if (statsRes?.success)  setStats(statsRes.data.overall ?? EMPTY_STATS);
      if (histRes?.success)   setRecents(histRes.data.backtests ?? []);
      if (newsRes?.success)   setNews(newsRes.data.articles?.slice(0, 5) ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const s = stats ?? EMPTY_STATS;
  const netProfitSign = s.totalProfit >= 0 ? '+' : '';

  return (
    <div className="dashboard">

      {/* ── Welcome ── */}
      <div className="db-welcome">
        <div>
          <h1 className="db-welcome-title">Welcome back, {user?.firstName}</h1>
          <p className="db-welcome-sub">Here's your trading overview</p>
        </div>
        <Link to="/strategy-simulator" className="db-cta-btn">
          <Zap size={14} /> Run Backtest
        </Link>
      </div>

      {/* ── Metric cards ── */}
      <div className="metrics-grid">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              label="Total Backtests"
              value={s.totalBacktests ?? 0}
              change={s.totalBacktests > 0 ? 'Simulations run' : 'Run your first'}
              trend="neutral"
            />
            <MetricCard
              label="Avg Win Rate"
              value={s.totalBacktests > 0 ? `${(s.avgWinRate ?? 0).toFixed(1)}%` : '—'}
              change={s.avgWinRate >= 50 ? '+Above average' : s.totalBacktests > 0 ? 'Below average' : 'No data yet'}
              trend={s.avgWinRate >= 50 ? 'up' : 'down'}
            />
            <MetricCard
              label="Avg ROI"
              value={s.totalBacktests > 0 ? `${(s.avgRoi ?? 0).toFixed(1)}%` : '—'}
              change={s.avgRoi >= 0 ? 'Across all runs' : 'Needs improvement'}
              trend={s.avgRoi >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Total Simulated P&L"
              value={s.totalBacktests > 0 ? formatINR(s.totalProfit ?? 0) : '—'}
              change={s.totalProfit >= 0 ? `${netProfitSign}${(s.avgRoi ?? 0).toFixed(1)}% avg` : 'Net loss'}
              trend={s.totalProfit >= 0 ? 'up' : 'down'}
            />
          </>
        )}
      </div>

      {/* ── Bottom grid: Recent backtests + Live news ── */}
      <div className="db-bottom-grid">

        {/* Recent Backtests */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title"><BarChart2 size={15}/> Recent Backtests</span>
            <Link to="/strategy-simulator" className="db-card-link">New run <ArrowRight size={12}/></Link>
          </div>
          {loading ? (
            <div className="db-empty"><RefreshCw size={14} className="db-spin"/> Loading…</div>
          ) : recents.length === 0 ? (
            <div className="db-empty">
              No backtests yet —{' '}
              <Link to="/strategy-simulator">run your first simulation</Link>
            </div>
          ) : (
            <div className="db-recent-list">
              {recents.map((bt, i) => <RecentBacktest key={i} bt={bt}/>)}
            </div>
          )}
        </div>

        {/* Live News */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title"><Newspaper size={15}/> Market News</span>
            <Link to="/news-trends" className="db-card-link">All news <ArrowRight size={12}/></Link>
          </div>
          {loading ? (
            <div className="db-empty"><RefreshCw size={14} className="db-spin"/> Loading…</div>
          ) : news.length === 0 ? (
            <div className="db-empty">No news loaded yet</div>
          ) : (
            <div className="db-news-list">
              {news.map((a, i) => <NewsItem key={i} article={a}/>)}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title"><Zap size={15}/> Quick Actions</span>
          </div>
          <div className="db-quick-list">
            <Link to="/strategy-simulator" className="db-quick-item">
              <BarChart2 size={16}/>
              <div>
                <strong>Strategy Simulator</strong>
                <span>Backtest RSI, MACD, Breakout on real NSE data</span>
              </div>
              <ArrowRight size={14}/>
            </Link>
            <Link to="/ai-signals" className="db-quick-item">
              <Zap size={16}/>
              <div>
                <strong>AI Signals</strong>
                <span>Generate BUY/SELL signals for Nifty 50 stocks</span>
              </div>
              <ArrowRight size={14}/>
            </Link>
            <Link to="/trading-assistant" className="db-quick-item">
              <ShieldCheck size={16}/>
              <div>
                <strong>Trading Assistant</strong>
                <span>Ask the AI about any NSE stock or strategy</span>
              </div>
              <ArrowRight size={14}/>
            </Link>
            <Link to="/news-trends" className="db-quick-item">
              <Newspaper size={16}/>
              <div>
                <strong>News & Trends</strong>
                <span>Live Indian market news with sentiment</span>
              </div>
              <ArrowRight size={14}/>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
