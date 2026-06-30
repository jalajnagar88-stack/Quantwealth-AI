import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clock, ExternalLink, RefreshCw, Search, Newspaper, AlertCircle } from 'lucide-react';
import './NewsTrends.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app/api';

const SECTOR_TRENDS = [
  { sector: 'IT Services',  stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH'] },
  { sector: 'Banking',      stocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK'] },
  { sector: 'Auto',         stocks: ['TATAMOTORS', 'M&M', 'MARUTI'] },
  { sector: 'Pharma',       stocks: ['SUNPHARMA', 'CIPLA', 'DRREDDY'] },
  { sector: 'Energy',       stocks: ['RELIANCE', 'ONGC', 'NTPC'] },
  { sector: 'FMCG',         stocks: ['ITC', 'HINDUNILVR', 'NESTLEIND'] },
  { sector: 'Infra & Power',stocks: ['POWERGRID', 'NTPC', 'L&T', 'ADANIPORTS'] },
  { sector: 'Metals',       stocks: ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'COALINDIA'] },
];

const ALL_CATEGORIES = ['All', 'Market Update', 'Earnings', 'Policy', 'IPO', 'FII/FPI', 'M&A', 'Corporate Action', 'General'];

function timeAgo(dateVal) {
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NewsTrends = () => {
  const [activeTab, setActiveTab]         = useState('news');
  const [newsData, setNewsData]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastUpdated, setLastUpdated]     = useState(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      forceRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (forceRefresh) {
        await fetch(`${API_URL}/news/refresh`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const params = new URLSearchParams({ limit: '60' });
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`${API_URL}/news?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.success) {
        setNewsData(data.data.articles || []);
        setLastUpdated(new Date(data.data.lastUpdated));
      } else {
        throw new Error(data.message || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message || 'Could not load news. Is the backend running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const sentimentLabel = (s) => ({
    positive: { text: 'Bullish', cls: 'positive' },
    negative: { text: 'Bearish', cls: 'negative' },
    neutral:  { text: 'Neutral', cls: 'neutral' },
  }[s] || { text: 'Neutral', cls: 'neutral' });

  return (
    <div className="news-trends-page">
      {/* ── Header ── */}
      <div className="nt-header">
        <div>
          <h1 className="nt-title">Market News</h1>
          <p className="nt-subtitle">
            {lastUpdated ? (
              <><span className="live-dot" style={{marginRight:6}}></span>Updated {timeAgo(lastUpdated)}</>
            ) : 'Live Indian market news'}
          </p>
        </div>
        <button
          className={`nt-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          title="Refresh news"
        >
          <RefreshCw size={15} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="nt-tabs">
        <button className={`nt-tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
          <Newspaper size={14} /> Latest News
        </button>
        <button className={`nt-tab ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
          <TrendingUp size={14} /> Sector Trends
        </button>
      </div>

      {/* ── News Tab ── */}
      {activeTab === 'news' && (
        <div className="nt-news-tab">
          {/* Controls */}
          <div className="nt-controls">
            <div className="nt-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search news…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="nt-categories">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`nt-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="nt-state">
              <div className="nt-skeleton-grid">
                {Array.from({length: 6}).map((_, i) => <div key={i} className="nt-skeleton-card" />)}
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="nt-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && newsData.length === 0 && (
            <div className="nt-empty">
              <Newspaper size={32} />
              <p>No articles found{selectedCategory !== 'All' ? ` for "${selectedCategory}"` : ''}.</p>
              {searchQuery && <span>Try a different search term.</span>}
            </div>
          )}

          {!loading && !error && newsData.length > 0 && (
            <div className="nt-grid">
              {newsData.map((article) => {
                const s = sentimentLabel(article.sentiment);
                return (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`nt-card nt-card--${s.cls}`}
                  >
                    {article.imageUrl && (
                      <div className="nt-card-img">
                        <img src={article.imageUrl} alt="" loading="lazy" onError={e => { e.target.closest('.nt-card-img').style.display='none'; }} />
                      </div>
                    )}
                    <div className="nt-card-body">
                      <div className="nt-card-meta">
                        <span className="nt-cat-tag">{article.category}</span>
                        <span className={`nt-sentiment nt-sentiment--${s.cls}`}>{s.text}</span>
                      </div>
                      <h3 className="nt-card-title">{article.title}</h3>
                      {article.description && (
                        <p className="nt-card-desc">{article.description.slice(0, 120)}{article.description.length > 120 ? '…' : ''}</p>
                      )}
                      <div className="nt-card-footer">
                        <span className="nt-source">{article.source}</span>
                        <span className="nt-time"><Clock size={11} /> {timeAgo(article.publishedAt)}</span>
                        <ExternalLink size={11} className="nt-ext-icon" />
                      </div>
                      {article.relatedStocks?.length > 0 && (
                        <div className="nt-stocks">
                          {article.relatedStocks.slice(0,4).map(s => <span key={s} className="nt-stock-tag">{s}</span>)}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Trends Tab ── */}
      {activeTab === 'trends' && (
        <div className="nt-trends-tab">
          <p className="nt-trends-note">Indicative sector groupings for reference. Connect a broker for live sector data.</p>
          <div className="nt-trends-grid">
            {SECTOR_TRENDS.map((trend, i) => (
              <div key={i} className="nt-trend-card">
                <div className="nt-trend-top">
                  <span className="nt-trend-sector">{trend.sector}</span>
                </div>
                <div className="nt-trend-stocks">
                  {trend.stocks.map((s, idx) => <span key={idx} className="nt-stock-tag">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsTrends;
