const express = require('express');
const router = express.Router();
const {
    createBooking,
    verifyBooking,
    getMyActiveBooking,
    cancelExpiredReservations,
    getMyBookings,
    getBookings,
    getActiveBookings,
    cancelBooking,
    markExit
} = require('../controllers/bookingController');
const { protect, authorize, allowRolesOrUserTypes } = require('../middleware/authMiddleware');

// ── Must come BEFORE /:id routes to avoid route conflicts ────────────────────
router.get('/myactive', protect, getMyActiveBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/active', protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), getActiveBookings);
router.post('/cleanup', cancelExpiredReservations); // called by frontend polling

// ── Core CRUD ────────────────────────────────────────────────────────────────
router.route('/')
    .post(protect, createBooking)
    .get(protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), getBookings);

router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/verify', protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), verifyBooking);
router.put('/:id/exit', protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), markExit);

module.exports = router;
