import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/strategy-simulator') return 'Strategy Simulator';
    if (path === '/news-trends') return 'News & Trends';
    if (path === '/trading-assistant') return 'Trading Assistant';
    if (path === '/profile') return 'Profile';
    if (path === '/hacd-issuance') return 'HACD Issuance';
    if (path === '/hacd-analysis') return 'HACD Token Analysis';
    return '';
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Header pageTitle={getPageTitle()} />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
