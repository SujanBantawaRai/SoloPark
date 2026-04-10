const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const User = require('../models/User');
const EntryExitLog = require('../models/EntryExitLog');

// ─── Helper: build last-N-days date labels ────────────────────────────────────
const lastNDays = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        days.push(d);
    }
    return days;
};

const dayLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysBookings = await Booking.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const activeParkings = await EntryExitLog.countDocuments({ status: 'parked' });

        // peak hour today
        const todayLogs = await EntryExitLog.find({ entryTime: { $gte: startOfDay, $lte: endOfDay } });
        const hourCounts = {};
        todayLogs.forEach(l => {
            const h = new Date(l.entryTime).getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
        let peakHour = null;
        let peakCount = 0;
        Object.entries(hourCounts).forEach(([h, c]) => {
            if (c > peakCount) { peakCount = c; peakHour = Number(h); }
        });
        const formatHour = (h) => h === null ? '—' :
            `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h < 12 ? 'AM' : 'PM'}`;

        // avg duration (minutes) from completed bookings today
        const completedToday = await EntryExitLog.find({ exitTime: { $exists: true }, entryTime: { $gte: startOfDay, $lte: endOfDay } });
        let avgDuration = 0;
        if (completedToday.length > 0) {
            avgDuration = Math.round(completedToday.reduce((sum, l) => sum + (new Date(l.exitTime) - new Date(l.entryTime)) / 60000, 0) / completedToday.length);
        }

        res.json({
            slots: { total: totalSlots, occupied: occupiedSlots, reserved: reservedSlots, free: freeSlots },
            users: totalUsers,
            bookings: { total: totalBookings, today: todaysBookings },
            activeParkings,
            peakHour: formatHour(peakHour),
            avgDuration
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get aggregated chart analytics
// @route   GET /api/reports/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const days = lastNDays(7);

        // Booking trend (last 7 days)
        const bookingTrend = await Promise.all(days.map(async (dayStart) => {
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const [completed, pending, cancelled] = await Promise.all([
                Booking.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd }, status: 'completed' }),
                Booking.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd }, status: { $in: ['active', 'occupied'] } }),
                Booking.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd }, status: 'cancelled' }),
            ]);
            return { day: dayLabel(dayStart), completed, pending, cancelled };
        }));

        // Occupancy trend — occupied slot count per day (from logs)
        const occupancyTrend = await Promise.all(days.map(async (dayStart) => {
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const count = await EntryExitLog.countDocuments({ entryTime: { $gte: dayStart, $lte: dayEnd } });
            return { day: dayLabel(dayStart), occupied: count };
        }));

        // Entry vs Exit — last 24 hours by hour
        const now = new Date();
        const h24ago = new Date(now - 24 * 3600 * 1000);
        const allLogs = await EntryExitLog.find({ entryTime: { $gte: h24ago } });
        const hourlyMap = {};
        allLogs.forEach(l => {
            const h = new Date(l.entryTime).getHours();
            const label = `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h < 12 ? 'am' : 'pm'}`;
            if (!hourlyMap[h]) hourlyMap[h] = { hour: label, entries: 0, exits: 0 };
            hourlyMap[h].entries++;
            if (l.exitTime) hourlyMap[h].exits++;
        });
        const entryExitTrend = Array.from({ length: 24 }, (_, i) => {
            const h = (now.getHours() - 23 + i + 24) % 24;
            const label = `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h < 12 ? 'am' : 'pm'}`;
            return hourlyMap[h] || { hour: label, entries: 0, exits: 0 };
        });

        // User distribution
        const [superAdmins, admins, guards, students, teachers, others] = await Promise.all([
            User.countDocuments({ role: 'super_admin' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ userType: 'guard' }),
            User.countDocuments({ userType: 'student' }),
            User.countDocuments({ userType: 'teacher' }),
            User.countDocuments({ role: 'user', userType: { $in: [null, undefined] } }),
        ]);
        const userDistribution = [
            { name: 'Super Admin', value: superAdmins },
            { name: 'Admin', value: admins },
            { name: 'Student', value: students },
            { name: 'Teacher', value: teachers },
            { name: 'Guard', value: guards },
            { name: 'Unassigned', value: others },
        ].filter(d => d.value > 0);

        res.json({ bookingTrend, occupancyTrend, entryExitTrend, userDistribution });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live vehicle table data
// @route   GET /api/reports/live
// @access  Private/Admin
const getLiveVehicles = async (req, res) => {
    try {
        const logs = await EntryExitLog.find({ status: 'parked' })
            .populate('slot', 'slotNumber zone')
            .populate('guard', 'name')
            .populate({ path: 'booking', populate: { path: 'user', select: 'name email' } })
            .sort({ entryTime: -1 })
            .limit(20);

        const now = new Date();
        const result = logs.map(l => {
            const minsParked = l.entryTime ? Math.floor((now - new Date(l.entryTime)) / 60000) : 0;
            let vehicleStatus = 'Occupied';
            if (minsParked > 480) vehicleStatus = 'Overstay'; // >8h
            else if (minsParked > 360) vehicleStatus = 'Leaving Soon';
            return {
                _id: l._id,
                slotNumber: l.slot?.slotNumber || '—',
                zone: l.slot?.zone || '—',
                vehicleNumber: l.vehicleNumber,
                userName: l.booking?.user?.name || '—',
                entryTime: l.entryTime,
                minsParked,
                vehicleStatus
            };
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get peak hours data (Super Admin only)
// @route   GET /api/reports/peak-hours
// @access  Private/SuperAdmin
const getPeakHours = async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const logs = await EntryExitLog.find({ entryTime: { $gte: since } });
        const hourMap = {};
        for (let i = 0; i < 24; i++) hourMap[i] = 0;
        logs.forEach(l => { if (l.entryTime) hourMap[new Date(l.entryTime).getHours()]++; });
        const data = Object.entries(hourMap).map(([h, count]) => ({
            hour: `${Number(h) === 0 ? 12 : Number(h) > 12 ? Number(h) - 12 : Number(h)}${Number(h) < 12 ? 'am' : 'pm'}`,
            count
        }));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top and least used slots (Super Admin only)
// @route   GET /api/reports/top-slots
// @access  Private/SuperAdmin
const getTopSlots = async (req, res) => {
    try {
        const agg = await Booking.aggregate([
            { $group: { _id: '$slot', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $lookup: { from: 'parkingslots', localField: '_id', foreignField: '_id', as: 'slot' } },
            { $unwind: '$slot' },
            { $project: { slotNumber: '$slot.slotNumber', zone: '$slot.zone', count: 1 } }
        ]);
        const top5 = agg.slice(0, 5);
        const least5 = [...agg].reverse().slice(0, 5);
        res.json({ top5, least5 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getAnalytics,
    getLiveVehicles,
    getPeakHours,
    getTopSlots
};
