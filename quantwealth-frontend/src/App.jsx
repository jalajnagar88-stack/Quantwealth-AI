import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { fetchMarketData, fetchSignals } from './services/api';

function App() {
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
        console.log('Fetching data from backend...');
        
        // Fetch market data
        const marketResults = await fetchMarketData(['RELIANCE', 'TCS', 'INFY', 'WIPRO']);
        console.log('Market data:', marketResults);
        setMarketData(marketResults);

        // Fetch signals
        const signalsData = await fetchSignals();
        console.log('Signals:', signalsData);
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
      <Header portfolio={portfolio} />
      <Dashboard 
        portfolio={portfolio}
        marketData={marketData}
        signals={signals}
      />
    </div>
  );
}

export default App;
