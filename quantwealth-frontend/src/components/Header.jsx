import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Settings } from 'lucide-react';
import './Header.css';

function Header({ pageTitle }) {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{pageTitle}</h1>
        <span className="welcome-text">Welcome back, {user?.firstName}</span>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={15} />
          <input type="text" placeholder="Search stocks, news..." />
        </div>

        <div className="header-market-status">
          <span className="live-dot"></span>
          NSE Open
        </div>

        <button className="header-btn">
          <Bell size={16} />
          <span className="notification-badge">3</span>
        </button>

        <div className="header-profile">
          <div className="header-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
