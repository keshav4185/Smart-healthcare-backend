const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const { ROLES, DOCTOR_STATUS } = require('../constants/roles');

const registerUser = async (body) => {
  const { name, email, password, role, phone, address,
    dob, bloodGroup, specialty, licenseNumber, hospital,
    experience, education, certificate, fee } = body;

  if (await User.findOne({ email })) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }

  const userData = { name, email, password, role, phone, address };
  if (role === ROLES.PATIENT) Object.assign(userData, { dob, bloodGroup });
  if (role === ROLES.DOCTOR) Object.assign(userData, {
    specialty, licenseNumber, hospital, experience,
    education, certificate, fee, status: DOCTOR_STATUS.PENDING,
  });

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

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
  };
};

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }
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

module.exports = { registerUser, loginUser, logoutUser, refreshTokens };
