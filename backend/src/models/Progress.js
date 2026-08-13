const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    weight: { type: Number, min: 30, max: 300 },
    calories: { type: Number, min: 0 },
    waterIntake: { type: Number, min: 0 },
    bmi: { type: Number, min: 0 },
    workoutsCompleted: { type: Number, default: 0 },
    mealsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
