import React from 'react';
import './ProjectModal.css';
import { projectDescriptions } from '../data/projectDescriptions';

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  const description = projectDescriptions[project.symbol] || {
    description: "No detailed description available yet.",
    useCase: "Various blockchain applications",
    keyFeatures: ["Blockchain technology", "Decentralized", "Cryptocurrency"],
    category: "Cryptocurrency"
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const openGitHub = () => {
    if (project.repo) {
      window.open(`https://github.com/${project.repo}`, '_blank');
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <div className="modal-header">
          <h2 className="modal-title">{project.name}</h2>
          <span className="modal-symbol">{project.symbol}</span>
          <span className="category-badge">{description.category}</span>
        </div>
        
        <div className="description-section">
          <h3>Overview</h3>
          <p className="description-text">{description.description}</p>
        </div>
        
        <div className="description-section">
          <h3>Use Cases</h3>
          <p className="description-text">{description.useCase}</p>
        </div>
        
        <div className="description-section">
          <h3>Key Features</h3>
          <ul className="feature-list">
            {description.keyFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Market Cap</div>
            <div className="info-value">${formatNumber(project.marketCap)}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Rank</div>
            <div className="info-value">#{project.rank}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Commits</div>
            <div className="info-value">{project.commits}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Contributors</div>
            <div className="info-value">{project.contributors}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Stars</div>
            <div className="info-value">{project.stars || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Forks</div>
            <div className="info-value">{project.forks || 'N/A'}</div>
          </div>
        </div>
        
        <div className="modal-actions">
          {project.repo && (
            <button onClick={openGitHub}>View GitHub</button>
          )}
          <button onClick={onClose} className="secondary-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;