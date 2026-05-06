const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const { sendResetEmail } = require('../utils/emailService');
const { ROLES, DOCTOR_STATUS } = require('../constants/roles');

const registerUser = async (body, files = {}, host = '') => {
  const { name, email, password, role, phone, address,
    dob, bloodGroup, age, gender, specialty, licenseNumber, hospital,
    experience, education, certificate, fee } = body;

  if (await User.findOne({ email })) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }

  const toUrl = (fileArr) => {
    if (!fileArr?.[0]) return '';
    return `${host}/uploads/${fileArr[0].filename}`;
  };

  const userData = { name, email, password, role, phone, address };
  if (role === ROLES.PATIENT) Object.assign(userData, {
    dob,
    bloodGroup,
    age: age ? Number(age) : undefined,
    gender: gender || undefined,
  });
  if (role === ROLES.DOCTOR) {
    const documents = {
      degreeCertificate: toUrl(files.degreeCertificate),
      idProof: toUrl(files.idProof),
      selfieWithId: toUrl(files.selfieWithId),
    };
    Object.assign(userData, {
      specialty, licenseNumber, hospital, experience,
      education, certificate, fee,
      documents,
      profilePhoto: toUrl(files.profilePhoto),
      status: DOCTOR_STATUS.PENDING,
      verificationStatus: 'pending',
      isVerified: false,
    });
  }

  const user = await User.create(userData);
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.role === ROLES.DOCTOR && !user.isVerified) {
    const statusMsg = user.verificationStatus === 'rejected'
      ? 'Your account has been rejected by admin.'
      : 'Your account is pending admin approval. Please wait for verification.';
    const err = new Error(statusMsg);
    err.statusCode = 403;
    throw err;
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, isVerified: user.isVerified },
  };
};

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }
};

const forgotPassword = async (email) => {
  const genericMessage = { message: 'If an account with that email exists, a reset link has been sent.' };
  const user = await User.findOne({ email });
  if (!user) return genericMessage;

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const previewUrl = await sendResetEmail(email, token);
  return {
    ...genericMessage,
    ...(previewUrl && { previewUrl }),
  };
};

const resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const err = new Error('Reset link is invalid or has expired');
    err.statusCode = 400;
    throw err;
  }

  if (newPassword.length < 8) {
    const err = new Error('Password must be at least 8 characters');
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: 'Password reset successful' };
};

const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    const err = new Error('Refresh token required');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Refresh token invalid or expired');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    const err = new Error('Invalid refresh token');
    err.statusCode = 403;
    throw err;
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();
  return tokens;
};

module.exports = { registerUser, loginUser, logoutUser, refreshTokens, forgotPassword, resetPassword };
