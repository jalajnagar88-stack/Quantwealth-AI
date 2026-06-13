import React, { useState } from 'react';
import './Backtest.css';
import BacktestResults from './BacktestResults';
import { runBacktest } from '../services/backtestApi';

function Backtest() {
  const [symbol, setSymbol] = useState('TCS');
  const [years, setYears] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const backtestResults = await runBacktest(symbol, years);
      setResults(backtestResults);
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backtest-container">
      <h1>AI Backtest Engine</h1>
      <p className="subtitle">Test AI signals on 10+ years of historical data</p>
      <div className="backtest-controls">
        <div className="control-group">
          <label>Select Stock</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            <option>TCS</option>
            <option>INFY</option>
            <option>WIPRO</option>
            <option>RELIANCE</option>
          </select>
        </div>
        <div className="control-group">
          <label>Years</label>
          <input type="number" value={years} onChange={(e) => setYears(parseInt(e.target.value))} min="1" max="20" />
        </div>
        <button className="run-btn" onClick={handleRunBacktest} disabled={loading}>
          {loading ? 'Running...' : 'Run Backtest'}
        </button>
      </div>
      {results && <BacktestResults data={results} symbol={symbol} />}
    </div>
  );
}
export default Backtest;
