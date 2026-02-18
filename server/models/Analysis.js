const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  originalImageName: String,
  extractedData: {
    calories: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    servingSize: String,
    nutrients: [{
      name: String,
      value: Number,
      unit: String
    }]
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  healthLevel: {
    type: String,
    enum: ['Healthy', 'Moderate', 'Unhealthy'],
    required: true
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
analysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);