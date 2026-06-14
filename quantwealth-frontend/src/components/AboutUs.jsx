import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Award, TrendingUp } from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      <nav className="about-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </nav>

      <div className="about-content">
        <header className="about-header">
          <h1>About QuantWealth AI</h1>
          <p className="tagline">Democratizing Intelligent Trading for Everyone</p>
        </header>

        <section className="about-mission">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              At QuantWealth AI, we believe that advanced trading technology should be accessible to everyone, 
              not just institutional investors. Our mission is to democratize AI-powered trading tools and empower 
              individual investors in India to make smarter, data-driven decisions.
            </p>
            <p>
              We combine cutting-edge artificial intelligence with deep market expertise to provide 
              personalized investment insights, strategy validation, and real-time market intelligence.
            </p>
          </div>
          <div className="mission-stats">
            <div className="stat-card">
              <Target size={32} />
              <h3>Our Vision</h3>
              <p>To be India's most trusted AI-powered trading platform</p>
            </div>
          </div>
        </section>

        <section className="about-features">
          <h2>What Makes Us Different</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h3>Built for Indian Markets</h3>
              <p>Our AI is specifically trained on Indian market data, understanding the unique characteristics of NSE and BSE.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Award size={28} />
              </div>
              <h3>Expert-Backed</h3>
              <p>Developed in collaboration with seasoned traders and quantitative analysts from top financial institutions.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <TrendingUp size={28} />
              </div>
              <h3>Proven Results</h3>
              <p>Our algorithms have demonstrated consistent performance with an 85% success rate across market conditions.</p>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <h2>Ready to Start Your Journey?</h2>
          <p>Create a free account and start exploring AI-powered trading tools today.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn primary">Get Started Free</Link>
            <Link to="/" className="cta-btn secondary">Explore Features</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
