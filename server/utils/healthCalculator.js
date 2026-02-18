class HealthCalculator {
  static calculateHealthScore(data) {
    let score = 100;
    const { calories, sugar, fat, sodium, protein, fiber } = data;

    // Sugar deduction (max -30)
    if (sugar > 10) score -= Math.min(30, (sugar - 10) * 1.5);
    else if (sugar < 5) score += 5;

    // Fat deduction (max -25)
    if (fat > 15) score -= Math.min(25, (fat - 15) * 2);
    else if (fat < 5) score += 5;

    // Sodium deduction (max -25)
    if (sodium > 400) score -= Math.min(25, (sodium - 400) / 20);
    else if (sodium < 150) score += 5;

    // Protein bonus (max +15)
    if (protein > 10) score += Math.min(15, (protein - 10) * 1.5);

    // Fiber bonus (max +10)
    if (fiber > 3) score += Math.min(10, (fiber - 3) * 2);

    // Calorie consideration
    if (calories > 400) score -= 10;
    else if (calories < 200) score += 5;

    // Ensure score stays within 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static getHealthLevel(score) {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Moderate';
    return 'Unhealthy';
  }

  static generateRecommendations(data, score) {
    const recommendations = [];
    
    if (data.sugar > 10) {
      recommendations.push('High sugar content. Consider limiting added sugars.');
    }
    
    if (data.sodium > 400) {
      recommendations.push('High sodium levels. Watch your daily salt intake.');
    }
    
    if (data.fat > 15) {
      recommendations.push('Contains high fat. Choose leaner alternatives when possible.');
    }
    
    if (data.protein < 5 && score < 70) {
      recommendations.push('Low protein. Consider pairing with a protein-rich food.');
    }
    
    if (data.fiber < 2) {
      recommendations.push('Low in fiber. Add vegetables or whole grains to your meal.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('This item fits well within a balanced diet!');
    }
    
    return recommendations;
  }
}

module.exports = HealthCalculator;