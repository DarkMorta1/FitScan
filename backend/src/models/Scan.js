const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    imageUrl: { type: String, default: '' },
    detectedFoodName: String,
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    reasons: [String],
    alternatives: [String],
    allergenWarnings: [String],
    allergyWarnings: [String],
    dietaryWarnings: [String],
    medicalWarnings: [String],
    personalizationReasons: [String],
    manualSelection: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);
