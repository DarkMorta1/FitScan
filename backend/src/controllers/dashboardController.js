const MealLog = require('../models/MealLog');
const Progress = require('../models/Progress');
const Scan = require('../models/Scan');
const AppError = require('../utils/AppError');
const {
  calculateBMI,
  calculateDailyCalories,
  calculateWaterIntake,
} = require('../utils/nutrition');

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getDashboard = async (req, res, next) => {
  try {
    const user = req.user;
    const profile = user.profile || {};
    const today = startOfDay();

    const [todayMeals, recentScans, todayProgress] = await Promise.all([
      MealLog.find({ userId: user._id, date: { $gte: today, $lte: endOfDay() } }).populate('foodId'),
      Scan.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5),
      Progress.findOne({ userId: user._id, date: today }),
    ]);

    const bmi = calculateBMI(profile.weight, profile.height);
    const dailyCalories = calculateDailyCalories(profile);
    const waterIntake = todayProgress?.waterIntake || calculateWaterIntake(profile.weight);
    const consumedCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

    const nutritionSummary = todayMeals.reduce(
      (acc, meal) => {
        const food = meal.foodId;
        if (food) {
          acc.protein += food.protein || 0;
          acc.fat += food.fat || 0;
          acc.carbs += food.carbs || 0;
        }
        return acc;
      },
      { protein: 0, fat: 0, carbs: 0 }
    );

    const riskSummary = recentScans.reduce(
      (acc, scan) => {
        if (scan.prediction === 'Safe') acc.safe += 1;
        else if (scan.prediction === 'Moderate Risk') acc.moderate += 1;
        else acc.high += 1;
        return acc;
      },
      { safe: 0, moderate: 0, high: 0 }
    );

    res.json({
      success: true,
      dashboard: {
        bmi,
        dailyCalories,
        consumedCalories,
        waterIntake,
        todayMeals,
        nutritionSummary,
        workoutSummary: {
          completed: todayProgress?.workoutsCompleted || 0,
          target: 1,
        },
        weightProgress: profile.weight,
        riskSummary,
        recentScans,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logMeal = async (req, res, next) => {
  try {
    const { foodId, mealType, date } = req.body;
    const Food = require('../models/Food');
    const food = await Food.findById(foodId);
    if (!food) throw new AppError('Food not found.', 404);

    const meal = await MealLog.create({
      userId: req.user._id,
      foodId,
      mealType,
      date: date ? new Date(date) : new Date(),
      foodName: food.name,
      calories: food.calories,
    });

    res.status(201).json({ success: true, meal });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, logMeal };
