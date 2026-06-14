import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowRight, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import './Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verified, setVerified] = useState(false);
  
  const { user, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    const result = await verifyOTP(otpString, 'email');
    
    if (result.success) {
      setVerified(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    const result = await resendOTP('email');
    
    if (result.success) {
      setCountdown(60);
      setError('');
    } else {
      setError(result.error);
    }
    
    setResendLoading(false);
  };

  if (verified) {
    return (
      <div className="auth-page">
        <div className="verify-container">
          <div className="success-animation">
            <CheckCircle size={80} className="success-icon" />
          </div>
          <h2>Verification Successful!</h2>
          <p>Your email has been verified. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="verify-container">
        <div className="verify-icon">
          <Shield size={64} />
        </div>
        
        <h1 className="verify-title">Verify Your Email</h1>
        <p className="verify-subtitle">
          Enter the 6-digit verification code sent to{' '}
          <strong>{user?.email}</strong>
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            className="auth-submit-btn verify-btn"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="resend-section">
          {countdown > 0 ? (
            <p className="countdown">
              Resend code in <span>{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="resend-btn"
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="spinner" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Resend OTP
                </>
              )}
            </button>
          )}
        </div>

        <p className="verify-help">
          Didn't receive the code? Check your spam folder or{' '}
          <button className="text-link" onClick={() => navigate('/login')}>
            try another email
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
