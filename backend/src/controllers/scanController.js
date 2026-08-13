const path = require('path');
const Food = require('../models/Food');
const Scan = require('../models/Scan');
const AppError = require('../utils/AppError');
const { predictFoodRisk } = require('../services/aiService');
const { detectFood } = require('../services/foodDetectionService');
const {
  mapProfileToAI,
  generateRiskReasons,
  getHealthyAlternatives,
  getDietaryWarnings,
  getAllergyWarnings,
  getMedicalWarnings,
  generatePersonalizationReasons,
} = require('../utils/nutrition');

const analyzeFood = async (req, res, next) => {
  try {
    const { foodId } = req.body;
    const user = req.user;

    if (!user.profile?.age || !user.onboardingComplete) {
      throw new AppError('Please complete your profile before scanning.', 400);
    }

    const food = await Food.findById(foodId);
    if (!food) throw new AppError('Food not found.', 404);

    const aiPayload = mapProfileToAI(user.profile, food);
    const aiResult = await predictFoodRisk(aiPayload);

    const allFoods = await Food.find().limit(100);
    const reasons = generateRiskReasons(food, aiResult.prediction);
    const alternatives = getHealthyAlternatives(food, allFoods);

    const dietaryWarnings = getDietaryWarnings(user.profile, food);
    const allergyWarnings = getAllergyWarnings(user.profile, food);
    const medicalWarnings = getMedicalWarnings(user.profile, food);
    const personalizationReasons = generatePersonalizationReasons(dietaryWarnings, allergyWarnings, medicalWarnings);

    const scan = await Scan.create({
      userId: user._id,
      foodId: food._id,
      imageUrl: food.imageUrl,
      detectedFoodName: food.name,
      prediction: aiResult.prediction,
      confidence: aiResult.confidence,
      reasons,
      alternatives: alternatives.length ? alternatives : ['Grilled Chicken', 'Brown Rice', 'Greek Yogurt'],
      allergenWarnings: allergyWarnings,
      allergyWarnings,
      dietaryWarnings,
      medicalWarnings,
      personalizationReasons,
      manualSelection: req.body.manualSelection || false,
    });

    res.json({
      success: true,
      scan: {
        ...scan.toObject(),
        food,
      },
    });
  } catch (error) {
    next(error);
  }
};

const scanImage = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Please upload an image.', 400);

    const imageUrl = `/uploads/${req.file.filename}`;
    const detection = await detectFood(req.file.path);

    if (!detection.detected || !detection.items || detection.items.length === 0) {
      return res.json({
        success: true,
        detected: false,
        imageUrl,
        message: detection.message || 'No matching foods were found.'
      });
    }

    // Return all matching items for the frontend to present for manual selection.
    return res.json({
      success: true,
      detected: true,
      imageUrl,
      items: detection.items,
    });
  } catch (error) {
    next(error);
  }
};

const getScanHistory = async (req, res, next) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .populate('foodId')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, scans });
  } catch (error) {
    next(error);
  }
};

const getScanById = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id }).populate('foodId');
    if (!scan) throw new AppError('Scan not found.', 404);
    res.json({ success: true, scan: { ...scan.toObject(), food: scan.foodId } });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeFood, scanImage, getScanHistory, getScanById };
