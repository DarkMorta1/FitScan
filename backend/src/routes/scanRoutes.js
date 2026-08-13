const express = require('express');
const {
  analyzeFood,
  scanImage,
  getScanHistory,
  getScanById,
} = require('../controllers/scanController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeFood);
router.post('/upload', upload.single('image'), scanImage);
router.get('/history', getScanHistory);
router.get('/:id', getScanById);

module.exports = router;
