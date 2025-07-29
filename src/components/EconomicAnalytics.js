import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { fetchSpecificQueries, processQueryData, clearDuneCache, ECONOMIC_QUERIES } from '../services/duneService';
import './EconomicAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const EconomicAnalytics = () => {
  const [queries, setQueries] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    fetchEconomicData();
  }, []);

  const fetchEconomicData = async () => {
    setLoading(true);
    try {
      const data = await fetchSpecificQueries(ECONOMIC_QUERIES);
      setQueries(data);
      
      // Process each query's data
      const processedQueries = {};
      Object.keys(data).forEach(queryId => {
        if (data[queryId].data) {
          processedQueries[queryId] = {
            ...data[queryId],
            processed: processQueryData(queryId, data[queryId].data)
          };
        } else {
          processedQueries[queryId] = data[queryId];
        }
      });
      
      setQueries(processedQueries);
    } catch (error) {
      console.error('Error fetching economic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    clearDuneCache();
    fetchEconomicData();
  };

  const renderChart = (query) => {
    if (!query.processed || !query.processed.chartData) {
      return <div className="no-data">No data available</div>;
    }

    const chartData = query.processed.chartData;
    
    // Base options with better formatting
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#cbd5e0',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          titleColor: '#f7fafc',
          bodyColor: '#cbd5e0',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              
              const value = context.parsed.y;
              const unit = context.dataset.unit;
              
              // Format based on unit type
              if (unit === 'billions') {
                label += '$' + (value / 1000000000).toFixed(2) + 'B';
              } else if (unit === 'millions') {
                label += '$' + (value / 1000000).toFixed(2) + 'M';
              } else if (unit === 'thousands') {
                label += '$' + (value / 1000).toFixed(0) + 'K';
              } else if (unit === 'percent') {
                label += value.toFixed(2) + '%';
              } else if (unit === 'dollars') {
                label += '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              } else {
                label += value.toLocaleString();
              }
              
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#a0aec0',
            font: {
              size: 11
            }
          },
          grid: { 
            color: 'rgba(34, 197, 94, 0.06)',
            drawBorder: false
          }
        },
        y: {
          position: 'left',
          ticks: { 
            color: '#a0aec0',
            font: {
              size: 11
            }
          },
          grid: { 
            color: 'rgba(34, 197, 94, 0.06)',
            drawBorder: false
          }
        }
      }
    };
    
    // Add second y-axis if needed
    const options = { ...baseOptions };
    if (chartData.needsDualAxis) {
      options.scales.y1 = {
        position: 'right',
        ticks: { 
          color: '#fbbf24',
          font: {
            size: 11
          }
        },
        grid: { 
          drawOnChartArea: false,
          drawBorder: false
        }
      };
    }

    if (chartData.type === 'line') {
      return <Line data={chartData} options={options} />;
    } else if (chartData.type === 'bar') {
      const barOptions = chartData.indexAxis === 'y' 
        ? { ...options, indexAxis: 'y' }
        : options;
      return <Bar data={chartData} options={barOptions} />;
    } else if (chartData.type === 'doughnut') {
      const doughnutOptions = {
        ...options,
        scales: undefined,
        plugins: {
          ...options.plugins,
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              padding: 15
            }
          }
        }
      };
      return <Doughnut data={chartData} options={doughnutOptions} />;
    } else if (chartData.type === 'table') {
      return (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {chartData.columns.map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.rows.map((row, i) => (
                <tr key={i}>
                  {chartData.columns.map((col, j) => (
                    <td key={j}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <div className="no-data">Unsupported chart type</div>;
  };

  return (
    <div className="economic-analytics-page">
      <div className="analytics-header economic-header">
        <div className="header-content">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Economic Analytics Dashboard</h1>
          <p className="subtitle">Global economic indicators and market trends</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-button economic">
            Refresh Data
          </button>
          <Link to="/analytics" className="nav-button">
            Crypto Analytics
          </Link>
          <Link to="/dashboard" className="nav-button">
            Fundamentals
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner economic"></div>
          <p>Fetching economic data...</p>
        </div>
      ) : (
        <>
          <div className="economic-overview">
            <div className="overview-card">
              <h3>Market Overview</h3>
              <p>Real-time global economic indicators</p>
            </div>
          </div>

          <div className="query-grid economic-grid">
            {Object.keys(queries).map(queryId => {
              const query = queries[queryId];
              return (
                <div key={queryId} className="query-card economic-card">
                  <div className="query-header">
                    <h3>{query.name}</h3>
                    <span className="query-id economic">Query #{queryId}</span>
                  </div>
                  
                  {query.error ? (
                    <div className="error-message">
                      Failed to load: {query.error}
                    </div>
                  ) : (
                    <div className="chart-container economic-chart">
                      {renderChart(query)}
                    </div>
                  )}
                  
                  <button 
                    className="view-details economic-btn"
                    onClick={() => setSelectedQuery(query)}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          {selectedQuery && (
            <div className="modal-overlay" onClick={() => setSelectedQuery(null)}>
              <div className="modal-content economic-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedQuery.name}</h2>
                  <button 
                    className="close-button"
                    onClick={() => setSelectedQuery(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  {selectedQuery.processed && (
                    <>
                      <div className="data-info economic-info">
                        <p>Total Rows: {selectedQuery.processed.rows.length}</p>
                        <p>Columns: {selectedQuery.processed.columns.join(', ')}</p>
                      </div>
                      <div className="large-chart-container">
                        {renderChart(selectedQuery)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EconomicAnalytics;