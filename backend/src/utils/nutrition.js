const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

const calculateDailyCalories = (profile) => {
  const { age, gender, weight, height, activityLevel, goal } = profile;
  if (!age || !weight || !height) return 2000;

  let bmr;
  if (gender === 'Male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Active: 1.725,
    'Very Active': 1.9,
  };

  let calories = bmr * (activityMultipliers[activityLevel] || 1.55);

  if (goal === 'Bulking') calories += 300;
  if (goal === 'Cutting') calories -= 400;

  return Math.round(calories);
};

const calculateWaterIntake = (weightKg) => {
  if (!weightKg) return 2.5;
  return Math.round((weightKg * 0.033) * 10) / 10;
};

const mapProfileToAI = (profile, food) => ({
  Age: profile.age,
  BMI: calculateBMI(profile.weight, profile.height),
  Goal: profile.goal,
  Activity_Level: profile.activityLevel,
  Diabetes: profile.medicalConditions?.includes('Diabetes') ? 1 : 0,
  Hypertension: profile.medicalConditions?.includes('Hypertension') ? 1 : 0,
  High_Cholesterol: profile.medicalConditions?.includes('High Cholesterol') ? 1 : 0,
  Calories: food.calories,
  Protein: food.protein,
  Fat: food.fat,
  Carbs: food.carbs,
  Sugar: food.sugar,
  Fiber: food.fiber,
  Sodium: food.sodium,
  Cholesterol: food.cholesterol,
});

const generateRiskReasons = (food, prediction) => {
  const reasons = [];
  if (food.calories > 500) reasons.push('High Calories');
  if (food.fat > 20) reasons.push('High Fat');
  if (food.sugar > 15) reasons.push('High Sugar');
  if (food.sodium > 600) reasons.push('High Sodium');
  if (food.cholesterol > 100) reasons.push('High Cholesterol');
  if (food.carbs > 60) reasons.push('High Carbs');

  if (reasons.length === 0 && prediction !== 'Safe') {
    reasons.push('Nutritional profile mismatch with your health goals');
  }

  return reasons.slice(0, 4);
};

const isAnimalDerivedFood = (food) => {
  const name = (food.name || '').toLowerCase();
  const category = (food.category || '').toLowerCase();
  const keywords = [
    'chicken',
    'beef',
    'pork',
    'mutton',
    'lamb',
    'fish',
    'salmon',
    'tuna',
    'shrimp',
    'prawn',
    'crab',
    'lobster',
    'bacon',
    'ham',
    'turkey',
    'duck',
    'meat',
    'sausage',
    'pepperoni',
    'bbq',
    'steak',
    'burger',
  ];
  return keywords.some((keyword) => name.includes(keyword) || category.includes(keyword));
};

const isVegetarianFood = (food) => {
  const name = (food.name || '').toLowerCase();
  const category = (food.category || '').toLowerCase();
  const nonVegKeywords = ['chicken', 'beef', 'pork', 'mutton', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'bacon', 'ham', 'turkey', 'duck', 'meat', 'sausage', 'pepperoni', 'steak'];
  return nonVegKeywords.some((keyword) => name.includes(keyword) || category.includes(keyword));
};

const getDietaryWarnings = (profile, food) => {
  const warnings = [];
  const diet = profile.dietaryPreference || 'Non-Vegetarian';

  if (diet === 'Vegan') {
    if (isAnimalDerivedFood(food) || /egg|cheese|milk|butter|yogurt|cream|honey/.test((food.name || '').toLowerCase())) {
      warnings.push('Contains animal-derived ingredients and is not suitable for Vegan users');
    }
  }

  if (diet === 'Vegetarian') {
    if (isVegetarianFood(food)) {
      warnings.push('Contains meat or seafood and is not suitable for Vegetarian users');
    }
  }

  return warnings;
};

const getAllergyWarnings = (profile, food) => {
  const warnings = [];
  const allergies = profile.allergies || [];
  const foodAllergens = new Set([...(food.allergens || [])]);

  allergies.forEach((allergy) => {
    if (foodAllergens.has(allergy)) {
      warnings.push(`Contains ${allergy}`);
    }
  });

  return warnings;
};

const getMedicalWarnings = (profile, food) => {
  const warnings = [];
  const conditions = profile.medicalConditions || [];
  const sugar = food.sugar || 0;
  const sodium = food.sodium || 0;
  const fat = food.fat || 0;
  const calories = food.calories || 0;
  const cholesterol = food.cholesterol || 0;

  if (conditions.includes('Diabetes') && sugar > 15) {
    warnings.push('High sugar content may be unsuitable for Diabetes');
  }
  if (conditions.includes('Hypertension') && sodium > 600) {
    warnings.push('High sodium content may be unsuitable for Hypertension');
  }
  if (conditions.includes('High Cholesterol') && cholesterol > 100) {
    warnings.push('High cholesterol content may be unsuitable for High Cholesterol');
  }
  if (conditions.includes('Heart Disease') && sodium > 600) {
    warnings.push('High sodium content may be unsuitable for Heart Disease');
  }
  if (conditions.includes('Kidney Disease') && sodium > 600) {
    warnings.push('High sodium content may be unsuitable for Kidney Disease');
  }
  if (conditions.includes('Liver Disease') && fat > 20) {
    warnings.push('High fat content may be unsuitable for Liver Disease');
  }
  if (conditions.includes('Thyroid Disorder') && calories > 500) {
    warnings.push('High calorie meals may require monitoring with Thyroid Disorder');
  }
  if (conditions.includes('PCOS') && sugar > 15) {
    warnings.push('High sugar content may be unsuitable for PCOS');
  }
  if (conditions.includes('Gastritis') && sodium > 600) {
    warnings.push('High sodium meals may be unsuitable for Gastritis');
  }

  return warnings;
};

const generatePersonalizationReasons = (dietaryWarnings, allergyWarnings, medicalWarnings) => {
  const reasons = [];
  if (dietaryWarnings.length > 0) {
    reasons.push('Food conflicts with the user\'s dietary preference');
  }
  if (allergyWarnings.length > 0) {
    reasons.push('Food contains an ingredient matching the user\'s allergy');
  }
  if (medicalWarnings.length > 0) {
    reasons.push('Food may require caution based on the user\'s medical condition');
  }
  return reasons;
};

const getHealthyAlternatives = (food, allFoods) => {
  return allFoods
    .filter(
      (f) =>
        f._id.toString() !== food._id?.toString() &&
        f.category === food.category &&
        f.calories < food.calories
    )
    .sort((a, b) => a.calories - b.calories)
    .slice(0, 3)
    .map((f) => f.name);
};

module.exports = {
  calculateBMI,
  calculateDailyCalories,
  calculateWaterIntake,
  mapProfileToAI,
  generateRiskReasons,
  getHealthyAlternatives,
  getDietaryWarnings,
  getAllergyWarnings,
  getMedicalWarnings,
  generatePersonalizationReasons,
};
