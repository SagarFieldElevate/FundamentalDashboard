import React from 'react';
import './Controls.css';

const Controls = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  timeRange,
  setTimeRange,
  onRefresh,
  onClearCache
}) => {
  return (
    <div className="controls">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name or symbol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="rank">Sort by Rank</option>
        <option value="commits-desc">Most Active (Commits)</option>
        <option value="commits-asc">Least Active (Commits)</option>
        <option value="name">Name (A-Z)</option>
        <option value="marketcap">Market Cap</option>
      </select>
      
      <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
        <option value="all">All Projects</option>
        <option value="top50">Top 50</option>
        <option value="altcoins">Alt Coins (51-150)</option>
        <option value="defi">DeFi Projects</option>
        <option value="layer1">Layer 1 Blockchains</option>
        <option value="layer2">Layer 2 Solutions</option>
      </select>
      
      <select value={timeRange} onChange={(e) => setTimeRange(parseInt(e.target.value))}>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
      
      <button onClick={onRefresh}>Refresh Data</button>
      {onClearCache && (
        <button onClick={onClearCache} style={{ marginLeft: '10px', background: '#ef4444' }}>
          Clear Cache
        </button>
      )}
    </div>
  );
};

export default Controls;