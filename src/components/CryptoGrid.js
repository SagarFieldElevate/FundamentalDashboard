import React from 'react';
import CryptoCard from './CryptoCard';
import './CryptoGrid.css';

const CryptoGrid = ({ projects, loading, onProjectClick, timeRange }) => {
  if (loading) {
    return (
      <div className="crypto-grid">
        <div className="loading">
          <span className="loading-dots">Loading commit data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-grid">
      {projects.map((project) => (
        <CryptoCard
          key={project.symbol}
          project={project}
          onClick={() => onProjectClick(project)}
          timeRange={timeRange}
        />
      ))}
    </div>
  );
};

export default CryptoGrid;