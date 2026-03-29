const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'user'],
        default: 'user'
    },
    vehicleNumber: {
        type: String,
        default: null,
        trim: true,
        uppercase: true
    },
    userType: {
        type: String,
        // null is allowed (means unassigned); valid string values are student/teacher/guard
        validate: {
            validator: function(v) {
                return v === null || v === undefined || ['student', 'teacher', 'guard'].includes(v);
            },
            message: props => `'${props.value}' is not a valid userType`
        },
        default: null
    },
    // Audit fields – who changed this user's role and when
    roleChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    roleChangedAt: {
        type: Date,
        default: null
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
