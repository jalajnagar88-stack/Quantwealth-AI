import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageSquare } from 'lucide-react';
import './Help.css';

const FAQS = [
  { q: 'How do I connect my Zerodha account?', a: 'Go to Profile → Connected DMAT Accounts → Connect and authorise via Zerodha OAuth. We never store your credentials.' },
  { q: 'What does the Strategy Simulator do?', a: 'It backtests your chosen strategy (Momentum, Mean Reversion, Breakout, or Donchian) on up to 10 years of NSE historical data so you can evaluate performance before risking real capital.' },
  { q: 'How are AI Signals generated?', a: 'Signals are generated using technical indicators (RSI, MACD, ATR, Donchian Channels) scanned across Nifty 50 stocks. Each setup is scored and filtered for quality.' },
  { q: 'What is Trade Brief?', a: 'Trade Brief uses the AI scanner to find the best current setups and sends them through Google Gemini to generate a concise, reasoned trading plan with entry, target, and stop-loss levels.' },
  { q: 'How do Price Alerts work?', a: 'Set a target price and condition (above/below) for any NSE stock. You will see a triggered status on the Watchlist page when your condition is met.' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted with AES-256. We never store your broker credentials — only OAuth tokens that can be revoked at any time from your broker dashboard.' },
  { q: 'How is the Portfolio Tracker different from my broker?', a: 'It is a manual tracker where you log your own holdings and average prices. It is not connected to your broker account and is for your own record-keeping.' },
];

export default function Help() {
  const [open, setOpen] = useState(null);

  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Help Center</h1>
        <p>Find answers to common questions about QuantWealth AI</p>
      </div>

      <div className="help-grid">
        <div className="help-faqs">
          <h2>Frequently Asked Questions</h2>
          {FAQS.map((item, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                {open === i ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </button>
              {open === i && <div className="faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>

        <div className="help-contact">
          <h2>Still need help?</h2>
          <div className="help-contact-card">
            <Mail size={24}/>
            <div>
              <strong>Email Support</strong>
              <p>support@quantwealth.ai</p>
            </div>
          </div>
          <div className="help-contact-card">
            <MessageSquare size={24}/>
            <div>
              <strong>Live Chat</strong>
              <p>Use the Trading Assistant in the sidebar for instant AI help</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
