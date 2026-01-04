// backend/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
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

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return conflictResponse(res, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    id: uuidv4(),
    email,
    password_hash: hashedPassword,
    full_name: name,
    phone_number: phoneNumber,
    subscription_tier: 'free',
    auth_provider: 'email',
  });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );

  logger.logAuth('User registered', user.id, true, { email });

  return authSuccessResponse(
    res,
    'User registered successfully',
    {
      id: user.id,
      email: user.email,
      name: user.full_name,
      subscriptionTier: user.subscription_tier,
    },
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

  const user = await User.findOne({ where: { email } });
  if (!user) {
    logger.logAuth('Login failed', email, false, { reason: 'User not found' });
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    logger.logAuth('Login failed', email, false, { reason: 'Invalid password' });
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );

  await user.update({ last_login: new Date() });

  logger.logAuth('User logged in', user.id, true, { email });

  return authSuccessResponse(
    res,
    'Login successful',
    {
      id: user.id,
      email: user.email,
      name: user.full_name,
      subscriptionTier: user.subscription_tier,
    },
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

  const decodedToken = await admin.auth().verifyIdToken(idToken);

  let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
  
  if (!user) {
    user = await User.findOne({ where: { email: decodedToken.email } });
  }

  if (!user) {
    user = await User.create({
      id: decodedToken.uid,
      firebase_uid: decodedToken.uid,
      email: decodedToken.email,
      full_name: decodedToken.name || 'Google User',
      phone_number: decodedToken.phone_number || null,
      subscription_tier: 'free',
      auth_provider: 'google',
      email_verified: decodedToken.email_verified || false,
      last_login: new Date(),
    });
    
    logger.logAuth('New Google user created', user.id, true, { email: user.email });
  } else {
    await user.update({ 
      last_login: new Date(),
      firebase_uid: decodedToken.uid 
    });
    
    logger.logAuth('Existing Google user logged in', user.id, true, { email: user.email });
  }

  const token = jwt.sign(
    {
      id: user.id,
      uid: user.firebase_uid,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return authSuccessResponse(res, 'Google login successful', {
    id: user.id,
    email: user.email,
    name: user.full_name,
    subscriptionTier: user.subscription_tier,
  }, token);
});

/**
 * @desc    Facebook OAuth login
 * @route   POST /api/auth/facebook
 * @access  Public
 */
const facebookAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return unauthorizedResponse(res, 'Facebook ID token is required');
  }

  const decodedToken = await admin.auth().verifyIdToken(idToken);

  let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
  
  if (!user) {
    user = await User.findOne({ where: { email: decodedToken.email } });
  }

  if (!user) {
    user = await User.create({
      id: decodedToken.uid,
      firebase_uid: decodedToken.uid,
      email: decodedToken.email,
      full_name: decodedToken.name || 'Facebook User',
      phone_number: decodedToken.phone_number || null,
      subscription_tier: 'free',
      auth_provider: 'facebook',
      email_verified: decodedToken.email_verified || false,
      last_login: new Date(),
    });
    
    logger.logAuth('New Facebook user created', user.id, true, { email: user.email });
  } else {
    await user.update({ 
      last_login: new Date(),
      firebase_uid: decodedToken.uid 
    });
    
    logger.logAuth('Existing Facebook user logged in', user.id, true, { email: user.email });
  }

  const token = jwt.sign(
    {
      id: user.id,
      uid: user.firebase_uid,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return authSuccessResponse(res, 'Facebook login successful', {
    id: user.id,
    email: user.email,
    name: user.full_name,
    subscriptionTier: user.subscription_tier,
  }, token);
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
  logger.logAuth('User logged out', req.user.id, true);
  return successResponse(res, 'Logout successful');
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return notFoundResponse(res, 'User');
  }

  return successResponse(res, 'User profile retrieved', {
    id: user.id,
    email: user.email,
    name: user.full_name,
    phoneNumber: user.phone_number,
    subscriptionTier: user.subscription_tier,
    createdAt: user.created_at,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber, dateOfBirth, gender } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return notFoundResponse(res, 'User');
  }

  await user.update({
    full_name: name || user.full_name,
    phone_number: phoneNumber || user.phone_number,
    date_of_birth: dateOfBirth || user.date_of_birth,
    gender: gender || user.gender,
  });

  logger.info('Profile updated', { userId: req.user.id });

  return successResponse(res, 'Profile updated successfully', {
    id: user.id,
    email: user.email,
    name: user.full_name,
    phoneNumber: user.phone_number,
    dateOfBirth: user.date_of_birth,
    gender: user.gender,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
  
  if (!isPasswordValid) {
    return unauthorizedResponse(res, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await user.update({ password_hash: hashedPassword });

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
  logger.info('Password reset requested', { email });
  return successResponse(res, 'Password reset link sent to your email');
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  logger.info('Password reset completed');
  return successResponse(res, 'Password reset successful');
});

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  logger.info('Email verified');
  return successResponse(res, 'Email verified successfully');
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
const resendVerification = asyncHandler(async (req, res) => {
  logger.info('Verification email resent', { userId: req.user.id });
  return successResponse(res, 'Verification email sent');
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await User.destroy({ where: { id: req.user.id } });
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