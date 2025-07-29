import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './ActivityChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ActivityChart = ({ projects }) => {
  // Get top 10 most active projects from both categories
  const top50Projects = [...projects]
    .filter(p => p.commits > 0 && p.rank <= 50)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);
  
  const altcoinProjects = [...projects]
    .filter(p => p.commits > 0 && p.rank > 50)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);
  
  const allTopProjects = [...top50Projects, ...altcoinProjects];
  const labels = allTopProjects.map(p => p.name);
  const data = allTopProjects.map(p => p.commits);
  const backgroundColors = allTopProjects.map(p => 
    p.rank <= 50 ? 'rgba(59, 130, 246, 0.6)' : 'rgba(16, 185, 129, 0.6)'
  );
  const borderColors = allTopProjects.map(p => 
    p.rank <= 50 ? 'rgba(59, 130, 246, 1)' : 'rgba(16, 185, 129, 1)'
  );

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Commits (Last Period)',
      data: data,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Most Active Projects (Blue: Top 50, Green: Altcoins)',
        color: '#e0e0e0',
        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const project = allTopProjects[context.dataIndex];
            return `Rank: #${project.rank}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} height={300} />
    </div>
  );
};

export default ActivityChart;