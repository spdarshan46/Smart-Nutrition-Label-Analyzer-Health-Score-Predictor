import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './History.css';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/analysis/history?page=${page}&limit=10`);
      setAnalyses(res.data.analyses);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await axios.delete(`/api/analysis/${id}`);
        fetchHistory();
      } catch (err) {
        console.error('Error deleting analysis:', err);
      }
    }
  };

  const getHealthClass = (level) => {
    switch(level) {
      case 'Healthy': return 'badge-healthy';
      case 'Moderate': return 'badge-moderate';
      case 'Unhealthy': return 'badge-unhealthy';
      default: return '';
    }
  };

  return (
    <div className="history-container">
      <h1>Analysis History</h1>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="history-grid">
            {analyses.map(analysis => (
              <motion.div 
                key={analysis._id}
                className="history-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src={analysis.imageUrl} alt="Nutrition label" />
                <div className="card-content">
                  <div className="card-header">
                    <span className={`badge ${getHealthClass(analysis.healthLevel)}`}>
                      {analysis.healthLevel}
                    </span>
                    <span className="score">Score: {analysis.healthScore}</span>
                  </div>
                  
                  <div className="nutrients-preview">
                    <span>🔥 {analysis.extractedData.calories} kcal</span>
                    <span>🍬 {analysis.extractedData.sugar}g</span>
                    <span>🥑 {analysis.extractedData.fat}g</span>
                  </div>

                  <div className="card-footer">
                    <span className="date">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(analysis._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {analyses.length === 0 && (
            <div className="no-data">
              <p>No analyses yet. Start by uploading a nutrition label!</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;