const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const User = require('../models/User');
const EntryExitLog = require('../models/EntryExitLog');

// @desc    Get dashboard statistics
// @route   GET /api/reports/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalSlots = await ParkingSlot.countDocuments();
        const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
        const reservedSlots = await ParkingSlot.countDocuments({ status: 'reserved' });
        const freeSlots = await ParkingSlot.countDocuments({ status: 'free' });

        const totalUsers = await User.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // Get today's bookings
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysBookings = await Booking.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const activeParkings = await EntryExitLog.countDocuments({ status: 'parked' });

        res.json({
            slots: {
                total: totalSlots,
                occupied: occupiedSlots,
                reserved: reservedSlots,
                free: freeSlots
            },
            users: totalUsers,
            bookings: {
                total: totalBookings,
                today: todaysBookings
            },
            activeParkings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats
};
