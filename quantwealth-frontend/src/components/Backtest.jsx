import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Play, Settings, Calendar, TrendingUp, Info } from 'lucide-react';
import './Backtest.css';
import BacktestResults from './BacktestResults';
import { runBacktest } from '../services/backtestApi';
import { stockCategories, allStocks, searchStocks } from '../data/indianStocks';

function Backtest() {
  const [symbol, setSymbol] = useState('BTC');
  const [years, setYears] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockDropdown, setShowStockDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [strategy, setStrategy] = useState('RSI');
  const [initialCapital, setInitialCapital] = useState(100000);

  const selectedStock = useMemo(() => {
    return allStocks.find(s => s.symbol === symbol) || allStocks[0];
  }, [symbol]);

  const filteredStocks = useMemo(() => {
    if (searchQuery) {
      return searchStocks(searchQuery).slice(0, 50);
    }
    if (selectedCategory === 'All') {
      return allStocks.slice(0, 50);
    }
    const category = stockCategories.find(c => c.name === selectedCategory);
    return category ? category.stocks : allStocks.slice(0, 50);
  }, [searchQuery, selectedCategory]);

  const handleStockSelect = (stockSymbol) => {
    setSymbol(stockSymbol);
    setShowStockDropdown(false);
    setSearchQuery('');
  };

  const handleRunBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const backtestResults = await runBacktest(symbol, years, strategy, initialCapital);
      setResults(backtestResults);
    } catch (err) {
      console.error('Backtest error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Simulation failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strategies = [
    { id: 'RSI',        name: 'RSI Mean Reversion',  description: 'Buy when RSI < 30 (oversold), sell when RSI > 70' },
    { id: 'MACD',       name: 'MACD Crossover',       description: 'Buy on bullish MACD/signal crossover, sell on bearish' },
    { id: 'MOVING_AVG', name: 'Golden / Death Cross', description: '50-day SMA crosses 200-day SMA — classic trend following' },
    { id: 'BREAKOUT',   name: 'Donchian Breakout',    description: 'Turtle-trading breakout with ATR-based position sizing' },
  ];

  return (
    <div className="strategy-simulator-page">
      <div className="simulator-header">
        <div className="header-title">
          <TrendingUp className="header-icon" size={28} />
          <div>
            <h1>Strategy Simulator</h1>
            <p>Test your trading strategies on 10+ years of Indian market data</p>
          </div>
        </div>
      </div>

      <div className="simulator-content">
        <div className="controls-panel">
          {/* Stock Selection */}
          <div className="control-section">
            <label className="section-label">
              <Search size={16} />
              Select Stock
            </label>
            <div className="stock-selector">
              <div 
                className="selected-stock-display"
                onClick={() => setShowStockDropdown(!showStockDropdown)}
              >
                <div className="stock-info">
                  <span className="stock-symbol">{selectedStock.symbol}</span>
                  <span className="stock-name">{selectedStock.name}</span>
                  <span className="stock-sector">{selectedStock.sector}</span>
                </div>
                <ChevronDown size={20} className={showStockDropdown ? 'rotate' : ''} />
              </div>

              {showStockDropdown && (
                <div className="stock-dropdown">
                  <div className="dropdown-search">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="category-tabs">
                    <button 
                      className={selectedCategory === 'All' ? 'active' : ''}
                      onClick={() => setSelectedCategory('All')}
                    >
                      All
                    </button>
                    {stockCategories.slice(0, 5).map(cat => (
                      <button
                        key={cat.name}
                        className={selectedCategory === cat.name ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat.name)}
                      >
                        {cat.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="stocks-list">
                    {filteredStocks.map(stock => (
                      <div
                        key={stock.symbol}
                        className={`stock-option ${symbol === stock.symbol ? 'selected' : ''}`}
                        onClick={() => handleStockSelect(stock.symbol)}
                      >
                        <div className="option-symbol">{stock.symbol}</div>
                        <div className="option-name">{stock.name}</div>
                        <div className="option-price">${stock.price.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="control-section">
            <label className="section-label">
              <Settings size={16} />
              Trading Strategy
            </label>
            <div className="strategy-options">
              {strategies.map(strat => (
                <div
                  key={strat.id}
                  className={`strategy-card ${strategy === strat.id ? 'selected' : ''}`}
                  onClick={() => setStrategy(strat.id)}
                >
                  <div className="strategy-name">{strat.name}</div>
                  <div className="strategy-desc">{strat.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div className="control-section">
            <label className="section-label">
              <Calendar size={16} />
              Backtest Period
            </label>
            <div className="period-selector">
              {[1, 3, 5, 10].map(year => (
                <button
                  key={year}
                  className={years === year ? 'active' : ''}
                  onClick={() => setYears(year)}
                >
                  {year} {year === 1 ? 'Year' : 'Years'}
                </button>
              ))}
              <div className="custom-input">
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="20"
                />
                <span>Years</span>
              </div>
            </div>
          </div>

          {/* Initial Capital */}
          <div className="control-section">
            <label className="section-label">
              Initial Capital
            </label>
            <div className="capital-input">
              <span className="currency">$</span>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseInt(e.target.value) || 100000)}
                step="10000"
                min="10000"
              />
            </div>
            <div className="capital-presets">
              {[50000, 100000, 250000, 500000, 1000000].map(amount => (
                <button
                  key={amount}
                  className={initialCapital === amount ? 'active' : ''}
                  onClick={() => setInitialCapital(amount)}
                >
                  ${(amount / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button 
            className="run-backtest-btn" 
            onClick={handleRunBacktest} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Running Simulation...
              </>
            ) : (
              <>
                <Play size={20} />
                Run Strategy Simulation
              </>
            )}
          </button>

          <div className="info-note">
            <Info size={14} />
            <span>Simulations use historical market data with transaction costs included</span>
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          {error && (
            <div className="backtest-error">
              <span>⚠ {error}</span>
              {error.includes('token') || error.includes('Unauthorized') ? (
                <p>Please <a href="/login">log in</a> to run simulations.</p>
              ) : null}
            </div>
          )}
          {results ? (
            <BacktestResults 
              data={results} 
              symbol={symbol}
              stockName={selectedStock.name}
              strategy={strategies.find(s => s.id === strategy)?.name}
              years={years}
              initialCapital={initialCapital}
            />
          ) : (
            <div className="empty-results">
              <div className="empty-icon">
                <TrendingUp size={48} />
              </div>
              <h3>Run Your First Simulation</h3>
              <p>Select a stock, choose your strategy, and run the backtest to see detailed performance metrics</p>
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-number">{allStocks.length}+</span>
                  <span className="stat-label">Crypto Assets</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Years Data</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4</span>
                  <span className="stat-label">Strategies</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Backtest;
