const Food = require('../models/Food');
const Progress = require('../models/Progress');
const MealLog = require('../models/MealLog');
const {
  getMealRecommendations,
  getWorkoutRecommendations,
} = require('../services/recommendationService');
const AppError = require('../utils/AppError');

const getMeals = async (req, res, next) => {
  try {
    if (!req.user.onboardingComplete) {
      throw new AppError('Complete onboarding to get recommendations.', 400);
    }

    const foods = await Food.find().limit(200);
    const recommendations = getMealRecommendations(req.user.profile, foods);

    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

const getWorkouts = async (req, res, next) => {
  try {
    if (!req.user.onboardingComplete) {
      throw new AppError('Complete onboarding to get recommendations.', 400);
    }

    const recommendations = getWorkoutRecommendations(req.user.profile);
    res.json({ success: true, ...recommendations });
  } catch (error) {
    next(error);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const { range = 'weekly' } = req.query;
    const days = range === 'monthly' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [progress, meals] = await Promise.all([
      Progress.find({ userId: req.user._id, date: { $gte: startDate } }).sort({ date: 1 }),
      MealLog.find({ userId: req.user._id, date: { $gte: startDate } }),
    ]);

    res.json({
      success: true,
      range,
      progress,
      mealCompletion: {
        total: meals.length,
        completed: meals.filter((m) => m.completed).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const { weight, calories, waterIntake, workoutsCompleted, mealsCompleted } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const profile = req.user.profile || {};
    const height = profile.height || 170;
    const bmi = weight ? Math.round((weight / ((height / 100) ** 2)) * 10) / 10 : undefined;

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, date: today },
      {
        weight,
        calories,
        waterIntake,
        bmi,
        workoutsCompleted,
        mealsCompleted,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMeals, getWorkouts, getProgress, updateProgress };
