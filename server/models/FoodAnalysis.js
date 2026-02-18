const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  calories: Number,
  sugar: Number,
  fat: Number,
  sodium: Number,
  protein: Number,
  score: Number,
  level: String
}, { timestamps: true });

module.exports = mongoose.model("FoodAnalysis", foodSchema);
