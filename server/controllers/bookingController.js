const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const EntryExitLog = require('../models/EntryExitLog');

// ── Constants ─────────────────────────────────────────────────────────────────
const GRACE_MINUTES = 10;  // minutes after startTime to arrive & be verified

// ── Helper: free a slot, then re-reserve for next imminent booking ────────────
const IMMINENT_MS = 30 * 60 * 1000; // 30 min window

const freeSlot = async (slotId) => {
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return;

    const now = new Date();

    // Check if there's an upcoming active booking for this slot within 30 minutes
    const nextBooking = await Booking.findOne({
        slot: slotId,
        status: 'active',
        startTime: { $gt: now, $lte: new Date(now.getTime() + IMMINENT_MS) }
    }).sort({ startTime: 1 });

    if (nextBooking) {
        // Re-lock the slot for the imminent next booking
        slot.status = 'reserved';
        slot.reservedBy = nextBooking.user;
        slot.reservationEnd = nextBooking.endTime;
    } else {
        slot.status = 'free';
        slot.reservedBy = null;
        slot.reservationEnd = null;
    }
    await slot.save();
};

// ── Helper: check user has no active booking/reservation ─────────────────────
const getUserActiveBooking = (userId) =>
    Booking.findOne({ user: userId, status: { $in: ['active', 'occupied'] } }).populate('slot', 'slotNumber zoneName slotType status reservationEnd type vehicleType');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a RESERVATION booking (student-facing)
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

        const now = new Date();
        const parsedStart = new Date(startTime);
        const parsedEnd   = new Date(endTime);

        // ── Validate times ────────────────────────────────────────────────────
        if (parsedStart >= parsedEnd) {
            return res.status(400).json({ message: 'Booking end time must be after the start time.' });
        }
        if (parsedStart < new Date(now.getTime() - 5 * 60 * 1000)) {
            return res.status(400).json({ message: 'Booking start time cannot be in the past.' });
        }

        // ── Auto-cancel any of this user's expired grace-period bookings ───────
        const staleActive = await Booking.find({ user: req.user._id, status: 'active' });
        for (const stale of staleActive) {
            const deadline = stale.graceDeadline
                ? new Date(stale.graceDeadline)
                : new Date(new Date(stale.startTime).getTime() + GRACE_MINUTES * 60 * 1000);
            if (now > deadline) {
                stale.status = 'cancelled';
                await stale.save();
                await freeSlot(stale.slot);
            }
        }

        // ── One active booking per user ───────────────────────────────────────
        const userActiveBooking = await getUserActiveBooking(req.user._id);
        if (userActiveBooking) {
            return res.status(400).json({ message: 'You already have an active reservation. Please cancel it before booking a new slot.' });
        }

        // ── Time-overlap check: does this slot have any conflicting booking? ──
        // A conflict exists when another booking's time range overlaps [parsedStart, parsedEnd].
        // Two ranges [A,B] and [C,D] overlap if A < D and C < B.
        const conflicting = await Booking.findOne({
            slot: slotId,
            status: { $in: ['active', 'occupied'] },
            startTime: { $lt: parsedEnd },
            endTime:   { $gt: parsedStart }
        });

        if (conflicting) {
            const conflictStart = new Date(conflicting.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const conflictEnd   = new Date(conflicting.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return res.status(400).json({
                message: `This slot is already booked from ${conflictStart} to ${conflictEnd}. Please choose a different time slot or a different parking slot.`,
                code: 'TIME_CONFLICT',
                conflictStart: conflicting.startTime,
                conflictEnd:   conflicting.endTime
            });
        }

        // ── Grace deadline = startTime + GRACE_MINUTES ────────────────────────
        const graceDeadline = new Date(parsedStart.getTime() + GRACE_MINUTES * 60 * 1000);

        // ── Determine whether the slot needs to be physically locked now ──────
        // Only mark the physical slot as 'reserved' if the booking starts within
        // the next 30 minutes (i.e. it is an imminent booking). Future bookings
        // are tracked only in the Booking collection so the slot remains 'free'
        // for real-time visitors until closer to the reserved window.
        const IMMINENT_MS = 30 * 60 * 1000;
        const isImminent  = (parsedStart.getTime() - now.getTime()) <= IMMINENT_MS;

        const booking = await Booking.create({
            user: req.user._id,
            slot: slotId,
            vehicleNumber,
            vehicleType: vehicleType || 'Car',
            type: 'reservation',
            startTime: parsedStart,
            endTime: parsedEnd,
            graceDeadline,
            status: 'active'
        });

        if (isImminent) {
            slot.status = 'reserved';
            slot.reservedBy = req.user._id;
            await slot.save();
        }

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
const EARLY_WINDOW_MS = 15 * 60 * 1000; // 15 min before startTime

const verifyBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Booking is not currently active or already verified' });
        }

        const now = new Date();
        const startMs = new Date(booking.startTime).getTime();

        // ── Early arrival check ───────────────────────────────────────────────
        // Allow entry only from (startTime - 15 min) onward
        if (now.getTime() < startMs - EARLY_WINDOW_MS) {
            const allowFrom = new Date(startMs - EARLY_WINDOW_MS);
            const hh = allowFrom.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return res.status(400).json({
                message: `Too early. Entry is allowed only 15 minutes before your booking time (from ${hh}).`,
                code: 'TOO_EARLY',
                allowFrom: allowFrom.toISOString()
            });
        }

        // ── Slot availability check ───────────────────────────────────────────
        // Ensure the slot is not already occupied by someone else
        const currentSlot = await ParkingSlot.findById(booking.slot);
        if (currentSlot && currentSlot.status === 'occupied') {
            return res.status(400).json({
                message: 'Slot is currently occupied. Please wait until it becomes available.',
                code: 'SLOT_OCCUPIED'
            });
        }

        // ── Grace deadline check ──────────────────────────────────────────────
        const deadline = booking.graceDeadline || new Date(startMs + GRACE_MINUTES * 60 * 1000);
        if (now > deadline) {
            booking.status = 'cancelled';
            await booking.save();
            await freeSlot(booking.slot);
            return res.status(400).json({ message: 'Grace period has expired. Booking cancelled and slot released.' });
        }

        const actualNow = new Date();
        booking.status = 'occupied';
        booking.verifiedBy = req.user._id;
        booking.verifiedAt = actualNow;
        booking.actualEntryTime = actualNow;
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
            entryTime: actualNow,
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

        // ── 1. Cancel grace-expired active bookings ───────────────────────────
        const expired = await Booking.find({
            status: 'active',
            graceDeadline: { $lt: now }
        });

        // Legacy: graceDeadline missing
        const tenMinsAgo = new Date(now.getTime() - GRACE_MINUTES * 60 * 1000);
        const legacyExpired = await Booking.find({
            status: 'active',
            graceDeadline: { $exists: false },
            startTime: { $lt: tenMinsAgo }
        });

        // Legacy: graceDeadline explicitly null
        const legacyExpiredNull = await Booking.find({
            status: 'active',
            graceDeadline: null,
            startTime: { $lt: tenMinsAgo }
        });

        const all = [...expired, ...legacyExpired, ...legacyExpiredNull];
        const uniqueAll = Array.from(new Map(all.map(b => [b._id.toString(), b])).values());
        const cancelledCount = uniqueAll.length;

        await Promise.all(uniqueAll.map(async (booking) => {
            booking.status = 'cancelled';
            await booking.save();
            await freeSlot(booking.slot);
        }));

        // ── 2. Activate imminent upcoming bookings ────────────────────────────
        // Find active bookings whose startTime is within the next 30 minutes
        // but whose slot is still showing as 'free' (not yet locked).
        const imminentBookings = await Booking.find({
            status: 'active',
            startTime: {
                $gt: now,
                $lte: new Date(now.getTime() + IMMINENT_MS)
            }
        });

        let activatedCount = 0;
        await Promise.all(imminentBookings.map(async (booking) => {
            const slot = await ParkingSlot.findById(booking.slot);
            if (slot && slot.status === 'free') {
                slot.status = 'reserved';
                slot.reservedBy = booking.user;
                slot.reservationEnd = booking.endTime;
                await slot.save();
                activatedCount++;
            }
        }));

        res.json({
            cancelled: cancelledCount,
            activated: activatedCount,
            message: `${cancelledCount} expired cancelled, ${activatedCount} imminent slot(s) locked`
        });
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
        const now = new Date();
        booking.actualExitTime = now;
        
        // Compare with original booking endTime
        if (now.getTime() < new Date(booking.endTime).getTime()) {
            booking.status = 'early_exit';
        } else {
            booking.status = 'completed';
        }
        await booking.save();

        // 2. Free the Slot
        await freeSlot(booking.slot);

        // 3. Update EntryExitLog
        const log = await EntryExitLog.findOne({ 
            booking: booking._id, 
            status: 'parked' 
        });
        
        if (log) {
            log.exitTime = now;
            log.status = 'exited';
            await log.save();
        }

        res.json({ message: 'Vehicle exited successfully. Slot released for other users.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Guard manual parking entry (no user account needed)
// @route   POST /api/bookings/manual
// @access  Private (Guard/Admin)
// ─────────────────────────────────────────────────────────────────────────────
const manualEntry = async (req, res) => {
    const { ownerName, vehicleNumber, userType, slotId, remarks } = req.body;

    if (!ownerName || !vehicleNumber || !slotId) {
        return res.status(400).json({ message: 'Owner name, vehicle number and slot are required.' });
    }

    try {
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.status !== 'free') {
            return res.status(400).json({ message: 'Slot is already occupied or reserved.' });
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8-hour default window

        // Create booking (user = null for manual entries; directly occupied — no grace needed)
        const booking = await Booking.create({
            user: null,
            slot: slotId,
            vehicleNumber: vehicleNumber.toUpperCase(),
            vehicleType: 'Car',
            type: 'direct',
            startTime: now,
            endTime,
            graceDeadline: null,      // direct entries skip grace period
            actualEntryTime: now,     // guard is present — entry time is now
            status: 'occupied',
            verifiedBy: req.user._id,
            verifiedAt: now,
            isManual: true,
            manualOwnerName: ownerName,
            manualUserType: userType || 'Visitor',
            remarks: remarks || null
        });

        // Mark slot occupied immediately
        slot.status = 'occupied';
        slot.reservedBy = null;
        slot.reservationEnd = null;
        await slot.save();

        // Create EntryExitLog
        await EntryExitLog.create({
            booking: booking._id,
            vehicleNumber: booking.vehicleNumber,
            slot: slotId,
            entryTime: now,
            guard: req.user._id,
            status: 'parked'
        });

        const populated = await booking.populate('slot', 'slotNumber zoneName slotType vehicleType');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Extend grace arrival window by 5 minutes (Guard — one-time)
//          NOTE: This extends graceDeadline only. The booking endTime is FIXED.
// @route   PUT /api/bookings/:id/extend
// @access  Private (Guard/Admin)
// ─────────────────────────────────────────────────────────────────────────────
const extendBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Only active (awaiting) bookings can be extended.' });
        }
        if (booking.isExtended) {
            return res.status(400).json({ message: 'This booking has already been extended once.' });
        }

        // Compute current grace deadline (fallback for legacy documents)
        const currentGrace = booking.graceDeadline
            || new Date(booking.startTime.getTime() + GRACE_MINUTES * 60 * 1000);

        // Extend the GRACE DEADLINE by 5 minutes — booking endTime stays fixed
        booking.graceDeadline = new Date(currentGrace.getTime() + 5 * 60 * 1000);
        booking.isExtended = true;
        booking.extendedAt = new Date();
        await booking.save();

        const populated = await booking.populate([
            { path: 'user', select: 'name email userType' },
            { path: 'slot', select: 'slotNumber zoneName vehicleType slotType' }
        ]);
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Extend booking end time (Student)
// @route   PUT /api/bookings/:id/student-extend
// @access  Private (Student)
// ─────────────────────────────────────────────────────────────────────────────
const studentExtendBooking = async (req, res) => {
    try {
        const { extraMinutes } = req.body;
        const extraMinutesNum = parseInt(extraMinutes, 10);
        if (!extraMinutesNum || extraMinutesNum <= 0) {
            return res.status(400).json({ message: 'Valid extra minutes required.' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        // Ensure user owns this booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to extend this booking.' });
        }

        if (!['active', 'occupied'].includes(booking.status)) {
            return res.status(400).json({ message: 'Only active or occupied bookings can be extended.' });
        }

        // Calculate total extension
        const originalEnd = booking.originalEndTime || booking.endTime;
        const currentExtensionMinutes = Math.round((booking.endTime.getTime() - originalEnd.getTime()) / 60000);
        
        if (currentExtensionMinutes + extraMinutesNum > 120) {
            return res.status(400).json({ message: 'Maximum extension allowed is 2 hours total.' });
        }

        const newEndTime = new Date(booking.endTime.getTime() + extraMinutesNum * 60000);

        // Check for overlaps with other active/occupied bookings for this slot
        const overlappingBooking = await Booking.findOne({
            slot: booking.slot,
            status: { $in: ['active', 'occupied'] },
            _id: { $ne: booking._id },
            startTime: { $lt: newEndTime },
            endTime: { $gt: booking.endTime }
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: 'Extension unavailable because this slot is reserved by another user.' });
        }

        // Apply extension
        if (!booking.originalEndTime) {
            booking.originalEndTime = booking.endTime;
        }
        booking.endTime = newEndTime;
        booking.isStudentExtended = true;
        await booking.save();

        const populated = await booking.populate([
            { path: 'user', select: 'name email userType' },
            { path: 'slot', select: 'slotNumber zoneName vehicleType slotType' }
        ]);
        res.json(populated);
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
    markExit,
    manualEntry,
    extendBooking,
    studentExtendBooking
};
