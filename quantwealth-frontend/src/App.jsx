import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';

// Main App Components
import LandingPage from './components/LandingPage';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import Backtest from './components/Backtest';
import NewsTrends from './components/NewsTrends';
import TradingAssistant from './components/TradingAssistant';
import SignalsList from './components/SignalsList';
import TradeBrief from './components/TradeBrief';
import Watchlist from './components/Watchlist';
import PaperTrading from './components/PaperTrading';
import HacdIssuance from './components/HacdIssuance';
import HacdAnalysis from './components/HacdAnalysis';
import UserProfile from './components/UserProfile';
import AboutUs from './components/AboutUs';
import Settings from './components/Settings';
import Help from './components/Help';
import NotFound from './components/NotFound';

// Legal Pages
import TermsOfService from './components/legal/TermsOfService';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import RiskDisclosure from './components/legal/RiskDisclosure';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/risk" element={<RiskDisclosure />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/strategy-simulator" element={
            <ProtectedRoute>
              <MainLayout>
                <Backtest />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/news-trends" element={
            <ProtectedRoute>
              <MainLayout>
                <NewsTrends />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ai-signals" element={
            <ProtectedRoute>
              <MainLayout>
                <SignalsList />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/trading-assistant" element={
            <ProtectedRoute>
              <MainLayout>
                <TradingAssistant />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout>
                <UserProfile />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/watchlist" element={
            <ProtectedRoute>
              <MainLayout>
                <Watchlist />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/trade-brief" element={
            <ProtectedRoute>
              <MainLayout>
                <TradeBrief />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/help" element={
            <ProtectedRoute>
              <MainLayout>
                <Help />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/backtest" element={<Navigate to="/strategy-simulator" replace />} />
          <Route path="/signals" element={<Navigate to="/ai-signals" replace />} />
          <Route path="/paper-trading" element={
            <ProtectedRoute>
              <MainLayout>
                <PaperTrading />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/hacd-issuance" element={
            <ProtectedRoute>
              <MainLayout>
                <HacdIssuance />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/hacd-analysis" element={
            <ProtectedRoute>
              <MainLayout>
                <HacdAnalysis />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
