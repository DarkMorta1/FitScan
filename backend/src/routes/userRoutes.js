const express = require('express');
const { updateProfile, getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { profileValidation } = require('../middleware/validators');

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', profileValidation, validate, updateProfile);

module.exports = router;
