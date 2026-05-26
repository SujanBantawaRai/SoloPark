const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.role === 'user' && !user.isEmailVerified) {
            return res.status(403).json({ message: 'Your email is not verified. Please verify your email first.' });
        }
        if (user.role === 'user' && !user.isApproved) {
            return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for confirmation.' });
        }
        generateToken(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userType: user.userType,
            vehicleNumber: user.vehicleNumber
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user and send OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, vehicleNumber, userType } = req.body;
        let user = await User.findOne({ email });

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (user) {
            if (user.isEmailVerified) {
                return res.status(400).json({ message: 'User already exists' });
            }
            // Update existing unverified user
            user.name = name;
            user.password = password;
            user.vehicleNumber = vehicleNumber;
            user.userType = userType || 'student';
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            // Create new unverified user
            user = await User.create({
                name,
                email,
                password,
                vehicleNumber,
                role: 'user',
                userType: userType || 'student',
                isApproved: false,
                isEmailVerified: false,
                otp,
                otpExpires
            });
        }

        // Send Email
        const message = `Welcome to SoloPark!\n\nYour OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.`;
        try {
            await sendEmail({
                to: user.email,
                subject: 'SoloPark - Email Verification OTP',
                text: message
            });
            res.status(201).json({ message: 'OTP sent to email. Please verify.', email: user.email });
        } catch (error) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Mark as verified
        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. Account is pending admin approval.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send Email
        const message = `Your new OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.`;
        try {
            await sendEmail({
                to: user.email,
                subject: 'SoloPark - Resend OTP',
                text: message
            });
            res.status(200).json({ message: 'New OTP sent to email' });
        } catch (error) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Check if email is already registered
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user) {
            // Allow registration if exists but not verified
            if (!user.isEmailVerified) {
                return res.json({ available: true, message: 'Email available (Verification pending)' });
            }
            return res.json({ available: false, message: 'Email already registered' });
        }
        return res.json({ available: true, message: 'Email available' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Forgot password — send reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Return success anyway to avoid email enumeration
            return res.status(200).json({ message: 'If that email is registered, a reset OTP has been sent.' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const message = `You requested a password reset for your SoloPark account.\n\nYour OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.`;
        try {
            await sendEmail({
                to: user.email,
                subject: 'SoloPark — Password Reset OTP',
                text: message
            });
        } catch {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }

        res.status(200).json({ message: 'If that email is registered, a reset OTP has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Reset password — verify OTP and set new password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please check the code sent to your email.' });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.password = newPassword;   // pre-save hook hashes it
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    checkEmail,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword
};
