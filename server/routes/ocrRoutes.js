const express = require("express");
const router = express.Router();
const multer = require("multer");
const { extractText } = require("../controllers/ocrController");
const FoodAnalysis = require("../models/FoodAnalysis");

// File Upload Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload + OCR
router.post("/upload", upload.single("image"), extractText);

// 🔥 History Route
router.get("/history", async (req, res) => {
  const data = await FoodAnalysis.find().sort({ createdAt: -1 });
  res.json(data);
});

module.exports = router;
