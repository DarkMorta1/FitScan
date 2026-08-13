const express = require('express');
const {
  getMeals,
  getWorkouts,
  getProgress,
  updateProgress,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/meals', getMeals);
router.get('/workouts', getWorkouts);
router.get('/progress', getProgress);
router.post('/progress', updateProgress);

module.exports = router;
