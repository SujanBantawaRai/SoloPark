const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const EntryExitLog = require('../models/EntryExitLog');

// ── Helper: free a slot ──────────────────────────────────────────────────────
const freeSlot = async (slotId) => {
    const slot = await ParkingSlot.findById(slotId);
    if (slot) {
        slot.status = 'free';
        slot.reservedBy = null;
        slot.reservationEnd = null;
        await slot.save();
    }
};

// ── Helper: check user has no active booking/reservation ────────────────────
const getUserActiveBooking = (userId) =>
    Booking.findOne({ user: userId, status: { $in: ['active', 'occupied'] } }).populate('slot', 'slotNumber zoneName slotType status reservationEnd type vehicleType');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a DIRECT booking (instant occupy — existing behaviour)
// @route   POST /api/bookings
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
    const { slotId, vehicleNumber, vehicleType, startTime, endTime } = req.body;

    try {
        if (req.user.userType !== 'student' && req.user.userType !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'You must be assigned as a student or teacher to book a parking spot.' });
        }

        const slot = await ParkingSlot.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.status !== 'free') {
            return res.status(400).json({ message: 'Slot is not available' });
        }

        // One active booking per user
        const userActiveBooking = await getUserActiveBooking(req.user._id);
        if (userActiveBooking) {
            return res.status(400).json({ message: 'You already have an active reservation. Only one slot per user is allowed.' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            slot: slotId,
            vehicleNumber,
            vehicleType: vehicleType || 'Car',
            type: 'reservation',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: 'active'
        });

        slot.status = 'reserved';
        slot.reservedBy = req.user._id;
        await slot.save();

        const populated = await booking.populate('slot', 'slotNumber zoneName slotType');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify booking — ACTIVE → OCCUPIED (Guard Action)
// @route   PUT /api/bookings/:id/verify
// @access  Private (Guard/Admin)
// ─────────────────────────────────────────────────────────────────────────────
const verifyBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Booking is not currently active or already verified' });
        }

        // Check not expired
        if (booking.endTime && new Date() > booking.endTime) {
            // Auto-cancel it
            booking.status = 'cancelled';
            await booking.save();
            await freeSlot(booking.slot);
            return res.status(400).json({ message: 'Booking time has expired and has been cancelled' });
        }

        booking.status = 'occupied';
        booking.verifiedBy = req.user._id;
        booking.verifiedAt = new Date();
        await booking.save();

        // Update slot to occupied
        const slot = await ParkingSlot.findById(booking.slot);
        if (slot) {
            slot.status = 'occupied';
            slot.reservedBy = null;
            slot.reservationEnd = null;
            await slot.save();
        }

        // Create EntryExitLog
        await EntryExitLog.create({
            booking: booking._id,
            vehicleNumber: booking.vehicleNumber,
            slot: booking.slot,
            entryTime: new Date(),
            guard: req.user._id,
            status: 'parked'
        });

        const populated = await booking.populate('slot', 'slotNumber zoneName slotType vehicleType');
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged-in user's single active booking/reservation
// @route   GET /api/bookings/myactive
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMyActiveBooking = async (req, res) => {
    try {
        const booking = await getUserActiveBooking(req.user._id);
        res.json(booking || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Auto-cancel expired reservations (called by frontend polling)
// @route   POST /api/bookings/cleanup
// @access  Public (lightweight, no sensitive data)
// ─────────────────────────────────────────────────────────────────────────────
const cancelExpiredReservations = async (req, res) => {
    try {
        const now = new Date();

        // Find all active bookings past their endTime with no guard verification
        const expired = await Booking.find({
            status: 'active',
            endTime: { $lt: now }
        });

        const cancelledCount = expired.length;

        await Promise.all(expired.map(async (booking) => {
            booking.status = 'cancelled';
            await booking.save();
            await freeSlot(booking.slot);
        }));

        res.json({ cancelled: cancelledCount, message: `${cancelledCount} expired booking(s) cancelled` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged in user's all bookings
// @route   GET /api/bookings/mybookings
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('slot', 'slotNumber zoneName slotType')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all bookings (Admin/Guard)
// @route   GET /api/bookings
// @access  Private/Admin/Guard
// ─────────────────────────────────────────────────────────────────────────────
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email userType')
            .populate('slot', 'slotNumber zoneName vehicleType')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all ACTIVE bookings (Guard real-time feed)
// @route   GET /api/bookings/active
// @access  Private/Guard/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getActiveBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: { $in: ['active', 'occupied'] } })
            .populate('user', 'name email userType')
            .populate('slot', 'slotNumber zoneName vehicleType slotType')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Cancel booking / reservation
// @route   PUT /api/bookings/:id/cancel
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        await freeSlot(booking.slot);

        res.json({ message: 'Booking cancelled' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark vehicle exit (Guard Action)
// @route   PUT /api/bookings/:id/exit
// @access  Private/Guard/Admin
// ─────────────────────────────────────────────────────────────────────────────
const markExit = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'occupied') {
            return res.status(400).json({ message: 'Only occupied bookings can be marked as exit' });
        }

        // 1. Update Booking
        booking.status = 'completed';
        await booking.save();

        // 2. Free the Slot
        await freeSlot(booking.slot);

        // 3. Update EntryExitLog
        const log = await EntryExitLog.findOne({ 
            booking: booking._id, 
            status: 'parked' 
        });
        
        if (log) {
            log.exitTime = new Date();
            log.status = 'exited';
            await log.save();
        }

        res.json({ message: 'Vehicle exit processed, slot released.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    verifyBooking,
    getMyActiveBooking,
    cancelExpiredReservations,
    getMyBookings,
    getBookings,
    getActiveBookings,
    cancelBooking,
    markExit
};
