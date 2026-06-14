import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Cookie } from 'lucide-react';
import './LegalPages.css';

const PrivacyPolicy = () => {
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
          <Shield className="legal-icon" size={48} />
          <h1>Privacy Policy</h1>
          <p>Last Updated: January 2024</p>
        </header>

        <div className="legal-body">
          <section>
            <h2>1. Introduction</h2>
            <p>
              At QuantWealth AI, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, store, and protect your personal information when you use our platform. By using QuantWealth AI, 
              you consent to the practices described in this policy.
            </p>
            <p>
              This policy complies with the Information Technology Act, 2000 and the Information Technology 
              (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 
              of India.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Demographic information (age, location)</li>
              <li>Profile information and preferences</li>
              <li>KYC documents (when required for DMAT integration)</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <p>We automatically collect information about how you use our platform:</p>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and features used</li>
              <li>Time spent on different sections</li>
              <li>Backtest and analysis data you generate</li>
              <li>Click patterns and navigation behavior</li>
            </ul>

            <h3>2.3 Trading Data</h3>
            <p>
              When you connect your brokerage account (optional), we may collect:
            </p>
            <ul>
              <li>Portfolio holdings and positions</li>
              <li>Account balance and margin information</li>
              <li>Historical trading data</li>
              <li>Order and transaction history</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul>
              <li><strong>Providing Services:</strong> To operate and maintain the QuantWealth AI platform</li>
              <li><strong>Personalization:</strong> To customize your experience and provide relevant recommendations</li>
              <li><strong>Analysis:</strong> To perform backtesting and generate trading insights</li>
              <li><strong>Communication:</strong> To send you updates, newsletters, and important notices</li>
              <li><strong>Security:</strong> To protect your account and detect fraudulent activity</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Storage and Security</h2>
            <div className="highlight-box info">
              <Lock size={20} />
              <span>
                <strong>Your data security is our priority.</strong> We implement industry-standard security measures 
                including encryption, access controls, and regular security audits.
              </span>
            </div>
            <p>
              All data is stored on secure servers located in India, ensuring compliance with data localization 
              requirements. We use:
            </p>
            <ul>
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Multi-factor authentication for administrative access</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Role-based access controls</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul>
              <li>
                <strong>Service Providers:</strong> Third-party vendors who help us operate the platform 
                (hosting, analytics, payment processing)
              </li>
              <li>
                <strong>Regulatory Authorities:</strong> When required by law or to comply with legal processes
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
              </li>
            </ul>
            <p>
              All third-party service providers are bound by confidentiality agreements and data protection 
              obligations.
            </p>
          </section>

          <section>
            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. These include:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the platform to function</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p>
              You can control cookie settings through your browser preferences. Disabling certain cookies 
              may affect platform functionality.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>Under Indian data protection laws and GDPR (if applicable), you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@quantwealth.ai
            </p>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined 
              in this Privacy Policy, unless a longer retention period is required by law. Typically:
            </p>
            <ul>
              <li>Account information: Retained until account deletion</li>
              <li>Backtest data: Retained for 2 years after creation</li>
              <li>Usage logs: Retained for 1 year</li>
              <li>Payment records: Retained for 7 years (as required by law)</li>
            </ul>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If you believe we have inadvertently collected such information, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              via email or through the platform. The updated policy will be effective immediately upon posting 
              unless otherwise stated.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Data Protection Officer</strong></p>
              <p>QuantWealth AI Technologies Pvt. Ltd.</p>
              <p>Email: privacy@quantwealth.ai</p>
              <p>Address: Mumbai, Maharashtra, India</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <p>
            By using QuantWealth AI, you acknowledge that you have read and understood this Privacy Policy 
            and consent to the collection, use, and disclosure of your information as described herein.
          </p>
          <div className="legal-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/risk">Risk Disclosure</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
