import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingDown, DollarSign, Info, Shield } from 'lucide-react';
import './LegalPages.css';

const RiskDisclosure = () => {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </nav>

      <div className="legal-content">
        <header className="legal-header">
          <AlertTriangle className="legal-icon warning" size={48} />
          <h1>Risk Disclosure</h1>
          <p>Please Read Carefully Before Using Our Services</p>
        </header>

        <div className="legal-body">
          <div className="highlight-box danger">
            <AlertTriangle size={24} />
            <div>
              <h3>Important Warning</h3>
              <p>
                Trading and investing in securities involves substantial risk of loss and is not suitable 
                for all investors. Past performance is not indicative of future results. You could lose 
                all or more than your initial investment.
              </p>
            </div>
          </div>

          <section>
            <h2>1. Nature of Trading Risks</h2>
            <p>
              Trading in securities, commodities, and other financial instruments carries significant risks. 
              Before using QuantWealth AI, you should carefully consider whether trading is appropriate for 
              you in light of your financial condition, experience, and risk tolerance.
            </p>
            <ul>
              <li>
                <strong>Market Risk:</strong> Securities markets are subject to various risks including 
                economic, political, regulatory, and market sentiment changes.
              </li>
              <li>
                <strong>Volatility Risk:</strong> Prices of securities can fluctuate significantly in short 
                periods, potentially resulting in substantial losses.
              </li>
              <li>
                <strong>Liquidity Risk:</strong> Some securities may become illiquid, making it difficult 
                to exit positions at desired prices.
              </li>
              <li>
                <strong>Leverage Risk:</strong> If you use margin or leverage, losses can exceed your 
                initial investment.
              </li>
            </ul>
          </section>

          <section>
            <h2>2. Algorithmic and AI Trading Risks</h2>
            <div className="highlight-box warning">
              <TrendingDown size={20} />
              <span>
                <strong>AI Limitations:</strong> Our AI-driven insights are based on historical patterns 
                and mathematical models. They do not predict future performance and should not be the 
                sole basis for trading decisions.
              </span>
            </div>
            <ul>
              <li>
                <strong>Historical Bias:</strong> Backtesting shows how strategies would have performed 
                in the past, not how they will perform in the future.
              </li>
              <li>
                <strong>Model Risk:</strong> AI models may fail to account for unprecedented market events 
                or changing market conditions.
              </li>
              <li>
                <strong>Overfitting:</strong> Strategies that perform well in backtesting may fail in live 
                markets due to over-optimization on historical data.
              </li>
              <li>
                <strong>Technical Failures:</strong> System outages, data delays, or software errors can 
                impact trading performance.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Specific Risks for Indian Markets</h2>
            <p>
              Trading in Indian securities markets involves additional risks specific to the Indian context:
            </p>
            <ul>
              <li>
                <strong>Currency Risk:</strong> Foreign investors face risks associated with INR exchange 
                rate fluctuations.
              </li>
              <li>
                <strong>Regulatory Risk:</strong> Changes in SEBI regulations, tax laws, or government 
                policies can impact investments.
              </li>
              <li>
                <strong>Economic Risk:</strong> India's economy is subject to inflation, interest rate 
                changes, and economic cycles.
              </li>
              <li>
                <strong>Settlement Risk:</strong> T+1 settlement cycle may result in liquidity gaps.
              </li>
              <li>
                <strong>Circuit Breakers:</strong> Market-wide or stock-specific circuit limits can 
                prevent exit during volatile periods.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Strategy-Specific Risks</h2>
            <p>
              Different trading strategies carry different risk profiles. You should understand the risks 
              associated with each strategy:
            </p>
            <ul>
              <li>
                <strong>Technical Analysis Strategies:</strong> Based on historical price patterns that 
                may not repeat.
              </li>
              <li>
                <strong>Momentum Strategies:</strong> Can result in significant losses when trends reverse 
                suddenly.
              </li>
              <li>
                <strong>Breakout Strategies:</strong> False breakouts are common and can lead to whipsaws.
              </li>
              <li>
                <strong>Mean Reversion Strategies:</strong> Securities may not revert to mean for extended 
                periods.
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Backtesting Limitations</h2>
            <div className="highlight-box info">
              <Info size={20} />
              <span>
                Backtest results are hypothetical and do not represent actual trading. They do not account 
                for market impact, slippage, liquidity constraints, and other real-world factors.
              </span>
            </div>
            <ul>
              <li>Transaction costs shown may not reflect actual brokerage fees</li>
              <li>Assumes perfect execution at historical prices</li>
              <li>Does not account for market impact of large orders</li>
              <li>May not reflect real-time data delays or gaps</li>
              <li>Historical data may contain errors or survivorship bias</li>
            </ul>
          </section>

          <section>
            <h2>6. No Investment Advice</h2>
            <p className="highlight-box info">
              <Shield size={20} />
              <span>
                QuantWealth AI does not provide investment advice. All information, insights, and analysis 
                provided are for educational and informational purposes only.
              </span>
            </p>
            <ul>
              <li>We are not SEBI-registered investment advisors</li>
              <li>Our AI recommendations are not personalized advice</li>
              <li>We do not consider your individual financial situation</li>
              <li>Always consult with a qualified financial advisor before making investment decisions</li>
            </ul>
          </section>

          <section>
            <h2>7. Risk Management Recommendations</h2>
            <p>To manage trading risks effectively:</p>
            <ul>
              <li>
                <strong>Diversification:</strong> Don't put all your capital in a single security or strategy
              </li>
              <li>
                <strong>Position Sizing:</strong> Limit individual positions to a small percentage of total capital
              </li>
              <li>
                <strong>Stop Losses:</strong> Use stop-loss orders to limit potential losses
              </li>
              <li>
                <strong>Risk Capital Only:</strong> Only trade with money you can afford to lose completely
              </li>
              <li>
                <strong>Education:</strong> Continuously learn about markets and risk management techniques</li>
              <li>
                <strong>Paper Trading:</strong> Test strategies extensively before risking real capital
              </li>
              <li>
                <strong>Regular Review:</strong> Monitor and adjust strategies based on performance
              </li>
            </ul>
          </section>

          <section>
            <h2>8. SEBI and Regulatory Compliance</h2>
            <p>
              Users of QuantWealth AI should be aware of their obligations under SEBI regulations:
            </p>
            <ul>
              <li>SEBI's Investor Charter and guidelines for algorithmic trading</li>
              <li>Mandatory disclosures for pattern day traders</li>
              <li>KYC requirements for brokerage account linking</li>
              <li>Insider trading prohibitions</li>
              <li>Short selling regulations and uptick rules</li>
              <li>Margin trading requirements and interest charges</li>
            </ul>
          </section>

          <section>
            <h2>9. No Guarantees</h2>
            <p>
              QuantWealth AI makes no representations or warranties regarding:
            </p>
            <ul>
              <li>The accuracy or completeness of any data or analysis</li>
              <li>The profitability of any strategy or recommendation</li>
              <li>Future performance based on historical results</li>
              <li>The suitability of any strategy for your specific situation</li>
              <li>Uninterrupted or error-free operation of the platform</li>
            </ul>
          </section>

          <section>
            <h2>10. Acknowledgment</h2>
            <p>
              By using QuantWealth AI, you acknowledge and confirm that:
            </p>
            <ul>
              <li>You have read, understood, and accept all risks disclosed in this document</li>
              <li>You have the financial capacity to bear trading losses</li>
              <li>You will not hold QuantWealth AI liable for any trading losses</li>
              <li>You will make independent trading decisions based on your own research</li>
              <li>You understand that trading involves substantial risk of loss</li>
            </ul>
          </section>
        </div>

        <div className="legal-footer">
          <div className="highlight-box danger">
            <AlertTriangle size={24} />
            <div>
              <h3>Final Warning</h3>
              <p>
                Trading is inherently risky. Never trade with money you cannot afford to lose. 
                The high degree of leverage available can work against you as well as for you. 
                Before deciding to trade, carefully consider your investment objectives, experience 
                level, and risk tolerance.
              </p>
            </div>
          </div>
          <div className="legal-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclosure;
