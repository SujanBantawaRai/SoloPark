const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // null for manual guard entries
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['Car', 'Bike', 'Scooter', 'Any'],
        default: 'Car'
    },
    // Booking type: 'direct' (instant occupy) or 'reservation' (arrival-based)
    type: {
        type: String,
        enum: ['direct', 'reservation'],
        default: 'direct'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    // Grace deadline = startTime + 10 min (fixed arrival window for guard verification)
    // For 'direct' / manual bookings this is not used (slot is immediately occupied)
    graceDeadline: {
        type: Date,
        default: null
    },
    // Actual clock-in time recorded when guard verifies the booking
    actualEntryTime: {
        type: Date,
        default: null
    },
    // Actual clock-out time recorded when guard marks exit
    actualExitTime: {
        type: Date,
        default: null
    },
    // Guard verification fields
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'occupied', 'completed', 'cancelled', 'early_exit'],
        default: 'active'
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    // Manual entry by guard (no user account required)
    isManual: {
        type: Boolean,
        default: false
    },
    manualOwnerName: {
        type: String,
        default: null
    },
    manualUserType: {
        type: String,
        enum: ['Student', 'Teacher', 'Visitor', null],
        default: null
    },
    remarks: {
        type: String,
        default: null
    },
    // Guard can extend the grace arrival window once by 5 minutes
    isExtended: {
        type: Boolean,
        default: false
    },
    extendedAt: {
        type: Date,
        default: null
    },
    // Track if student extended their booking and what the original end time was
    originalEndTime: {
        type: Date,
        default: null
    },
    isStudentExtended: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
