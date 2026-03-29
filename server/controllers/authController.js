const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, vehicleNumber, userType } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        vehicleNumber,
        role: 'user',
        userType: userType || 'student',
        isApproved: false
    });

    if (user) {
        // DO NOT generate token here because new users are pending admin approval
        res.status(201).json({
            message: 'Registration successful! Your account is pending admin approval.',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userType: user.userType,
            vehicleNumber: user.vehicleNumber
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
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
            return res.json({ available: false, message: 'Email already registered' });
        }
        return res.json({ available: true, message: 'Email available' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    checkEmail
};
