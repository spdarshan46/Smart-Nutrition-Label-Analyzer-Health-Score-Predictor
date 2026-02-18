const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const OCRProcessor = require('../utils/ocrProcessor');
const HealthCalculator = require('../utils/healthCalculator');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Analyze nutrition label
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  const io = req.app.get('io');
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Emit progress
    io.emit('analysis-progress', { 
      userId: req.user.id, 
      progress: 10, 
      stage: 'Processing image...' 
    });

    // Extract text using OCR
    const extractedData = await OCRProcessor.extractText(req.file.path);
    
    io.emit('analysis-progress', { 
      userId: req.user.id, 
      progress: 60, 
      stage: 'Calculating health score...' 
    });

    // Calculate health score
    const healthScore = HealthCalculator.calculateHealthScore(extractedData);
    const healthLevel = HealthCalculator.getHealthLevel(healthScore);
    const recommendations = HealthCalculator.generateRecommendations(extractedData, healthScore);

    // Save analysis to database
    const analysis = new Analysis({
      user: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      originalImageName: req.file.originalname,
      extractedData,
      healthScore,
      healthLevel,
      recommendations
    });

    await analysis.save();

    // Update user's total analyses count
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalAnalyses: 1 } });

    io.emit('analysis-progress', { 
      userId: req.user.id, 
      progress: 100, 
      stage: 'Complete!',
      analysisId: analysis._id
    });

    // Emit real-time update to user
    io.emit('new-analysis', {
      userId: req.user.id,
      analysis: {
        id: analysis._id,
        healthScore,
        healthLevel,
        createdAt: analysis.createdAt
      }
    });

    res.json({
      success: true,
      analysis: {
        id: analysis._id,
        extractedData,
        healthScore,
        healthLevel,
        recommendations,
        imageUrl: analysis.imageUrl
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    io.emit('analysis-error', { 
      userId: req.user.id, 
      error: error.message 
    });
    res.status(500).json({ message: 'Error analyzing image', error: error.message });
  }
});

// Get user's analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Analysis.countDocuments({ user: req.user.id });

    res.json({
      analyses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Get single analysis
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ message: 'Error fetching analysis' });
  }
});

// Delete analysis
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', analysis.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ message: 'Error deleting analysis' });
  }
});

module.exports = router;