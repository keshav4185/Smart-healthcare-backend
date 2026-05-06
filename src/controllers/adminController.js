const adminService = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await adminService.getAdminDashboard();
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const getDoctors = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const data = await adminService.getAllDoctors(status, Number(page), Number(limit));
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const updateDoctorStatus = async (req, res) => {
  try {
    const data = await adminService.setDoctorStatus(req.params.id, req.body.status);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

module.exports = { getDashboard, getDoctors, updateDoctorStatus };
