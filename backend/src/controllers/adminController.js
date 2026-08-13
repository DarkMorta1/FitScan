const User = require('../models/User');
const Food = require('../models/Food');
const Scan = require('../models/Scan');
const MealLog = require('../models/MealLog');

const getStats = async (_req, res, next) => {
  try {
    const [users, foods, scans, meals] = await Promise.all([
      User.countDocuments(),
      Food.countDocuments(),
      Scan.countDocuments(),
      MealLog.countDocuments(),
    ]);

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
    const riskDistribution = await Scan.aggregate([
      { $group: { _id: '$prediction', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: { users, foods, scans, meals, riskDistribution, recentUsers },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, deleteUser };
