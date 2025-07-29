import React from 'react';
import './CryptoCard.css';

const CryptoCard = ({ project, onClick, timeRange }) => {
  if (!project.repo) {
    return (
      <div className="crypto-card" onClick={onClick}>
        <div className="rank-badge">#{project.rank}</div>
        <div className="crypto-header">
          <div className="crypto-name">{project.name}</div>
          <div className="crypto-symbol">{project.symbol}</div>
        </div>
        <div className="no-repo">No GitHub repository available</div>
      </div>
    );
  }
  
  if (project.loading) {
    return (
      <div className="crypto-card loading-card" onClick={onClick}>
        <div className="rank-badge">#{project.rank}</div>
        <div className="crypto-header">
          <div className="crypto-name">{project.name}</div>
          <div className="crypto-symbol">{project.symbol}</div>
        </div>
        <div className="loading-message">Loading GitHub data...</div>
      </div>
    );
  }
  
  const lastUpdated = project.lastUpdated ? 
    new Date(project.lastUpdated).toLocaleDateString() : 'N/A';
  
  // Add indicators
  const growthIndicator = project.devScore > 70 ? 
    <span className="growth-indicator">⭐ High Dev Activity</span> : null;
  
  const priceChangeColor = project.priceChange24h > 0 ? '#10b981' : '#ef4444';
  
  return (
    <div className="crypto-card" onClick={onClick}>
      <div className="rank-badge">#{project.rank}</div>
      <div className="crypto-header">
        <div className="crypto-name">
          {project.name} {growthIndicator}
        </div>
        <div className="crypto-symbol">{project.symbol}</div>
      </div>
      {project.price !== undefined && (
        <div style={{ margin: '10px 0', fontSize: '0.9em' }}>
          <span style={{ color: '#94a3b8' }}>Price: </span>
          <span style={{ fontWeight: 'bold' }}>${project.price?.toLocaleString() || '0'}</span>
          <span style={{ color: priceChangeColor, marginLeft: '10px' }}>
            {project.priceChange24h > 0 ? '▲' : '▼'} {Math.abs(project.priceChange24h || 0).toFixed(2)}%
          </span>
        </div>
      )}
      <div className="commit-info">
        <div className="commit-stat">
          <div className="commit-number">{project.commits || 0}</div>
          <div className="commit-label">Commits ({timeRange || 7}d)</div>
        </div>
        <div className="commit-stat">
          <div className="commit-number">{project.contributors || 0}</div>
          <div className="commit-label">Contributors</div>
        </div>
        <div className="commit-stat">
          <div className="commit-number">{project.stars || 0}</div>
          <div className="commit-label">Stars</div>
        </div>
        <div className="commit-stat">
          <div className="commit-number">{project.forks || 0}</div>
          <div className="commit-label">Forks</div>
        </div>
        <div className="commit-stat">
          <div className="commit-number">{project.pullRequests || 0}</div>
          <div className="commit-label">PRs Merged</div>
        </div>
        <div className="commit-stat">
          <div className="commit-number">{Math.round(project.devScore || 0)}</div>
          <div className="commit-label">Dev Score</div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;