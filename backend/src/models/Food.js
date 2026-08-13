const mongoose = require('mongoose');
const { ALLERGIES } = require('../utils/constants');

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    sugar: { type: Number, default: 0, min: 0 },
    fiber: { type: Number, default: 0, min: 0 },
    sodium: { type: Number, default: 0, min: 0 },
    cholesterol: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: '' },
    allergens: [{ type: String, enum: ALLERGIES }],
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Food', foodSchema);
