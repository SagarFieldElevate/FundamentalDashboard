import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage2.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-header">
        <div className="logo-section">
          <h1 className="company-name">Field Elevate</h1>
          <p className="tagline">Advanced Crypto Analytics & Intelligence</p>
        </div>
      </div>

      <div className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">
            Crypto Fundamentals Dashboard
          </h2>
          <p className="hero-subtitle">
            Real-time developer activity tracking for 150+ cryptocurrency projects
          </p>
          
          <div className="feature-highlights">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Live GitHub Metrics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>144 Projects Tracked</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Real-time Updates</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Market Data Integration</span>
            </div>
          </div>

          <div className="cta-buttons">
            <Link to="/dashboard" className="cta-button primary">
              Developer Activity
            </Link>
            <Link to="/analytics" className="cta-button secondary">
              Crypto Analytics
            </Link>
            <Link to="/economic" className="cta-button secondary">
              Economic Analytics
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dot red"></div>
              <div className="preview-dot yellow"></div>
              <div className="preview-dot green"></div>
            </div>
            <div className="preview-content">
              <div className="preview-stats">
                <div className="preview-stat">
                  <div className="stat-value">144</div>
                  <div className="stat-label">Projects</div>
                </div>
                <div className="preview-stat">
                  <div className="stat-value">50K+</div>
                  <div className="stat-label">Commits</div>
                </div>
                <div className="preview-stat">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Tracking</div>
                </div>
              </div>
              <div className="preview-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="preview-card"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h3 className="section-title">What We Offer</h3>
        <p className="section-subtitle">
          Real-time analytics and insights for crypto and economic markets
        </p>
        
        <div className="feature-showcase">
          <div className="showcase-card">
            <div className="showcase-icon">📊</div>
            <h4>Crypto Fundamentals</h4>
            <p>Track developer activity for 144+ cryptocurrencies with real-time GitHub metrics</p>
          </div>
          <div className="showcase-card">
            <div className="showcase-icon">🔍</div>
            <h4>On-Chain Analytics</h4>
            <p>9 powerful Dune Analytics queries tracking DeFi, liquidity, and market trends</p>
          </div>
          <div className="showcase-card">
            <div className="showcase-icon">💹</div>
            <h4>Economic Indicators</h4>
            <p>Global economic data including inflation, GDP, exchange rates, and more</p>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Field Elevate © 2025</p>
      </div>
    </div>
  );
};

export default LandingPage;