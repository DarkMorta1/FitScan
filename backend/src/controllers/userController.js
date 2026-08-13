const User = require('../models/User');
const AppError = require('../utils/AppError');
const { calculateBMI, calculateDailyCalories, calculateWaterIntake } = require('../utils/nutrition');

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profile } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found.', 404);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profile) {
      user.profile = { ...user.profile?.toObject?.() || user.profile || {}, ...profile };
      user.onboardingComplete = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found.', 404);

    const profile = user.profile || {};
    const bmi = calculateBMI(profile.weight, profile.height);
    const dailyCalories = calculateDailyCalories(profile);
    const waterIntake = calculateWaterIntake(profile.weight);

    res.json({
      success: true,
      user,
      metrics: { bmi, dailyCalories, waterIntake },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, getProfile };
