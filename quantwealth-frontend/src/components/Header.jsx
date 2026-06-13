import React from 'react';
import './Header.css';

function Header({ portfolio, currentPage, setCurrentPage }) {
  return (
    <header className="header">
      <div className="logo-section">
        <div className="logo">Q</div>
        <div>
          <div className="logo-title">QuantWealth AI</div>
          <div className="logo-subtitle">Liquid Trading</div>
        </div>
      </div>
      <nav className="nav">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }} 
          className={currentPage === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setCurrentPage('backtest'); }} 
          className={currentPage === 'backtest' ? 'active' : ''}
        >
          Backtest
        </a>
        <a href="#">Portfolio</a>
      </nav>
      <div className="header-stats">
        <div className="stat">
          <div className="stat-label">Portfolio</div>
          <div className="stat-value">${(portfolio.value / 1000000).toFixed(2)}M</div>
        </div>
        <div className="stat">
          <div className="stat-label">Today</div>
          <div className="stat-value positive">+${(portfolio.dayPnL / 1000).toFixed(1)}K</div>
        </div>
      </div>
    </header>
  );
}

export default Header;
