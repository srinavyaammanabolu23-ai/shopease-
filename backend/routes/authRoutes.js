const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe, verifyOTP, resendOTP,
  forgotPassword, resetPassword, refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
