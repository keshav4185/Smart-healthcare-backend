const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/response');

const getProfile = async (req, res) => {
  try {
    const data = await userService.fetchProfile(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = await userService.updateUserProfile(req.user._id, req.body);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return sendError(res, 'All fields are required', 400);
    if (newPassword.length < 8) return sendError(res, 'New password must be at least 8 characters', 400);
    await userService.changeUserPassword(req.user._id, currentPassword, newPassword);
    sendSuccess(res, { message: 'Password updated successfully' });
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No image uploaded', 400);
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const data = await userService.updateUserProfile(req.user._id, { profilePhoto: base64 });
    sendSuccess(res, { profilePhoto: data.profilePhoto });
  } catch (err) {
    sendError(res, err.message);
  }
};

module.exports = { getProfile, updateProfile, changePassword, uploadPhoto };
