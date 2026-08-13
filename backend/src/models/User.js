const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GOALS, ACTIVITY_LEVELS, MEDICAL_CONDITIONS, ALLERGIES, ROLES } = require('../utils/constants');

const profileSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 13, max: 120 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    height: { type: Number, min: 100, max: 250 },
    weight: { type: Number, min: 30, max: 300 },
    goal: { type: String, enum: GOALS },
    activityLevel: { type: String, enum: ACTIVITY_LEVELS },
    dietaryPreference: { type: String, enum: ['Vegan', 'Vegetarian', 'Non-Vegetarian'], default: 'Non-Vegetarian' },
    medicalConditions: [{ type: String, enum: MEDICAL_CONDITIONS }],
    allergies: [{ type: String, enum: ALLERGIES }],
    fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    workoutDays: { type: Number, min: 1, max: 6, default: 3 },
    workoutDurationMinutes: { type: Number, min: 15, max: 180, default: 45 },
    equipment: { type: [String], default: [] },
    preferredWorkoutType: { type: String, enum: ['Strength', 'Cardio', 'Mixed', 'Bodyweight'], default: 'Mixed' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    profile: profileSchema,
    onboardingComplete: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
