import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Backtest from './components/Backtest';
import { fetchMarketData, fetchSignals } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [marketData, setMarketData] = useState({});
  const [signals, setSignals] = useState([]);
  const [portfolio] = useState({
    value: 2845200,
    dayPnL: 18450,
    winRate: 68.3,
    riskUsed: 0.8
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketResults = await fetchMarketData(['RELIANCE', 'TCS', 'INFY', 'WIPRO']);
        setMarketData(marketResults);
        const signalsData = await fetchSignals();
        setSignals(signalsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <Header portfolio={portfolio} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'dashboard' && (
        <Dashboard portfolio={portfolio} marketData={marketData} signals={signals} />
      )}
      
      {currentPage === 'backtest' && (
        <Backtest />
      )}
    </div>
  );
}

export default App;
