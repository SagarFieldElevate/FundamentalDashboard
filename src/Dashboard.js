import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Controls from './components/Controls';
import StatsGrid from './components/StatsGrid';
import ActivityChart from './components/ActivityChart';
import CryptoGrid from './components/CryptoGrid';
import ProjectModal from './components/ProjectModal';
import { cryptoProjects } from './data/cryptoProjects';
import { fetchCombinedProjectData, clearCombinedCache } from './services/combinedDataService';

function Dashboard() {
  const [projectCommitData, setProjectCommitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [filterBy, setFilterBy] = useState('all');
  const [timeRange, setTimeRange] = useState(7);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  useEffect(() => {
    fetchAllCommitData();
  }, [timeRange]); // Refetch when time range changes

  const fetchAllCommitData = async () => {
    setLoading(true);
    setLoadingStatus('Fetching crypto project data...');
    
    try {
      const data = await fetchCombinedProjectData(cryptoProjects, timeRange);
      
      console.log('Received data:', data.slice(0, 5)); // Log first 5 results
      console.log('Total projects loaded:', data.length);
      
      setProjectCommitData(data);
      setLoadingStatus('');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadingStatus('Error loading data. Please try again.');
      setLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleClearCache = () => {
    clearCombinedCache();
    setProjectCommitData([]);
    setLoadingStatus('Cache cleared. Reloading...');
    fetchAllCommitData();
  };

  const getFilteredProjects = () => {
    let filtered = projectCommitData.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(p => {
        switch (filterBy) {
          case 'top50':
            return p.rank <= 50;
          case 'altcoins':
            return p.rank > 50;
          case 'defi':
            const defiProjects = ['AAVE', 'UNI', 'MKR', 'CRV', 'COMP', 'SNX', 'SUSHI', 'YFI', 'BAL', 'ALPHA', '1INCH', 'ALCX'];
            return defiProjects.includes(p.symbol);
          case 'layer1':
            const layer1Projects = ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX', 'DOT', 'ATOM', 'NEAR', 'ALGO', 'FTM', 'S'];
            return layer1Projects.includes(p.symbol);
          case 'layer2':
            const layer2Projects = ['ARB', 'OP', 'POL', 'MNT', 'IMX'];
            return layer2Projects.includes(p.symbol);
          default:
            return true;
        }
      });
    }

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'commits-desc':
          return b.commits - a.commits;
        case 'commits-asc':
          return a.commits - b.commits;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'marketcap':
          return b.marketCap - a.marketCap;
        default: // rank
          return a.rank - b.rank;
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  return (
    <div className="App">
      <Header />
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/analytics">Crypto Analytics</a>
        <a href="/economic">Economic Analytics</a>
      </div>
      <div className="container">
        {loadingStatus && (
          <div className="loading-status">
            {loadingStatus}
            <div className="loading-info">
              Fetching real developer data from CoinGecko API.
              This may take a few minutes due to rate limits.
              Data is cached for 24 hours.
              {projectCommitData.some(p => p.error) && (
                <div style={{ marginTop: '10px', color: '#ef4444' }}>
                  Some projects failed to load. Try clearing cache and refreshing.
                </div>
              )}
            </div>
          </div>
        )}
        <Controls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onRefresh={fetchAllCommitData}
          onClearCache={handleClearCache}
        />
        <StatsGrid projects={projectCommitData} />
        <ActivityChart projects={projectCommitData} />
        <CryptoGrid
          projects={filteredProjects}
          loading={false}
          onProjectClick={handleProjectClick}
          timeRange={timeRange}
        />
      </div>
      {modalOpen && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;