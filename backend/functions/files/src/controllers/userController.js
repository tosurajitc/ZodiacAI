// backend/functions/files/src/controllers/userController.js
// User Authentication & Profile Controller for AstroAI Backend

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  conflictResponse,
  notFoundResponse,
  authSuccessResponse,
} = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name, phoneNumber } = req.body;

  // TODO: Check if user already exists in database
  // const existingUser = await User.findOne({ where: { email } });
  // if (existingUser) {
  //   return conflictResponse(res, 'User with this email already exists');
  // }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // TODO: Create user in database
  // const user = await User.create({
  //   id: uuidv4(),
  //   email,
  //   password: hashedPassword,
  //   name,
  //   phoneNumber,
  //   subscriptionTier: 'free',
  // });

  // Mock user data for now
  const user = {
    id: uuidv4(),
    email,
    name,
    phoneNumber,
    subscriptionTier: 'free',
    createdAt: new Date(),
  };

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );

  logger.logAuth('User registered', user.id, true, { email });

  return authSuccessResponse(
    res,
    'User registered successfully',
    user,
    token,
    refreshToken
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // TODO: Find user in database
  // const user = await User.findOne({ where: { email } });
  // if (!user) {
  //   return unauthorizedResponse(res, 'Invalid email or password');
  // }

  // Mock user data for now
  const user = {
    id: uuidv4(),
    email,
    name: 'Test User',
    password: await bcrypt.hash('password123', 10), // Mock hashed password
    phoneNumber: null,
    subscriptionTier: 'free',
    createdAt: new Date(),
  };

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.logAuth('Login failed', email, false, { reason: 'Invalid password' });
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );

  logger.logAuth('User logged in', user.id, true, { email });

  return authSuccessResponse(
    res,
    'Login successful',
    user,
    token,
    refreshToken
  );
});

/**
 * @desc    Google OAuth login
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return unauthorizedResponse(res, 'Google ID token is required');
  }

  // Verify Google token with Firebase
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  // TODO: Find or create user in database
  // let user = await User.findOne({ where: { email: decodedToken.email } });
  // if (!user) {
  //   user = await User.create({
  //     id: uuidv4(),
  //     email: decodedToken.email,
  //     name: decodedToken.name,
  //     subscriptionTier: 'free',
  //   });
  // }

  // Mock user data
  const user = {
    id: decodedToken.uid,
    email: decodedToken.email,
    name: decodedToken.name,
    phoneNumber: decodedToken.phone_number || null,
    subscriptionTier: 'free',
    createdAt: new Date(),
  };

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  logger.logAuth('Google OAuth login', user.id, true, { email: user.email });

  return authSuccessResponse(res, 'Google login successful', user, token);
});

/**
 * @desc    Facebook OAuth login
 * @route   POST /api/auth/facebook
 * @access  Public
 */
const facebookAuth = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return unauthorizedResponse(res, 'Facebook access token is required');
  }

  // TODO: Verify Facebook token and get user data
  // For now, return mock response

  const user = {
    id: uuidv4(),
    email: 'facebook-user@example.com',
    name: 'Facebook User',
    phoneNumber: null,
    subscriptionTier: 'free',
    createdAt: new Date(),
  };

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  logger.logAuth('Facebook OAuth login', user.id, true, { email: user.email });

  return authSuccessResponse(res, 'Facebook login successful', user, token);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.newAccessToken;
  const user = req.user;

  return successResponse(res, 'Token refreshed successfully', { token, user });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // TODO: Invalidate refresh token in database
  // await RefreshToken.destroy({ where: { userId: req.user.id } });

  logger.logAuth('User logged out', req.user.id, true);

  return successResponse(res, 'Logout successful');
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // TODO: Get user from database
  // const user = await User.findByPk(req.user.id);
  // if (!user) {
  //   return notFoundResponse(res, 'User');
  // }

  // Mock user data
  const user = {
    id: req.user.id,
    email: req.user.email,
    name: 'Test User',
    phoneNumber: null,
    subscriptionTier: req.user.subscriptionTier,
    createdAt: new Date(),
  };

  return successResponse(res, 'User profile retrieved', user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber, dateOfBirth, gender } = req.body;

  // TODO: Update user in database
  // const user = await User.findByPk(req.user.id);
  // if (!user) {
  //   return notFoundResponse(res, 'User');
  // }
  // await user.update({ name, phoneNumber, dateOfBirth, gender });

  // Mock updated user
  const user = {
    id: req.user.id,
    email: req.user.email,
    name: name || 'Test User',
    phoneNumber: phoneNumber || null,
    dateOfBirth: dateOfBirth || null,
    gender: gender || null,
    subscriptionTier: req.user.subscriptionTier,
  };

  logger.info('Profile updated', { userId: req.user.id });

  return successResponse(res, 'Profile updated successfully', user);
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // TODO: Get user from database and verify current password
  // const user = await User.findByPk(req.user.id);
  // const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  // if (!isPasswordValid) {
  //   return unauthorizedResponse(res, 'Current password is incorrect');
  // }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // TODO: Update password in database
  // await user.update({ password: hashedPassword });

  logger.logAuth('Password changed', req.user.id, true);

  return successResponse(res, 'Password changed successfully');
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // TODO: Generate reset token and send email
  // const resetToken = uuidv4();
  // await PasswordReset.create({ email, token: resetToken });
  // Send email with reset link

  logger.info('Password reset requested', { email });

  return successResponse(res, 'Password reset link sent to your email');
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // TODO: Verify token and reset password
  // const resetRecord = await PasswordReset.findOne({ where: { token } });
  // if (!resetRecord) {
  //   return unauthorizedResponse(res, 'Invalid or expired reset token');
  // }

  logger.info('Password reset completed');

  return successResponse(res, 'Password reset successful');
});

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  // TODO: Verify email token
  logger.info('Email verified');

  return successResponse(res, 'Email verified successfully');
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
const resendVerification = asyncHandler(async (req, res) => {
  // TODO: Send verification email
  logger.info('Verification email resent', { userId: req.user.id });

  return successResponse(res, 'Verification email sent');
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  // TODO: Delete user and all associated data
  // await User.destroy({ where: { id: req.user.id } });

  logger.logAuth('Account deleted', req.user.id, true);

  return successResponse(res, 'Account deleted successfully');
});

module.exports = {
  register,
  login,
  googleAuth,
  facebookAuth,
  refreshAccessToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  deleteAccount,
};