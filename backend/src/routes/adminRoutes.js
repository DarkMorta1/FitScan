const express = require('express');
const { getStats, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
