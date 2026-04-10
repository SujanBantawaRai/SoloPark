const express = require('express');
const router = express.Router();
const { getStats, getAnalytics, getLiveVehicles, getPeakHours, getTopSlots } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats',      protect, authorize('admin', 'super_admin'), getStats);
router.get('/analytics',  protect, authorize('admin', 'super_admin'), getAnalytics);
router.get('/live',       protect, authorize('admin', 'super_admin'), getLiveVehicles);
router.get('/peak-hours', protect, authorize('super_admin'),          getPeakHours);
router.get('/top-slots',  protect, authorize('super_admin'),          getTopSlots);

module.exports = router;
