const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res) => {
  try {
    const host = `${req.protocol}://${req.get('host')}`;
    const data = await authService.registerUser(req.body, req.files || {}, host);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body.email, req.body.password);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logoutUser(req.body.refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const refresh = async (req, res) => {
  try {
    const data = await authService.refreshTokens(req.body.refreshToken);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const data = await authService.forgotPassword(req.body.email);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return sendError(res, 'Token and new password are required', 400);
    const data = await authService.resetPassword(token, newPassword);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

module.exports = { register, login, logout, refresh, forgotPassword, resetPassword };
