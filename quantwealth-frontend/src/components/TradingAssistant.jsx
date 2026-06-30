import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Shield, AlertCircle, TrendingUp, RotateCcw, Copy, Check } from 'lucide-react';
import './TradingAssistant.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app';

const QUICK_QUESTIONS = [
  'What is the outlook for Bitcoin this week?',
  'Analyze BTC vs ETH for long-term investment',
  'Explain RSI and how to use it for crypto trading',
  'Best sectors to watch in DeFi right now?',
  'How do institutional flows affect crypto markets?',
  'What is a good entry strategy for HACD?',
];

const WELCOME = `Hello! I'm **QuantWealth AI** — your trading assistant for crypto markets.

I can help you with:
• **Asset analysis** — Crypto tokens, technicals & fundamentals
• **Market insights** — BTC, ETH, sectoral trends
• **Strategy advice** — RSI, MACD, Moving Averages explained
• **Risk & portfolio** — position sizing, diversification

What would you like to explore today?`;

function renderText(text) {
  // Convert **bold** and • bullets to styled spans
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} style={{ margin: '2px 0' }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </p>
    );
  });
}

const TradingAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME, ts: new Date() }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [copied, setCopied]     = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: new Date() }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Build history excluding the welcome message
      const history = messages
        .filter(m => m.role !== 'assistant' || m.content !== WELCOME)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg, history })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply, ts: new Date() }]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // remove user msg on error
      setInput(msg); // restore input
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages]);

  const handleCopy = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setMessages([{ role: 'assistant', content: WELCOME, ts: new Date() }]);
    setError(null);
  };

  return (
    <div className="ta-page">
      {/* Header */}
      <div className="ta-header">
        <div className="ta-header-left">
          <div className="ta-avatar-lg">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="ta-title">AI Trading Assistant</h1>
            <p className="ta-subtitle">Powered by Gemini · Crypto Markets Specialist</p>
          </div>
        </div>
        <div className="ta-header-right">
          <span className="ta-badge"><Sparkles size={12} /> AI Powered</span>
          <span className="ta-badge"><Shield size={12} /> Disclaimer</span>
          <button className="ta-clear-btn" onClick={handleClear} title="Clear chat">
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="ta-body">
        {/* Chat column */}
        <div className="ta-chat">
          {/* Messages */}
          <div className="ta-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ta-msg ta-msg--${msg.role}`}>
                <div className="ta-msg-avatar">
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="ta-msg-bubble">
                  <div className="ta-msg-text">{renderText(msg.content)}</div>
                  <div className="ta-msg-meta">
                    <span className="ta-msg-time">
                      {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'assistant' && (
                      <button className="ta-copy-btn" onClick={() => handleCopy(msg.content, idx)}>
                        {copied === idx ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ta-msg ta-msg--assistant">
                <div className="ta-msg-avatar"><Bot size={16} /></div>
                <div className="ta-msg-bubble">
                  <div className="ta-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="ta-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="ta-quick">
            <span className="ta-quick-label">Try asking:</span>
            <div className="ta-quick-chips">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className="ta-chip" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="ta-input-row">
            <input
              ref={inputRef}
              type="text"
              className="ta-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about crypto assets, technicals, strategy…"
              disabled={loading}
            />
            <button
              className="ta-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="ta-sidebar">
          <div className="ta-info-card">
            <h3><AlertCircle size={15} /> Disclaimer</h3>
            <p>AI responses are for educational purposes only and do not constitute professional investment advice. Always consult a registered advisor before trading.</p>
          </div>

          <div className="ta-info-card">
            <h3><TrendingUp size={15} /> What I can analyse</h3>
            <ul>
              <li>BTC / ETH trends</li>
              <li>Individual crypto assets</li>
              <li>Technical indicators (RSI, MACD…)</li>
              <li>Sectoral & macro themes</li>
              <li>Portfolio risk & allocation</li>
            </ul>
          </div>

          <div className="ta-info-card ta-info-card--tip">
            <h3><Sparkles size={15} /> Pro tip</h3>
            <p>Be specific — e.g. <em>"Is BTC a good buy at $45000 with RSI at 42?"</em> gets better answers than generic questions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingAssistant;
