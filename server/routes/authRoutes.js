const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, checkEmail, verifyOtp, resendOtp, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Email verification routes
router.post('/check-email', checkEmail);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
