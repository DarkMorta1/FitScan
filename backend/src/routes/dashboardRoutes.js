const express = require('express');
const { getDashboard, logMeal } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { mealValidation } = require('../middleware/validators');

const router = express.Router();

router.use(protect);
router.get('/', getDashboard);
router.post('/meals', mealValidation, validate, logMeal);

module.exports = router;
