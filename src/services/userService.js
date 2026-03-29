const User = require('../models/User');
const bcrypt = require('bcryptjs');

const RESTRICTED_FIELDS = ['password', 'role', 'refreshToken'];

const fetchProfile = async (userId) => {
  return User.findById(userId).select('-password -refreshToken');
};

const updateUserProfile = async (userId, body) => {
  RESTRICTED_FIELDS.forEach((f) => delete body[f]);
  return User.findByIdAndUpdate(userId, body, { new: true, runValidators: true })
    .select('-password -refreshToken');
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  user.password = newPassword;
  await user.save();
};

module.exports = { fetchProfile, updateUserProfile, changeUserPassword };
