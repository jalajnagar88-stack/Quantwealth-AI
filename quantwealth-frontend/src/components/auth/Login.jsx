import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (result.user.isEmailVerified) {
        navigate('/dashboard');
      } else {
        navigate('/verify-otp');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div>
            <div className="auth-logo">
              <div className="logo-icon">QW</div>
              <span className="logo-text">QuantWealth AI</span>
            </div>
            <h2 className="auth-heading">Your AI-Powered Edge in the Crypto Market</h2>
            <p className="auth-tagline">
              Real-time crypto signals, multi-strategy backtesting, and AI insights — trusted by serious traders.
            </p>
          </div>

          <div className="auth-trust-badges">
            <div className="trust-badge-item">
              <div className="trust-badge-icon"><ShieldCheck size={18} /></div>
              <div className="trust-badge-text">
                <strong>Bank-Grade Security</strong>
                <span>End-to-end encryption · No credentials stored</span>
              </div>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon"><TrendingUp size={18} /></div>
              <div className="trust-badge-text">
                <strong>10-Year Backtesting Data</strong>
                <span>RSI, MACD, Breakout & Moving Average strategies</span>
              </div>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon"><Zap size={18} /></div>
              <div className="trust-badge-text">
                <strong>Live Market Signals</strong>
                <span>Crypto coverage · Updated in real-time</span>
              </div>
            </div>
          </div>

          <div className="auth-stats">
            <div className="stat-item">
              <h3>200+</h3>
              <p>Crypto Assets</p>
            </div>
            <div className="stat-item">
              <h3>10yr</h3>
              <p>History</p>
            </div>
            <div className="stat-item">
              <h3>Free</h3>
              <p>To Start</p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access your intelligent trading dashboard
            </p>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={16} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
