const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all parking slots
// @route   GET /api/slots
// @access  Public (or Private)
const getSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find({});
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new parking slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = async (req, res) => {
    const { slotNumber, zone, slotType } = req.body;

    try {
        const slotExists = await ParkingSlot.findOne({ slotNumber });
        if (slotExists) {
            return res.status(400).json({ message: 'Slot already exists' });
        }

        const slot = await ParkingSlot.create({
            slotNumber,
            zone,
            slotType
        });

        res.status(201).json(slot);
    } catch (error) {
        res.status(400).json({ message: 'Invalid slot data' });
    }
};

// @desc    Update slot status
// @route   PUT /api/slots/:id
// @access  Private/Admin/Guard
const updateSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);

        if (slot) {
            slot.status = req.body.status || slot.status;
            slot.slotType = req.body.slotType || slot.slotType;
            slot.isActive = req.body.isActive !== undefined ? req.body.isActive : slot.isActive;

            const updatedSlot = await slot.save();
            res.json(updatedSlot);
        } else {
            res.status(404).json({ message: 'Slot not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a parking slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);

        if (slot) {
            await slot.deleteOne();
            res.json({ message: 'Slot removed' });
        } else {
            res.status(404).json({ message: 'Slot not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get slots by zone name, with optional time-range availability
// @route   GET /api/slots/zone/:zoneName?startTime=...&endTime=...
// @access  Public (or Private)
const getSlotsByZone = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const slots = await ParkingSlot.find({ zoneName: req.params.zoneName }).sort({ slotNumber: 1 });

        const { startTime, endTime } = req.query;

        // If a time range is provided, compute per-slot availability for that window
        if (startTime && endTime) {
            const parsedStart = new Date(startTime);
            const parsedEnd   = new Date(endTime);

            // Fetch all conflicting bookings for this zone in the requested time range
            const conflictingBookings = await Booking.find({
                slot: { $in: slots.map(s => s._id) },
                status: { $in: ['active', 'occupied'] },
                startTime: { $lt: parsedEnd },
                endTime:   { $gt: parsedStart }
            }).select('slot startTime endTime status');

            // Build a lookup: slotId -> array of conflicting bookings
            const conflictMap = {};
            conflictingBookings.forEach(b => {
                const sid = b.slot.toString();
                if (!conflictMap[sid]) conflictMap[sid] = [];
                conflictMap[sid].push(b);
            });

            // Attach a computed `availabilityStatus` to each slot for the requested window
            const annotated = slots.map(slot => {
                const s = slot.toObject();
                const conflicts = conflictMap[s._id.toString()] || [];
                if (conflicts.length > 0) {
                    const c = conflicts[0];
                    s.availabilityStatus = 'unavailable';
                    s.conflictStart = c.startTime;
                    s.conflictEnd   = c.endTime;
                } else {
                    s.availabilityStatus = 'available';
                }
                return s;
            });

            return res.json(annotated);
        }

        // Default: return slots with real-time status (no time filter)
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get detailed info for an occupied/reserved slot
// @route   GET /api/slots/:id/detail
// @access  Private/Guard/Admin
const getSlotDetail = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const booking = await Booking.findOne({
            slot: req.params.id,
            status: { $in: ['active', 'occupied'] }
        }).populate('user', 'name userType');

        if (!booking) {
            return res.status(404).json({ message: 'No active booking for this slot' });
        }

        res.json({
            studentName: booking.user?.name || booking.manualOwnerName,
            vehicleNumber: booking.vehicleNumber,
            vehicleType: booking.vehicleType,
            status: booking.status,
            startTime: booking.startTime,
            endTime: booking.endTime,
            user: booking.user,
            isManual: booking.isManual,
            manualOwnerName: booking.manualOwnerName,
            manualUserType: booking.manualUserType
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSlots,
    createSlot,
    updateSlot,
    deleteSlot,
    getSlotsByZone,
    getSlotDetail
};
