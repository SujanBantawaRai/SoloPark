const express = require('express');
const router = express.Router();
const { getSlots, createSlot, updateSlot, deleteSlot, getSlotsByZone, getSlotDetail } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getSlots)
    .post(protect, authorize('admin'), createSlot);

router.get('/zone/:zoneName', getSlotsByZone);

router.route('/:id')
    .put(protect, authorize('admin', 'guard'), updateSlot)
    .delete(protect, authorize('admin'), deleteSlot);

router.get('/:id/detail', protect, authorize('admin', 'guard'), getSlotDetail);

module.exports = router;
