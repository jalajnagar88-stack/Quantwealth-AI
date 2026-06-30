import React, { useState } from 'react';
import { Bell, Moon, Globe, Shield, Trash2, Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    signalNotifications: true,
    newsDigest: false,
    theme: 'light',
    language: 'en',
    currency: 'USD',
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const save = () => {
    localStorage.setItem('qw_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your notification and display preferences</p>
      </div>

      {saved && <div className="settings-toast">Preferences saved</div>}

      <div className="settings-grid">

        {/* Notifications */}
        <div className="settings-card">
          <div className="settings-card-title"><Bell size={18}/> Notifications</div>
          {[
            { key: 'emailAlerts',           label: 'Email Alerts',           desc: 'Receive alerts for price movements' },
            { key: 'signalNotifications',   label: 'Signal Notifications',   desc: 'Get notified on new AI signals' },
            { key: 'newsDigest',            label: 'Daily News Digest',      desc: 'Morning summary of market news' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="settings-row">
              <div>
                <div className="settings-row-label">{label}</div>
                <div className="settings-row-desc">{desc}</div>
              </div>
              <button
                className={`settings-toggle ${prefs[key] ? 'on' : ''}`}
                onClick={() => toggle(key)}
                aria-label={label}
              >
                <span className="settings-toggle-knob"/>
              </button>
            </div>
          ))}
        </div>

        {/* Display */}
        <div className="settings-card">
          <div className="settings-card-title"><Globe size={18}/> Display</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Language</div>
              <div className="settings-row-desc">Interface language</div>
            </div>
            <select className="settings-select" value={prefs.language} onChange={e => set('language', e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Currency</div>
              <div className="settings-row-desc">Default display currency</div>
            </div>
            <select className="settings-select" value={prefs.currency} onChange={e => set('currency', e.target.value)}>
              <option value="USD">USD $</option>
            </select>
          </div>
        </div>

        {/* Security */}
        <div className="settings-card">
          <div className="settings-card-title"><Shield size={18}/> Privacy & Security</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Session Timeout</div>
              <div className="settings-row-desc">Auto-logout after inactivity</div>
            </div>
            <select className="settings-select" value="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger">
          <div className="settings-card-title"><Trash2 size={18}/> Danger Zone</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Delete Account</div>
              <div className="settings-row-desc">Permanently delete your account and all data</div>
            </div>
            <button className="settings-danger-btn">Delete</button>
          </div>
        </div>

      </div>

      <button className="settings-save-btn" onClick={save}>
        <Save size={16}/> Save Preferences
      </button>
    </div>
  );
};

export default Settings;
