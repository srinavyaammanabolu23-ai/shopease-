const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendTokenResponse, generateOTP } = require('../utils/jwt');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      otp: { code: otp, expiresAt: otpExpiry },
    });

    // Send verification email
    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email with the OTP sent.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP (email verification or password reset)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, type = 'register' } = req.body;

    const user = await User.findOne({ email }).select('+otp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Clear OTP
    user.otp = undefined;

    if (type === 'register') {
      user.isVerified = true;
      await user.save();
      sendTokenResponse(user, 200, res, 'Email verified successfully! Welcome to ShopEase.');
    } else {
      // For password reset - just confirm OTP is valid
      user.resetPasswordToken = otp + '_verified_' + Date.now();
      await user.save();
      res.json({
        success: true,
        message: 'OTP verified. You can now reset your password.',
        resetToken: user.resetPasswordToken,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact support.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(email, user.name, otp);
    } catch (emailError) {
      user.otp = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.json({ success: true, message: 'Password reset OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({ email, resetPasswordToken: resetToken }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { email, type = 'register' } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save({ validateBeforeSave: false });

    if (type === 'register') {
      await sendOTPEmail(email, user.name, otp);
    } else {
      await sendPasswordResetEmail(email, user.name, otp);
    }

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    sendTokenResponse(user, 200, res, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};
