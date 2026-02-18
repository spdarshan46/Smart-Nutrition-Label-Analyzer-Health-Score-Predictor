import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Analysis.css';

const Analysis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const { progress, analysisStage } = useSocket();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880 // 5MB
  });

  const handleAnalyze = async () => {
    if (!image) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    setAnalyzing(true);
    
    try {
      const res = await axios.post('/api/analysis/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(res.data.analysis);
      toast.success('Analysis completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h1>Smart Nutrition Label Analyzer</h1>
        <p>Upload a nutrition label image to get instant health score and recommendations</p>
      </div>

      <div className="analysis-content">
        <div className="upload-section">
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'active' : ''} ${preview ? 'has-image' : ''}`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                <p>Drag & drop a nutrition label image here, or click to select</p>
                <small>Supports: JPEG, PNG, GIF (Max 5MB)</small>
              </>
            )}
          </div>

          {preview && (
            <div className="image-actions">
              <button 
                className="analyze-btn" 
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Label'}
              </button>
              <button 
                className="clear-btn"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                  setResult(null);
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {analyzing && (
            <motion.div 
              className="progress-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-stage">{analysisStage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div 
              className="result-section"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="result-header">
                <h2>Analysis Results</h2>
                <div 
                  className="health-score"
                  style={{ color: getHealthColor(result.healthScore) }}
                >
                  <div className="score-circle">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getHealthColor(result.healthScore)}
                        strokeWidth="3"
                        strokeDasharray={`${result.healthScore}, 100`}
                      />
                    </svg>
                    <span className="score-value">{result.healthScore}</span>
                  </div>
                  <div className="health-level">{result.healthLevel}</div>
                </div>
              </div>

              <div className="nutrition-grid">
                {Object.entries(result.extractedData).map(([key, value]) => {
                  if (key === 'nutrients' || key === 'servingSize' || !value) return null;
                  if (typeof value === 'object') return null;
                  
                  const icons = {
                    calories: '🔥',
                    sugar: '🍬',
                    fat: '🥑',
                    sodium: '🧂',
                    protein: '🥩',
                    fiber: '🌾',
                    carbohydrates: '🍚'
                  };

                  const units = {
                    calories: 'kcal',
                    sugar: 'g',
                    fat: 'g',
                    sodium: 'mg',
                    protein: 'g',
                    fiber: 'g',
                    carbohydrates: 'g'
                  };

                  return (
                    <div key={key} className="nutrition-item">
                      <span className="nutrition-icon">{icons[key] || '📊'}</span>
                      <span className="nutrition-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="nutrition-value">{value} {units[key] || ''}</span>
                    </div>
                  );
                })}
              </div>

              <div className="recommendations-section">
                <h3>Recommendations</h3>
                <ul className="recommendations-list">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>
                      <i className="fas fa-check-circle"></i>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analysis;