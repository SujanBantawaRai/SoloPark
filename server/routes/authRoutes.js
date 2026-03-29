const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, checkEmail } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Email verification routes
router.post('/check-email', checkEmail);

module.exports = router;
