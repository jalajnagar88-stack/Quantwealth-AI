import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlayCircle, 
  TrendingUp, 
  Bot, 
  User, 
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Link2,
  Zap,
  Briefcase,
  Newspaper,
  Star,
  Wallet
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/trade-brief',        icon: Briefcase,       label: 'Trade Brief', badge: 'NEW' },
    { path: '/paper-trading',      icon: Wallet,          label: 'Paper Trading', badge: 'NEW' },
    { path: '/watchlist',           icon: Star,            label: 'Watchlist' },
    { path: '/strategy-simulator', icon: PlayCircle,      label: 'Strategy Simulator' },
    { path: '/ai-signals',         icon: Zap,             label: 'AI Signals' },
    { path: '/news-trends',        icon: Newspaper,       label: 'News & Trends' },
    { path: '/trading-assistant',  icon: Bot,             label: 'Trading Assistant' },
  ];
  
  const bottomItems = [
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          <div className="logo-icon">QW</div>
          <span className="logo-text">Quant<span>Wealth</span></span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Main Menu</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.badge && !active && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {active && <ChevronRight size={16} className="active-indicator" />}
              </Link>
            );
          })}
        </div>

        <div className="nav-section">
          <span className="nav-label">Account</span>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* DMAT Connect CTA */}
      <div className="sidebar-dmat-cta">
        <strong>Connect Broker</strong>
        <p>Link your Zerodha, Upstox, or Angel One account to enable live trading.</p>
        <a href="/profile" className="dmat-cta-btn">
          <Link2 size={13} />
          Connect DMAT Account
        </a>
      </div>

      <div className="sidebar-footer">
        <div className="user-preview">
          <div className="user-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-status">{user?.isEmailVerified ? 'Verified' : 'Pending'}</span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
