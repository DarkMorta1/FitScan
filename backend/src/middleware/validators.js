const { body } = require('express-validator');
const { GOALS, ACTIVITY_LEVELS, MEDICAL_CONDITIONS, ALLERGIES, MEAL_TYPES } = require('../utils/constants');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileValidation = [
  body('profile.age').optional().isInt({ min: 13, max: 120 }),
  body('profile.gender').optional().isIn(['Male', 'Female', 'Other']),
  body('profile.height').optional().isFloat({ min: 100, max: 250 }),
  body('profile.weight').optional().isFloat({ min: 30, max: 300 }),
  body('profile.goal').optional().isIn(GOALS),
  body('profile.activityLevel').optional().isIn(ACTIVITY_LEVELS),
  body('profile.dietaryPreference').optional().isIn(['Vegan', 'Vegetarian', 'Non-Vegetarian']),
  body('profile.medicalConditions').optional().isArray(),
  body('profile.medicalConditions.*').optional().isIn(MEDICAL_CONDITIONS),
  body('profile.allergies').optional().isArray(),
  body('profile.allergies.*').optional().isIn(ALLERGIES),
  body('profile.fitnessLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('profile.workoutDays').optional().isInt({ min: 1, max: 6 }),
  body('profile.workoutDurationMinutes').optional().isInt({ min: 15, max: 180 }),
  body('profile.equipment').optional().isArray(),
  body('profile.preferredWorkoutType').optional().isIn(['Strength', 'Cardio', 'Mixed', 'Bodyweight']),
];

const foodValidation = [
  body('name').trim().notEmpty().withMessage('Food name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('calories').isFloat({ min: 0 }),
  body('protein').isFloat({ min: 0 }),
  body('fat').isFloat({ min: 0 }),
  body('carbs').isFloat({ min: 0 }),
];

const mealValidation = [
  body('foodId').notEmpty().withMessage('Food ID is required'),
  body('mealType').isIn(MEAL_TYPES),
];

module.exports = {
  registerValidation,
  loginValidation,
  profileValidation,
  foodValidation,
  mealValidation,
};
