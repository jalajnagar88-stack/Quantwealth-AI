import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Shield, AlertTriangle, FileText } from 'lucide-react';
import './LegalPages.css';

const TermsOfService = () => {
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
          <Scale className="legal-icon" size={48} />
          <h1>Terms of Service</h1>
          <p>Last Updated: January 2024</p>
        </header>

        <div className="legal-body">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using QuantWealth AI ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services. These terms constitute a legally 
              binding agreement between you and QuantWealth AI Technologies Pvt. Ltd.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              QuantWealth AI provides an AI-powered trading analysis platform that offers:
            </p>
            <ul>
              <li>Strategy backtesting on historical market data</li>
              <li>AI-driven trading insights and analysis</li>
              <li>Portfolio tracking and management tools</li>
              <li>Market news and trend analysis</li>
              <li>Educational resources for traders</li>
            </ul>
            <p>
              <strong>Important:</strong> QuantWealth AI does not execute trades on your behalf. 
              All trading decisions are made solely by you. We are not a brokerage, investment advisor, 
              or portfolio manager.
            </p>
          </section>

          <section>
            <h2>3. Eligibility</h2>
            <p>To use our services, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Be a resident of India (for Indian market features)</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be barred from receiving services under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
          </section>

          <section>
            <h2>4. Account Registration and Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. You agree to:
            </p>
            <ul>
              <li>Create a strong, unique password</li>
              <li>Enable two-factor authentication when available</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Not share your account credentials with anyone</li>
              <li>Not use another user's account without permission</li>
            </ul>
          </section>

          <section>
            <h2>5. Subscription and Payments</h2>
            <p>
              Some features of QuantWealth AI require a paid subscription. By subscribing:
            </p>
            <ul>
              <li>You agree to pay all fees associated with your subscription plan</li>
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>You can cancel your subscription at any time</li>
              <li>No refunds are provided for partial months</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of QuantWealth AI are owned by us and protected by 
              Indian and international copyright, trademark, and other intellectual property laws. You may not:
            </p>
            <ul>
              <li>Copy, modify, or create derivative works of our platform</li>
              <li>Reverse engineer or attempt to extract our source code</li>
              <li>Use our trademarks without written permission</li>
              <li>Scrape or systematically collect data from our platform</li>
              <li>Use our AI algorithms for commercial purposes without license</li>
            </ul>
          </section>

          <section>
            <h2>7. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any illegal purpose</li>
              <li>Interfere with or disrupt our servers or networks</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Use automated systems to access the platform without permission</li>
              <li>Upload viruses, malware, or other malicious code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2>8. Disclaimer of Warranties</h2>
            <p className="highlight-box warning">
              <AlertTriangle size={20} />
              <span>
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
                WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
              </span>
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, QuantWealth AI shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising out of or relating to your use 
              of the platform. This includes but is not limited to:
            </p>
            <ul>
              <li>Trading losses or investment decisions</li>
              <li>Loss of profits, revenue, or data</li>
              <li>Business interruption</li>
              <li>Personal injury or property damage</li>
            </ul>
          </section>

          <section>
            <h2>10. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of 
              the courts in Mumbai, Maharashtra.
            </p>
          </section>

          <section>
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any material 
              changes via email or through the platform. Your continued use of the platform after such 
              changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>QuantWealth AI Technologies Pvt. Ltd.</strong></p>
              <p>Email: legal@quantwealth.ai</p>
              <p>Address: Mumbai, Maharashtra, India</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <p>By using QuantWealth AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          <div className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/risk">Risk Disclosure</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
