const Tesseract = require('tesseract.js');
const sharp = require('sharp');

class OCRProcessor {
  static async preprocessImage(inputPath, outputPath) {
    try {
      await sharp(inputPath)
        .greyscale()
        .normalize()
        .sharpen()
        .toFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  static async extractText(imagePath) {
    try {
      const processedPath = imagePath.replace(/(\.[\w\d_-]+)$/i, '_processed$1');
      await this.preprocessImage(imagePath, processedPath);
      
      const { data: { text } } = await Tesseract.recognize(
        processedPath,
        'eng',
        {
          logger: m => console.log(m)
        }
      );
      
      return this.parseNutritionData(text);
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  }

  static parseNutritionData(text) {
    const data = {
      calories: 0,
      sugar: 0,
      fat: 0,
      sodium: 0,
      protein: 0,
      fiber: 0,
      carbohydrates: 0,
      servingSize: ''
    };

    // Regular expressions for common nutrition label patterns
    const patterns = {
      calories: /calories?\s*:?\s*(\d+)/i,
      sugar: /sugar\s*:?\s*(\d+\.?\d*)\s*g/i,
      fat: /(?:total\s+)?fat\s*:?\s*(\d+\.?\d*)\s*g/i,
      sodium: /sodium\s*:?\s*(\d+\.?\d*)\s*m?g/i,
      protein: /protein\s*:?\s*(\d+\.?\d*)\s*g/i,
      fiber: /(?:dietary\s+)?fiber\s*:?\s*(\d+\.?\d*)\s*g/i,
      carbohydrates: /(?:total\s+)?carbohydrates?\s*:?\s*(\d+\.?\d*)\s*g/i,
      servingSize: /serving\s+size\s*:?\s*([^,\n]+)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        if (key === 'servingSize') {
          data[key] = match[1].trim();
        } else {
          data[key] = parseFloat(match[1]) || 0;
        }
      }
    }

    // Additional nutrient extraction
    const nutrientPattern = /([a-zA-Z\s]+?)\s*:\s*(\d+\.?\d*)\s*(g|mg|mcg)/gi;
    let match;
    data.nutrients = [];
    
    while ((match = nutrientPattern.exec(text)) !== null) {
      data.nutrients.push({
        name: match[1].trim(),
        value: parseFloat(match[2]),
        unit: match[3]
      });
    }

    return data;
  }
}

module.exports = OCRProcessor;