const Food = require('../models/Food');
const AppError = require('../utils/AppError');

const getFoods = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [foods, total] = await Promise.all([
      Food.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Food.countDocuments(query),
    ]);

    res.json({
      success: true,
      foods,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) throw new AppError('Food not found.', 404);
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (_req, res, next) => {
  try {
    const categories = await Food.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const createFood = async (req, res, next) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) throw new AppError('Food not found.', 404);
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) throw new AppError('Food not found.', 404);
    res.json({ success: true, message: 'Food deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
};
