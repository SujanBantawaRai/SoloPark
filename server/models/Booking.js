const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
        enum: ['active', 'occupied', 'completed', 'cancelled'],
        default: 'active'
    },
    totalAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
