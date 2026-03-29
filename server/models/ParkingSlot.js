const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true,
        unique: true
    },
    zone: {
        type: String, // backward compat
    },
    zoneName: {
        type: String, // e.g. 'HCK', 'WLV', 'ING'
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['Car', 'Bike', 'Scooter', 'Any'],
        default: 'Any'
    },
    slotType: {
        type: String,
        enum: ['student', 'staff', 'visitor', 'handicapped', 'Student', 'Visitor'],
        required: true
    },
    status: {
        type: String,
        enum: ['free', 'reserved', 'occupied', 'maintenance'],
        default: 'free'
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Reservation metadata (for quick slot-level lookup)
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reservationEnd: {
        type: Date,  // When the reservation expires
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
