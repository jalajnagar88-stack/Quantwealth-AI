import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  const location = useLocation();
  return (
    <div className="notfound-page">
      <div className="notfound-code">404</div>
      <h1>Page not found</h1>
      <p>The page <code>{location.pathname}</code> doesn't exist yet.</p>
      <div className="notfound-actions">
        <Link to="/" className="nf-btn primary"><Home size={16}/> Go Home</Link>
        <button className="nf-btn secondary" onClick={() => window.history.back()}><ArrowLeft size={16}/> Go Back</button>
      </div>
    </div>
  );
}
