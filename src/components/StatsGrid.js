import React from 'react';
import './StatsGrid.css';

const StatsGrid = ({ projects }) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.commits > 0).length;
  const totalCommits = projects.reduce((sum, p) => sum + (p.commits || 0), 0);
  const avgDevScore = projects.length > 0 ? 
    Math.round(projects.reduce((sum, p) => sum + (p.devScore || 0), 0) / projects.length) : 0;
  
  // Calculate high dev activity projects (score > 70)
  const highDevActivity = projects.filter(p => p.devScore > 70).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{totalProjects}</div>
        <div className="stat-label">Total Projects</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{activeProjects}</div>
        <div className="stat-label">Active Projects</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{highDevActivity}</div>
        <div className="stat-label">High Dev Activity</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{avgDevScore}</div>
        <div className="stat-label">Avg Dev Score</div>
      </div>
    </div>
  );
};

export default StatsGrid;