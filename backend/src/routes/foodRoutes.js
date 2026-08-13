const express = require('express');
const {
  getFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { foodValidation } = require('../middleware/validators');

const router = express.Router();

router.get('/', getFoods);
router.get('/categories', getCategories);
router.get('/:id', getFoodById);

router.post('/', protect, authorize('admin'), foodValidation, validate, createFood);
router.put('/:id', protect, authorize('admin'), foodValidation, validate, updateFood);
router.delete('/:id', protect, authorize('admin'), deleteFood);

module.exports = router;
