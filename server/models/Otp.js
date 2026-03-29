const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        // MongoDB TTL index: auto-delete document after it expires
        index: { expires: 0 }
    },
    attempts: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Hash OTP before saving
otpSchema.pre('save', async function () {
    if (!this.isModified('otp')) return;
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
});

// Method to compare submitted OTP with stored hash
otpSchema.methods.matchOtp = async function (submittedOtp) {
    return await bcrypt.compare(submittedOtp, this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);
