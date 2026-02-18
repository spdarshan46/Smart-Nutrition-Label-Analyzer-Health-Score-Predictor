const Tesseract = require("tesseract.js");

exports.extractText = async (req, res) => {
    try {
        const imagePath = req.file.path;

        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            "eng"
        );

        // 🔥 TASK 1: CLEANING
        let cleanedText = text.toLowerCase();

        // Remove special characters but keep letters & numbers
        cleanedText = cleanedText.replace(/[^a-z0-9\s]/g, " ");

        // Remove extra spaces
        cleanedText = cleanedText.replace(/\s+/g, " ");

        // 🔥 EXTRACTION LOGIC
        const caloriesMatch =
            cleanedText.match(/calories\s*(\d+)/) ||
            cleanedText.match(/(\d+)\s*calories/);

        const sugarMatch = cleanedText.match(/sugars?.*?(\d+)/);

        const fatMatch = cleanedText.match(/total\s*fat.*?(\d+)/);

        const sodiumMatch = cleanedText.match(/sodium.*?(\d+)/);

        const proteinMatch = cleanedText.match(/protein.*?(\d+)/);

        const nutritionData = {
            calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
            sugar: sugarMatch ? parseInt(sugarMatch[1]) : 0,
            fat: fatMatch ? parseInt(fatMatch[1]) : 0,
            sodium: sodiumMatch ? parseInt(sodiumMatch[1]) : 0,
            protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
        };

        // 🔥 TASK 2: HEALTH SCORE LOGIC
        let score = 100;

        // Reduce score for unhealthy nutrients
        if (nutritionData.sugar > 10) score -= 20;
        if (nutritionData.fat > 15) score -= 20;
        if (nutritionData.sodium > 300) score -= 20;
        if (nutritionData.calories > 400) score -= 15;

        // Increase score for good protein
        if (nutritionData.protein > 15) score += 10;

        // Keep score between 0–100
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        // Determine health level
        let level = "Healthy";

        if (score < 50) {
            level = "Unhealthy";
        } else if (score < 80) {
            level = "Moderate";
        }

        // 🔥 FINAL RESPONSE
        res.json({
            success: true,
            nutritionData,
            score,
            level
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "OCR failed" });
    }
};
