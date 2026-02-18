import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const { progress } = useSocket();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    averageScore: 0,
    healthy: 0,
    moderate: 0,
    unhealthy: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/analysis/history?limit=5');
      const analyses = res.data.analyses;
      setRecentAnalyses(analyses);

      // Calculate stats
      const total = res.data.total;
      const avgScore = analyses.reduce((acc, curr) => acc + curr.healthScore, 0) / (analyses.length || 1);
      const healthy = analyses.filter(a => a.healthLevel === 'Healthy').length;
      const moderate = analyses.filter(a => a.healthLevel === 'Moderate').length;
      const unhealthy = analyses.filter(a => a.healthLevel === 'Unhealthy').length;

      setStats({
        total,
        averageScore: Math.round(avgScore),
        healthy,
        moderate,
        unhealthy
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const chartData = {
    labels: recentAnalyses.map(a => new Date(a.createdAt).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: 'Health Score',
        data: recentAnalyses.map(a => a.healthScore).reverse(),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Health Score Trend'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Track your nutrition and make healthier choices</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-chart-line stat-icon"></i>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Analyses</p>
          </div>
        </div>

        <div className="stat-card">
          <i className="fas fa-star stat-icon"></i>
          <div className="stat-info">
            <h3>{stats.averageScore}</h3>
            <p>Avg. Health Score</p>
          </div>
        </div>

        <div className="stat-card healthy">
          <i className="fas fa-check-circle stat-icon"></i>
          <div className="stat-info">
            <h3>{stats.healthy}</h3>
            <p>Healthy Items</p>
          </div>
        </div>

        <div className="stat-card moderate">
          <i className="fas fa-exclamation-circle stat-icon"></i>
          <div className="stat-info">
            <h3>{stats.moderate}</h3>
            <p>Moderate Items</p>
          </div>
        </div>

        <div className="stat-card unhealthy">
          <i className="fas fa-times-circle stat-icon"></i>
          <div className="stat-info">
            <h3>{stats.unhealthy}</h3>
            <p>Unhealthy Items</p>
          </div>
        </div>
      </div>

      {progress > 0 && (
        <div className="live-analysis-indicator">
          <div className="pulse"></div>
          <span>Analysis in progress... {progress}%</span>
        </div>
      )}

      <div className="dashboard-content">
        {recentAnalyses.length > 0 && (
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        <div className="recent-analyses">
          <h3>Recent Analyses</h3>
          <div className="analyses-list">
            {recentAnalyses.map(analysis => (
              <div key={analysis._id} className="analysis-item">
                <img src={analysis.imageUrl} alt="Nutrition label" />
                <div className="analysis-details">
                  <div className="analysis-score" style={{ color: getScoreColor(analysis.healthScore) }}>
                    Score: {analysis.healthScore}
                  </div>
                  <div className="analysis-date">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getScoreColor = (score) => {
  if (score >= 80) return '#4caf50';
  if (score >= 50) return '#ff9800';
  return '#f44336';
};

export default Dashboard;