const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
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

module.exports = { register, login, logout, refresh };
