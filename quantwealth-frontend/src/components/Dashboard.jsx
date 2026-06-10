import React from 'react';
import './Dashboard.css';
import MetricCard from './MetricCard';
import LiquidCandles from './visualizations/LiquidCandles';
import PortfolioBlobs from './visualizations/PortfolioBlobs';
import LiquidOrderBook from './visualizations/LiquidOrderBook';
import SentimentWave from './visualizations/SentimentWave';
import RiskGauge from './visualizations/RiskGauge';
import ReasoningChain from './visualizations/ReasoningChain';
import TradeExecutionBurst from './visualizations/TradeExecutionBurst';
import WealthMeter from './visualizations/WealthMeter';
import SignalsList from './SignalsList';

function Dashboard({ portfolio }) {
  return (
    <div className="dashboard">
      <div className="metrics-grid">
        <MetricCard label="Portfolio Value" value={`$${(portfolio.value / 1000000).toFixed(2)}M`} change="+12.4%" />
        <MetricCard label="Today's P&L" value={`+$${(portfolio.dayPnL / 1000).toFixed(1)}K`} change="14 trades" />
        <MetricCard label="Win Rate" value={`${portfolio.winRate}%`} change="+2.1%" />
        <MetricCard label="Risk Used" value={`${portfolio.riskUsed}%`} change="Safe" />
      </div>

      <div className="viz-grid">
        <div className="viz-section">
          <h3>Liquid Candlesticks</h3>
          <LiquidCandles stock="TCS" />
        </div>
        <div className="viz-section">
          <h3>Portfolio Blobs</h3>
          <PortfolioBlobs />
        </div>
      </div>

      <div className="viz-section full-width">
        <h3>Liquid Order Book</h3>
        <LiquidOrderBook />
      </div>

      <div className="viz-grid">
        <div className="viz-section">
          <SentimentWave />
        </div>
        <div className="viz-section">
          <RiskGauge />
        </div>
      </div>

      <ReasoningChain />
      
      <div className="viz-grid">
        <div className="viz-section">
          <TradeExecutionBurst />
        </div>
        <div className="viz-section">
          <WealthMeter />
        </div>
      </div>

      <SignalsList />
    </div>
  );
}

export default Dashboard;
