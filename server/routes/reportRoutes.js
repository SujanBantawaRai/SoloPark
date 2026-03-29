const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'super_admin'), getStats);

module.exports = router;
