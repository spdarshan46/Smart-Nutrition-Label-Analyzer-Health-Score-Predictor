const Tesseract = require("tesseract.js");

exports.extractText = async (req, res) => {
    try {
        const imagePath = req.file.path;

        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            "eng"
        );

        let cleanedText = text.toLowerCase();
        cleanedText = cleanedText.replace(/%/g, "");
        cleanedText = cleanedText.replace(/\s+/g, " ");

        const caloriesMatch =
            cleanedText.match(/calories\s*(\d+)/) ||
            cleanedText.match(/(\d+)\s*calories/);

        const sugarMatch = cleanedText.match(/sugars?.*?(\d+)\s*g?/);
        const fatMatch = cleanedText.match(/total\s*fat.*?(\d+)\s*g?/);
        const sodiumMatch = cleanedText.match(/sodium.*?(\d+)\s*mg?/);
        const proteinMatch = cleanedText.match(/protein.*?(\d+)\s*g?/);

        const nutritionData = {
            calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
            sugar: sugarMatch ? parseInt(sugarMatch[1]) : 0,
            fat: fatMatch ? parseInt(fatMatch[1]) : 0,
            sodium: sodiumMatch ? parseInt(sodiumMatch[1]) : 0,
            protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
        };

        res.json({
            success: true,
            cleanedText,
            nutritionData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "OCR failed" });
    }
};
