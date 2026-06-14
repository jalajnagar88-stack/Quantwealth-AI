import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Brain, BarChart3 } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">Q</span>
          <span className="logo-text">QuantWealth AI</span>
        </div>
        <div className="nav-links">
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-btn secondary">Sign In</Link>
          <Link to="/register" className="nav-btn primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>Built for Indian Markets</span>
          </div>
          <h1 className="hero-title">
            Smarter Trading,<br />
            <span className="gradient-text">Better Returns</span>
          </h1>
          <p className="hero-subtitle">
            India's most advanced trading intelligence platform. Backtest strategies, get real-time signals,
            and let AI find your next opportunity.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="cta-btn primary">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="cta-btn secondary">
              See How It Works
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-1">
            <TrendingUp size={24} />
            <div>
              <span className="label">Portfolio Growth</span>
              <span className="value">+24.5%</span>
            </div>
          </div>
          <div className="floating-card card-2">
            <Shield size={24} />
            <div>
              <span className="label">Risk Score</span>
              <span className="value">Low</span>
            </div>
          </div>
          <div className="floating-card card-3">
            <Brain size={24} />
            <div>
              <span className="label">AI Confidence</span>
              <span className="value">92%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2>Everything You Need to Trade Smarter</h2>
          <p>Powerful tools built for both beginners and seasoned traders in Indian markets</p>
        </div>

        <div className="features-grid">
          <div className="feature-card large">
            <div className="feature-icon gradient-1">
              <Brain size={32} />
            </div>
            <h3>AI Trading Assistant</h3>
            <p>Get personalised investment recommendations powered by AI trained on decades of Indian market data.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-2">
              <BarChart3 size={32} />
            </div>
            <h3>Strategy Simulator</h3>
            <p>Backtest your strategies on 10+ years of NSE and BSE data before putting real capital at risk.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-3">
              <TrendingUp size={32} />
            </div>
            <h3>Market Trends</h3>
            <p>Stay ahead with live news, sentiment analysis and price trend signals across 200+ stocks.</p>
          </div>
          <div className="feature-card large">
            <div className="feature-icon gradient-4">
              <Shield size={32} />
            </div>
            <h3>Bank Grade Security</h3>
            <p>Your data is protected with AES-256 encryption. We never store your broker credentials.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Trade Smarter?</h2>
          <p>Start with a free account. No credit card required.</p>
          <Link to="/register" className="cta-btn primary large">
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">Q</span>
              <span className="logo-text">QuantWealth AI</span>
            </div>
            <p>Intelligent trading tools built for the Indian investor.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/about">About</Link>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/status">Status</Link>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/disclaimer">Disclaimer</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 QuantWealth AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
