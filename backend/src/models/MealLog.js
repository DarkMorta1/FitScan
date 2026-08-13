const mongoose = require('mongoose');
const { MEAL_TYPES } = require('../utils/constants');

const mealLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    mealType: { type: String, enum: MEAL_TYPES, required: true },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    foodName: String,
    calories: Number,
    completed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealLog', mealLogSchema);
