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

        // Calories (both formats: "calories 200" OR "200 calories")
        const caloriesMatch =
            cleanedText.match(/calories\s*(\d+)/) ||
            cleanedText.match(/(\d+)\s*calories/);

        // Sugar (handles: sugars 10g, total sugars less than 1g, sugar10g)
        const sugarMatch = cleanedText.match(/sugars?.*?(\d+)\s*g?/);

        // Fat (handles total fat 10g, fat10g)
        const fatMatch = cleanedText.match(/total\s*fat.*?(\d+)\s*g?/);

        // Sodium (handles sodium 120mg, sodium120mg)
        const sodiumMatch = cleanedText.match(/sodium.*?(\d+)\s*mg?/);

        // Protein (handles protein 5g, protein5g)
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
