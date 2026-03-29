const EntryExitLog = require('../models/EntryExitLog');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

// @desc    Log a vehicle entry
// @route   POST /api/logs/entry
// @access  Private/Guard
const logEntry = async (req, res) => {
    const { vehicleNumber, slotId, bookingId } = req.body;

    try {
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        // If bookingId is provided, verify it
        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            if (booking.status !== 'active') {
                return res.status(400).json({ message: 'Booking is not active' });
            }
        }

        // Check if vehicle is already parked (active log)
        const activeLog = await EntryExitLog.findOne({
            vehicleNumber,
            status: 'parked'
        });

        if (activeLog) {
            return res.status(400).json({ message: 'Vehicle already marked as parked' });
        }

        const log = await EntryExitLog.create({
            booking: bookingId || null, // Can be null for ad-hoc parking
            vehicleNumber,
            slot: slotId,
            entryTime: Date.now(),
            guard: req.user._id,
            status: 'parked'
        });

        // Update slot status to occupied
        slot.status = 'occupied';
        await slot.save();

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Log a vehicle exit
// @route   PUT /api/logs/exit/:id
// @access  Private/Guard
const logExit = async (req, res) => {
    try {
        // Find log by ID or search by vehicle number if ID is not ObjectId
        let log;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            log = await EntryExitLog.findById(req.params.id);
        } else {
            // Assume params.id is vehicle number
            log = await EntryExitLog.findOne({
                vehicleNumber: req.params.id,
                status: 'parked'
            });
        }

        if (!log) {
            return res.status(404).json({ message: 'Active parking log not found' });
        }

        if (log.status === 'exited') {
            return res.status(400).json({ message: 'Vehicle already exited' });
        }

        log.exitTime = Date.now();
        log.status = 'exited';
        await log.save();

        // Free up the slot
        const slot = await ParkingSlot.findById(log.slot);
        if (slot) {
            slot.status = 'free';
            await slot.save();
        }

        // Complete the booking if it exists
        if (log.booking) {
            const booking = await Booking.findById(log.booking);
            if (booking) {
                booking.status = 'completed';
                await booking.save();
            }
        }

        res.json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all logs
// @route   GET /api/logs
// @access  Private/Admin/Guard
const getLogs = async (req, res) => {
    try {
        const logs = await EntryExitLog.find({})
            .populate('slot', 'slotNumber')
            .populate('guard', 'name')
            .populate({
                path: 'booking',
                select: 'vehicleType user',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ entryTime: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    logEntry,
    logExit,
    getLogs
};
