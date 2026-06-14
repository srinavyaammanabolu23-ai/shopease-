const jwt = require('jsonwebtoken');

// Generate access token (short-lived)
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate refresh token (long-lived)
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

// Send token response with cookie
exports.sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = exports.generateAccessToken(user._id);
  const refreshToken = exports.generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions })
    .json({
      success: true,
      message,
      accessToken,
      refreshToken,
      user: user.toJSON ? user.toJSON() : user,
    });
};

// Generate OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};
