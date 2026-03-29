const mongoose = require('mongoose');

const entryExitLogSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false // Can be null if it's a direct entry (e.g. guard pass) but mostly linked to booking
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    entryTime: {
        type: Date,
        default: Date.now
    },
    exitTime: {
        type: Date
    },
    guard: {
        type: mongoose.Schema.Types.ObjectId, // Guard who logged this
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['parked', 'exited'],
        default: 'parked'
    }
}, { timestamps: true });

module.exports = mongoose.model('EntryExitLog', entryExitLogSchema);
